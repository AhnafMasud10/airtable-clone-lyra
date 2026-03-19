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
import { createId } from "@paralleldrive/cuid2";

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

function templateValueForField(
  field: FieldRow,
  rowIndex: number,
  templates: Map<string, string[]>,
): string {
  const templateValues = templates.get(field.id);
  if (!templateValues?.length) return "";

  const idx = rowIndex % templateValues.length;
  const base = templateValues[idx]!;

  if (rowIndex < templateValues.length) return base;

  if (field.type === "NUMBER") {
    const num = parseInt(base, 10) || 0;
    return String(num + (rowIndex % 1000));
  }
  if (field.type === "DATE") {
    const d = new Date(base);
    d.setDate(d.getDate() + (rowIndex % 365));
    return d.toISOString().split("T")[0] ?? base;
  }
  return `${base} ${rowIndex + 1}`;
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
            {
              tableId: createdTable.id,
              name: "Number",
              type: "NUMBER",
              order: 1,
            },
          ],
        });

        const createdRecords = await tx.record.createManyAndReturn({
          data: Array.from({ length: input.defaultRowCount }, (_, index) => ({
            tableId: createdTable.id,
            order: index,
          })),
        });

        const nameField = createdFields.find((field) => field.order === 0);
        const numberField = createdFields.find((field) => field.order === 1);

        if (nameField && numberField) {
          const cells = createdRecords.flatMap((record) => [
            {
              recordId: record.id,
              fieldId: nameField.id,
              value: faker.person.fullName(),
            },
            {
              recordId: record.id,
              fieldId: numberField.id,
              value: String(faker.number.int({ min: 1, max: 1000 })),
            },
          ]);

          if (cells.length > 0) {
            await tx.cell.createMany({ data: cells });
          }
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

      const TEMPLATE_SIZE = Math.min(1000, count);
      const templates = new Map<string, string[]>();
      for (const field of fields) {
        const values: string[] = [];
        for (let i = 0; i < TEMPLATE_SIZE; i++) {
          values.push(fakerValueForField(field));
        }
        templates.set(field.id, values);
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const RECORD_BATCH = 5000;
        const CELL_BATCH = 2000;

        const now = new Date();

        for (let i = 0; i < count; i += RECORD_BATCH) {
          const batchSize = Math.min(RECORD_BATCH, count - i);
          const ids = Array.from({ length: batchSize }, () => createId());
          const orders = Array.from(
            { length: batchSize },
            (_, k) => startOrder + i + k,
          );
          const recParams: unknown[] = [];
          const recPh: string[] = [];
          for (let k = 0; k < batchSize; k++) {
            recPh.push(`($${recParams.length + 1}, $${recParams.length + 2}, $${recParams.length + 3}, $${recParams.length + 4}, $${recParams.length + 5})`);
            recParams.push(ids[k], input.tableId, orders[k], now, now);
          }
          await client.query(
            `INSERT INTO "Record" (id, "tableId", "order", "createdAt", "updatedAt") VALUES ${recPh.join(", ")}`,
            recParams,
          );

          const cells: { id: string; recordId: string; fieldId: string; value: string }[] = [];
          for (let r = 0; r < batchSize; r++) {
            const recordId = ids[r]!;
            const rowIndex = i + r;
            for (const field of fields) {
              cells.push({
                id: createId(),
                recordId,
                fieldId: field.id,
                value: templateValueForField(field, rowIndex, templates),
              });
            }
          }

          for (let c = 0; c < cells.length; c += CELL_BATCH) {
            const cellBatch = cells.slice(c, c + CELL_BATCH);
            const cellParams: unknown[] = [];
            const cellPh: string[] = [];
            for (const cell of cellBatch) {
              cellPh.push(`($${cellParams.length + 1}, $${cellParams.length + 2}, $${cellParams.length + 3}, $${cellParams.length + 4}, $${cellParams.length + 5}, $${cellParams.length + 6})`);
              cellParams.push(cell.id, cell.recordId, cell.fieldId, cell.value ?? "", now, now);
            }
            await client.query(
              `INSERT INTO "Cell" (id, "recordId", "fieldId", value, "createdAt", "updatedAt") VALUES ${cellPh.join(", ")}`,
              cellParams,
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
          : await ctx.db.record.findMany({
              where: { id: { in: rowIds } },
              include: { cells: true },
            });

      const recordMap = new Map(records.map((record) => [record.id, record]));
      const orderedRecords = rowIds
        .map((id) => recordMap.get(id))
        .filter((record): record is NonNullable<typeof record> =>
          Boolean(record),
        );

      const nextCursor =
        fromEnd ? null : hasMore && lastRow
          ? { lastOrder: lastRow.order, lastId: lastRow.id }
          : null;

      return {
        rows: orderedRecords,
        fields: fields.filter(
          (field) => !input.hiddenFieldIds.includes(field.id),
        ),
        nextCursor,
        total: totalRows?.[0]?.count ?? 0,
      };
    }),
});
