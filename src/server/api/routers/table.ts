import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { faker } from "@faker-js/faker";
import { Prisma } from "../../../../generated/prisma";
import type { z } from "zod";
import {
  type GridFilterSchema,
  GridQueryInputSchema,
  GridWindowOutputSchema,
  TableBulkInsertRowsInputSchema,
  TableBulkInsertRowsOutputSchema,
  TableClearDataInputSchema,
  TableCreateInputSchema,
  TableCreateOutputSchema,
  TableCreateWithDefaultsInputSchema,
  TableDeleteInputSchema,
  TableDetailSchema,
  TableDuplicateInputSchema,
  TableGetByIdInputSchema,
  TableListByBaseInputSchema,
  TableSeedInputSchema,
  TableSummarySchema,
  TableUpdateInputSchema,
} from "~/types/base-table";

import { assertBaseOwnership, assertTableAccess, assertTableAccessRaw } from "../auth-helpers";
import { pool } from "~/server/db";

const numberRegex = String.raw`^-?[0-9]+(\.[0-9]+)?$`;

function textFilterSql(filter: z.infer<typeof GridFilterSchema>) {
  if (filter.type !== "text") return null;
  const { fieldId, op, value } = filter;

  // Skip value-based filters when value is blank — don't treat empty as "filter for empty"
  const valueRequired = ["contains", "not_contains", "equals"].includes(op);
  if (valueRequired && (value === undefined || String(value).trim() === "")) {
    return null;
  }

  if (op === "is_empty") {
    return Prisma.sql`
      NOT EXISTS (
        SELECT 1 FROM "Cell" c
        WHERE c."recordId" = r.id
          AND c."fieldId" = ${fieldId}
          AND COALESCE(c.value, '') <> ''
      )
    `;
  }
  if (op === "is_not_empty") {
    return Prisma.sql`
      EXISTS (
        SELECT 1 FROM "Cell" c
        WHERE c."recordId" = r.id
          AND c."fieldId" = ${fieldId}
          AND COALESCE(c.value, '') <> ''
      )
    `;
  }
  if (op === "contains") {
    return Prisma.sql`
      EXISTS (
        SELECT 1 FROM "Cell" c
        WHERE c."recordId" = r.id
          AND c."fieldId" = ${fieldId}
          AND COALESCE(c.value, '') ILIKE ${`%${value ?? ""}%`}
      )
    `;
  }
  if (op === "not_contains") {
    return Prisma.sql`
      NOT EXISTS (
        SELECT 1 FROM "Cell" c
        WHERE c."recordId" = r.id
          AND c."fieldId" = ${fieldId}
          AND COALESCE(c.value, '') ILIKE ${`%${value ?? ""}%`}
      )
    `;
  }

  return Prisma.sql`
    EXISTS (
      SELECT 1 FROM "Cell" c
      WHERE c."recordId" = r.id
        AND c."fieldId" = ${fieldId}
        AND COALESCE(c.value, '') = ${value ?? ""}
    )
  `;
}

function numberFilterSql(filter: z.infer<typeof GridFilterSchema>) {
  if (filter.type !== "number") return null;
  const { fieldId, op, value } = filter;

  // Skip value-based filters when value is blank
  const valueRequired = ["eq", "gt", "lt", "gte", "lte"].includes(op);
  if (valueRequired && (value === undefined || value === null)) {
    return null;
  }

  if (op === "is_empty") {
    return Prisma.sql`
      NOT EXISTS (
        SELECT 1 FROM "Cell" c
        WHERE c."recordId" = r.id
          AND c."fieldId" = ${fieldId}
          AND COALESCE(c.value, '') <> ''
      )
    `;
  }
  if (op === "is_not_empty") {
    return Prisma.sql`
      EXISTS (
        SELECT 1 FROM "Cell" c
        WHERE c."recordId" = r.id
          AND c."fieldId" = ${fieldId}
          AND COALESCE(c.value, '') <> ''
      )
    `;
  }

  let comparator = Prisma.sql`=`;
  if (op === "gt") comparator = Prisma.sql`>`;
  else if (op === "lt") comparator = Prisma.sql`<`;
  else if (op === "gte") comparator = Prisma.sql`>=`;
  else if (op === "lte") comparator = Prisma.sql`<=`;

  return Prisma.sql`
    EXISTS (
      SELECT 1 FROM "Cell" c
      WHERE c."recordId" = r.id
        AND c."fieldId" = ${fieldId}
        AND c.value ~ ${numberRegex}
        AND (c.value::double precision ${comparator} ${value ?? 0})
    )
  `;
}

function buildSortSql(sorts: z.infer<typeof GridQueryInputSchema>["sorts"]) {
  if (sorts.length === 0) {
    return Prisma.sql`ORDER BY r."order" ASC, r.id ASC`;
  }

  const expressions = sorts.map((sort) => {
    const direction =
      sort.direction === "desc" ? Prisma.raw("DESC") : Prisma.raw("ASC");
    if (sort.type === "number") {
      return Prisma.sql`
        (
          SELECT CASE
            WHEN c.value ~ ${numberRegex} THEN c.value::double precision
            ELSE NULL
          END
          FROM "Cell" c
          WHERE c."recordId" = r.id
            AND c."fieldId" = ${sort.fieldId}
          LIMIT 1
        ) ${direction} NULLS LAST
      `;
    }

    return Prisma.sql`
      LOWER(
        COALESCE(
          (
            SELECT c.value
            FROM "Cell" c
            WHERE c."recordId" = r.id
              AND c."fieldId" = ${sort.fieldId}
            LIMIT 1
          ),
          ''
        )
      ) ${direction}
    `;
  });

  return Prisma.sql`ORDER BY ${Prisma.join(expressions, ", ")}, r."order" ASC, r.id ASC`;
}

type FieldRow = { id: string; name: string; type: string; order: number };

function fakerValueForField(field: FieldRow): string {
  const name = field.name.toLowerCase();
  if (field.type === "NUMBER")
    return String(faker.number.int({ min: 1000, max: 500000 }));
  if (field.type === "DATE")
    return faker.date.past({ years: 3 }).toISOString().split("T")[0]!;
  if (field.type === "BOOLEAN") return faker.datatype.boolean() ? "true" : "false";
  if (field.type === "LONG_TEXT") return faker.lorem.sentence();
  if (name.includes("email")) return faker.internet.email();
  if (name.includes("phone")) return faker.phone.number();
  if (name.includes("company")) return faker.company.name();
  if (name.includes("name")) return faker.person.fullName();
  if (name.includes("status"))
    return faker.helpers.arrayElement(["Active", "Inactive", "Pending", "Churned", "Trial"]);
  if (name.includes("revenue"))
    return String(faker.number.int({ min: 1000, max: 500000 }));
  if (name.includes("note")) return faker.lorem.sentence();
  return faker.word.words({ count: { min: 1, max: 3 } });
}


export const tableRouter = createTRPCRouter({
  listByBase: protectedProcedure
    .input(TableListByBaseInputSchema)
    .output(TableSummarySchema.array())
    .query(async ({ ctx, input }) => {
      await assertBaseOwnership(ctx.db, input.baseId, ctx.session.user.id);
      return ctx.db.table.findMany({
        where: { baseId: input.baseId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
        },
      });
    }),

  getById: protectedProcedure
    .input(TableGetByIdInputSchema)
    .output(TableDetailSchema.nullable())
    .query(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
      return ctx.db.table.findUnique({
        where: { id: input.tableId },
        include: {
          views: {
            orderBy: { createdAt: "asc" },
          },
          fields: {
            orderBy: { order: "asc" },
          },
          records: {
            include: {
              cells: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(TableCreateInputSchema)
    .output(TableCreateOutputSchema)
    .mutation(async ({ ctx, input }) => {
      await assertBaseOwnership(ctx.db, input.baseId, ctx.session.user.id);
      const createdTable = await ctx.db.table.create({
        data: {
          name: input.name,
          baseId: input.baseId,
        },
      });

      await ctx.db.view.create({
        data: {
          tableId: createdTable.id,
          name: "Grid view",
          type: "GRID",
        },
      });

      return createdTable;
    }),

  createWithDefaults: protectedProcedure
    .input(TableCreateWithDefaultsInputSchema)
    .output(TableCreateOutputSchema)
    .mutation(async ({ ctx, input }) => {
      await assertBaseOwnership(ctx.db, input.baseId, ctx.session.user.id);
      return ctx.db.$transaction(async (tx) => {
        const createdTable = await tx.table.create({
          data: {
            name: input.name,
            baseId: input.baseId,
          },
        });

        await tx.view.create({
          data: {
            tableId: createdTable.id,
            name: "Grid view",
            type: "GRID",
          },
        });

        const createdFields = await tx.field.createManyAndReturn({
          data: [
            { tableId: createdTable.id, name: "Name", type: "TEXT", order: 0 },
            { tableId: createdTable.id, name: "Notes", type: "TEXT", order: 1 },
            { tableId: createdTable.id, name: "Status", type: "TEXT", order: 2 },
          ],
        });

        const createdRecords = await tx.record.createManyAndReturn({
          data: Array.from({ length: input.defaultRowCount }, (_, index) => ({
            tableId: createdTable.id,
            order: index,
          })),
        });

        if (createdFields.length > 0 && createdRecords.length > 0) {
          const cells = createdRecords.flatMap((record) =>
            createdFields.map((field) => ({
              recordId: record.id,
              fieldId: field.id,
              value: "",
            })),
          );
          await tx.cell.createMany({ data: cells });
        }

        return createdTable;
      });
    }),

  seedTable: protectedProcedure
    .input(TableSeedInputSchema)
    .output(TableCreateOutputSchema)
    .mutation(async ({ ctx, input }) => {
      await assertBaseOwnership(ctx.db, input.baseId, ctx.session.user.id);
      return ctx.db.$transaction(async (tx) => {
        const createdTable = await tx.table.create({
          data: { name: input.name, baseId: input.baseId },
        });

        await tx.view.create({
          data: { tableId: createdTable.id, name: "Grid view", type: "GRID" },
        });

        const fieldDefs = [
          { name: "Name", type: "TEXT" as const, order: 0 },
          { name: "Email", type: "TEXT" as const, order: 1 },
          { name: "Company", type: "TEXT" as const, order: 2 },
          { name: "Phone", type: "TEXT" as const, order: 3 },
          { name: "Revenue", type: "NUMBER" as const, order: 4 },
          { name: "Status", type: "TEXT" as const, order: 5 },
          { name: "Date Joined", type: "DATE" as const, order: 6 },
          { name: "Notes", type: "LONG_TEXT" as const, order: 7 },
        ];

        const createdFields = await tx.field.createManyAndReturn({
          data: fieldDefs.map((f) => ({
            tableId: createdTable.id,
            name: f.name,
            type: f.type,
            order: f.order,
          })),
        });

        const fieldMap = new Map(createdFields.map((f) => [f.name, f.id]));
        const statuses = ["Active", "Inactive", "Pending", "Churned", "Trial"];

        const createdRecords = await tx.record.createManyAndReturn({
          data: Array.from({ length: 30 }, (_, i) => ({
            tableId: createdTable.id,
            order: i,
          })),
        });

        const cells = createdRecords.flatMap((record) => [
          { recordId: record.id, fieldId: fieldMap.get("Name")!, value: faker.person.fullName() },
          { recordId: record.id, fieldId: fieldMap.get("Email")!, value: faker.internet.email() },
          { recordId: record.id, fieldId: fieldMap.get("Company")!, value: faker.company.name() },
          { recordId: record.id, fieldId: fieldMap.get("Phone")!, value: faker.phone.number() },
          { recordId: record.id, fieldId: fieldMap.get("Revenue")!, value: String(faker.number.int({ min: 1000, max: 500000 })) },
          { recordId: record.id, fieldId: fieldMap.get("Status")!, value: statuses[Math.floor(Math.random() * statuses.length)]! },
          { recordId: record.id, fieldId: fieldMap.get("Date Joined")!, value: faker.date.past({ years: 3 }).toISOString().split("T")[0]! },
          { recordId: record.id, fieldId: fieldMap.get("Notes")!, value: faker.lorem.sentence() },
        ]);

        await tx.cell.createMany({ data: cells });

        return createdTable;
      });
    }),

  bulkInsertRows: protectedProcedure
    .input(TableBulkInsertRowsInputSchema)
    .output(TableBulkInsertRowsOutputSchema)
    .mutation(async ({ ctx, input }) => {
      await assertTableAccessRaw(pool, input.tableId, ctx.session.user.id);

      const fieldsResult = await pool.query<FieldRow>(
        `SELECT id, name, type, "order" FROM "Field" WHERE "tableId" = $1 ORDER BY "order" ASC`,
        [input.tableId],
      );
      const fields = fieldsResult.rows;
      if (fields.length === 0) return { inserted: 0 };

      let startOrder: number;
      if (input.startOrder !== undefined) {
        startOrder = input.startOrder;
      } else {
        const maxOrderResult = await pool.query<{ max: number | null }>(
          `SELECT MAX("order") as max FROM "Record" WHERE "tableId" = $1`,
          [input.tableId],
        );
        startOrder = (maxOrderResult.rows[0]?.max ?? -1) + 1;
      }
      const count = input.count;

      // Pre-generate 1000 faker template values per field as flat arrays for fast indexing.
      // fieldTemplates[fieldIdx][rowIdx % TEMPLATE_SIZE] = value string
      const TEMPLATE_SIZE = Math.min(1000, count);
      const fieldTemplates: string[][] = [];
      const fieldIds: string[] = [];
      for (const field of fields) {
        fieldIds.push(field.id);
        const values: string[] = new Array<string>(TEMPLATE_SIZE);
        for (let i = 0; i < TEMPLATE_SIZE; i++) {
          values[i] = fakerValueForField(field);
        }
        fieldTemplates.push(values);
      }
      const numFields = fields.length;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(`
          SET LOCAL synchronous_commit = off;
          SET LOCAL work_mem = '256MB';
          SET LOCAL maintenance_work_mem = '256MB';
        `);

        // Process in batches of 25K records.
        // Each batch: 1 record INSERT (generate_series) + 1 cell INSERT (unnest).
        // For 50K input: 2 iterations * 2 queries = 4 SQL queries per tRPC call.
        const RECORD_BATCH = 10000;
        const CELL_BATCH = 100000;

        for (let i = 0; i < count; i += RECORD_BATCH) {
          const batchSize = Math.min(RECORD_BATCH, count - i);
          const batchStartOrder = startOrder + i;
          const batchEndOrder = batchStartOrder + batchSize - 1;

          // Insert records: gen_random_uuid() for IDs, generate_series for orders.
          // Zero JavaScript ID generation. One query for up to 25K records.
          const recordResult = await client.query<{ id: string; order: number }>(
            `INSERT INTO "Record" (id, "tableId", "order", "createdAt", "updatedAt")
             SELECT gen_random_uuid()::text, $1::text, s, NOW(), NOW()
             FROM generate_series($2::integer, $3::integer) AS s
             RETURNING id, "order"`,
            [input.tableId, batchStartOrder, batchEndOrder],
          );

          // Build cell arrays for unnest — flat array indexing, no Map lookups
          const totalCells = batchSize * numFields;
          let rids = new Array<string>(Math.min(totalCells, CELL_BATCH));
          let fids = new Array<string>(Math.min(totalCells, CELL_BATCH));
          let vals = new Array<string>(Math.min(totalCells, CELL_BATCH));
          let pos = 0;

          for (const rec of recordResult.rows) {
            const rowIndex = rec.order - startOrder;
            const tplIdx = rowIndex % TEMPLATE_SIZE;
            const suffix = rowIndex >= TEMPLATE_SIZE ? ` ${rowIndex + 1}` : "";
            for (let f = 0; f < numFields; f++) {
              rids[pos] = rec.id;
              fids[pos] = fieldIds[f]!;
              const base = fieldTemplates[f]![tplIdx]!;
              // For rows beyond template size, append index for uniqueness.
              // NUMBER/DATE fields get numeric variation instead.
              if (rowIndex < TEMPLATE_SIZE) {
                vals[pos] = base;
              } else {
                const ftype = fields[f]!.type;
                if (ftype === "NUMBER") {
                  vals[pos] = String((parseInt(base, 10) || 0) + (rowIndex % 1000));
                } else if (ftype === "DATE") {
                  // Reuse base date string, vary day offset
                  const d = new Date(base);
                  d.setDate(d.getDate() + (rowIndex % 365));
                  vals[pos] = d.toISOString().split("T")[0] ?? base;
                } else {
                  vals[pos] = base + suffix;
                }
              }
              pos++;

              if (pos >= CELL_BATCH) {
                await client.query(
                  `INSERT INTO "Cell" (id, "recordId", "fieldId", value, "createdAt", "updatedAt")
                   SELECT gen_random_uuid()::text, u.rid, u.fid, u.val, NOW(), NOW()
                   FROM unnest($1::text[], $2::text[], $3::text[]) AS u(rid, fid, val)`,
                  [rids.slice(0, pos), fids.slice(0, pos), vals.slice(0, pos)],
                );
                // Reset for next chunk
                rids = new Array<string>(Math.min(totalCells - pos, CELL_BATCH));
                fids = new Array<string>(Math.min(totalCells - pos, CELL_BATCH));
                vals = new Array<string>(Math.min(totalCells - pos, CELL_BATCH));
                pos = 0;
              }
            }
          }

          // Flush remaining cells
          if (pos > 0) {
            await client.query(
              `INSERT INTO "Cell" (id, "recordId", "fieldId", value, "createdAt", "updatedAt")
               SELECT gen_random_uuid()::text, u.rid, u.fid, u.val, NOW(), NOW()
               FROM unnest($1::text[], $2::text[], $3::text[]) AS u(rid, fid, val)`,
              [rids.slice(0, pos), fids.slice(0, pos), vals.slice(0, pos)],
            );
          }
        }

        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }

      return { inserted: count, startOrder };
    }),

  update: protectedProcedure
    .input(TableUpdateInputSchema)
    .output(TableSummarySchema)
    .mutation(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
      const updated = await ctx.db.table.update({
        where: { id: input.tableId },
        data: {
          ...(input.name ? { name: input.name } : {}),
        },
        select: { id: true, name: true },
      });
      return updated;
    }),

  delete: protectedProcedure
    .input(TableDeleteInputSchema)
    .output(TableDeleteInputSchema)
    .mutation(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
      await ctx.db.table.delete({ where: { id: input.tableId } });
      return { tableId: input.tableId };
    }),

  duplicate: protectedProcedure
    .input(TableDuplicateInputSchema)
    .output(TableCreateOutputSchema)
    .mutation(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
      const source = await ctx.db.table.findUniqueOrThrow({
        where: { id: input.tableId },
        include: {
          fields: { orderBy: { order: "asc" } },
          views: { orderBy: { createdAt: "asc" } },
          records: {
            orderBy: { order: "asc" },
            include: { cells: true },
          },
        },
      });

      return ctx.db.$transaction(async (tx) => {
        const newTable = await tx.table.create({
          data: { name: input.name, baseId: source.baseId },
        });

        // Duplicate fields and build old→new field ID map
        const fieldIdMap = new Map<string, string>();
        if (source.fields.length > 0) {
          const newFields = await tx.field.createManyAndReturn({
            data: source.fields.map((f) => ({
              tableId: newTable.id,
              name: f.name,
              type: f.type,
              order: f.order,
              options: f.options ?? undefined,
            })),
          });
          // Map by order since createManyAndReturn preserves insertion order
          for (let i = 0; i < source.fields.length; i++) {
            fieldIdMap.set(source.fields[i]!.id, newFields[i]!.id);
          }
        }

        // Duplicate views
        if (source.views.length > 0) {
          await tx.view.createMany({
            data: source.views.map((v) => ({
              tableId: newTable.id,
              name: v.name,
              type: v.type,
            })),
          });
        } else {
          await tx.view.create({
            data: { tableId: newTable.id, name: "Grid view", type: "GRID" },
          });
        }

        // Duplicate records and cells
        if (source.records.length > 0) {
          const newRecords = await tx.record.createManyAndReturn({
            data: source.records.map((r) => ({
              tableId: newTable.id,
              order: r.order,
            })),
          });

          const cells: { recordId: string; fieldId: string; value: string | null }[] = [];
          for (let i = 0; i < source.records.length; i++) {
            const oldRecord = source.records[i]!;
            const newRecord = newRecords[i]!;
            for (const cell of oldRecord.cells) {
              const newFieldId = fieldIdMap.get(cell.fieldId);
              if (newFieldId) {
                cells.push({
                  recordId: newRecord.id,
                  fieldId: newFieldId,
                  value: cell.value,
                });
              }
            }
          }

          // Insert cells in chunks to stay under PG param limit
          const CELL_CHUNK = 3000;
          for (let c = 0; c < cells.length; c += CELL_CHUNK) {
            await tx.cell.createMany({
              data: cells.slice(c, c + CELL_CHUNK),
            });
          }
        }

        return newTable;
      });
    }),

  clearData: protectedProcedure
    .input(TableClearDataInputSchema)
    .output(TableClearDataInputSchema)
    .mutation(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
      // Raw SQL for fast bulk delete (cells cascade via FK onDelete)
      await pool.query(`DELETE FROM "Record" WHERE "tableId" = $1`, [
        input.tableId,
      ]);
      // Reclaim disk space — critical for Neon's 512MB free tier limit
      await pool.query(`VACUUM "Cell"`);
      await pool.query(`VACUUM "Record"`);
      return { tableId: input.tableId };
    }),

  getGridWindow: protectedProcedure
    .input(GridQueryInputSchema)
    .output(GridWindowOutputSchema)
    .query(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
      const whereClauses: Prisma.Sql[] = [
        Prisma.sql`r."tableId" = ${input.tableId}`,
      ];

      if (input.globalSearch?.trim()) {
        whereClauses.push(Prisma.sql`
          EXISTS (
            SELECT 1 FROM "Cell" c
            WHERE c."recordId" = r.id
              AND COALESCE(c.value, '') ILIKE ${`%${input.globalSearch.trim()}%`}
          )
        `);
      }

      const filterClauses: { sql: Prisma.Sql; conjunction: "and" | "or" }[] =
        [];
      for (const filter of input.filters) {
        const clause =
          filter.type === "text"
            ? textFilterSql(filter)
            : numberFilterSql(filter);
        if (clause)
          filterClauses.push({
            sql: clause,
            conjunction: filter.conjunction ?? "and",
          });
      }
      if (filterClauses.length > 0) {
        let combined = filterClauses[0]!.sql;
        for (let i = 1; i < filterClauses.length; i++) {
          const { sql, conjunction } = filterClauses[i]!;
          combined =
            conjunction === "or"
              ? Prisma.sql`(${combined}) OR (${sql})`
              : Prisma.sql`(${combined}) AND (${sql})`;
        }
        whereClauses.push(Prisma.sql`(${combined})`);
      }

      const whereSql = Prisma.sql`WHERE ${Prisma.join(whereClauses, " AND ")}`;
      const sortSql = buildSortSql(input.sorts);
      const cursor = input.cursor;
      const fromEnd =
        typeof cursor === "object" &&
        cursor !== null &&
        "fromEnd" in cursor &&
        cursor.fromEnd === true;
      const keysetCursor =
        typeof cursor === "object" &&
        cursor !== null &&
        "lastOrder" in cursor &&
        "lastId" in cursor
          ? cursor
          : null;
      const useKeyset = keysetCursor !== null && input.sorts.length === 0;
      const limitWithPeek = input.limit + 1;

      let idQuery: ReturnType<typeof Prisma.sql>;
      if (fromEnd && input.sorts.length === 0) {
        idQuery = Prisma.sql`
          SELECT r.id, r."order"
          FROM "Record" r
          ${whereSql}
          ORDER BY r."order" DESC, r.id DESC
          LIMIT ${input.limit}
        `;
      } else if (useKeyset && keysetCursor) {
        idQuery = Prisma.sql`
            SELECT r.id, r."order"
            FROM "Record" r
            ${whereSql}
            AND (r."order", r.id) > (${keysetCursor.lastOrder}, ${keysetCursor.lastId})
            ${sortSql}
            LIMIT ${limitWithPeek}
          `;
      } else {
        idQuery = Prisma.sql`
            SELECT r.id, r."order"
            FROM "Record" r
            ${whereSql}
            ${sortSql}
            OFFSET ${typeof cursor === "number" ? cursor : 0}
            LIMIT ${limitWithPeek}
          `;
      }

      const isFirstPage =
        !fromEnd && !useKeyset && (typeof cursor !== "number" || cursor === 0);
      const needsTotal = isFirstPage || fromEnd;

      const [idRows, totalRows, fields] = await Promise.all([
        ctx.db.$queryRaw<Array<{ id: string; order: number }>>(idQuery),
        needsTotal
          ? ctx.db.$queryRaw<Array<{ count: number }>>(
              Prisma.sql`
                SELECT CAST(COUNT(*) AS INTEGER) AS count
                FROM "Record" r
                ${whereSql}
              `,
            )
          : Promise.resolve(null),
        ctx.db.field.findMany({
          where: { tableId: input.tableId },
          orderBy: { order: "asc" },
        }),
      ]);

      const hasMore = !fromEnd && idRows.length > input.limit;
      let pageRows = hasMore ? idRows.slice(0, input.limit) : idRows;
      if (fromEnd) {
        pageRows = [...pageRows].reverse();
      }
      const rowIds = pageRows.map((row) => row.id);
      const lastRow = pageRows[pageRows.length - 1];

      const records =
        rowIds.length === 0
          ? []
          : await (async () => {
              // Single raw SQL query to get records + cells, avoiding Prisma ORM overhead
              const placeholders = rowIds.map((_, i) => `$${i + 1}`).join(",");
              const cellRows = await pool.query<{
                id: string;
                recordId: string;
                fieldId: string;
                value: string | null;
              }>(
                `SELECT id, "recordId", "fieldId", value FROM "Cell" WHERE "recordId" IN (${placeholders})`,
                rowIds,
              );

              // Group cells by recordId
              const cellsByRecord = new Map<string, Array<{ id: string; recordId: string; fieldId: string; value: string | null }>>();
              for (const cell of cellRows.rows) {
                let arr = cellsByRecord.get(cell.recordId);
                if (!arr) {
                  arr = [];
                  cellsByRecord.set(cell.recordId, arr);
                }
                arr.push(cell);
              }

              // Build record objects matching the expected shape
              return pageRows.map((row) => ({
                id: row.id,
                tableId: input.tableId,
                order: row.order,
                cells: cellsByRecord.get(row.id) ?? [],
              }));
            })();

      // Records are already in order from pageRows, no need to re-sort
      const orderedRecords = records;

      const nextCursor =
        fromEnd ? null : hasMore && lastRow
          ? { lastOrder: lastRow.order, lastId: lastRow.id }
          : null;

      return {
        rows: orderedRecords,
        fields,
        nextCursor,
        total: totalRows?.[0]?.count ?? 0,
      };
    }),
});
