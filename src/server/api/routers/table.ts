import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { faker } from "@faker-js/faker";
import { Prisma } from "../../../../generated/prisma";
import { z } from "zod";
import {
  GridFilterSchema,
  GridQueryInputSchema,
  GridWindowOutputSchema,
  TableBulkInsertRowsInputSchema,
  TableBulkInsertRowsOutputSchema,
  TableCreateInputSchema,
  TableCreateOutputSchema,
  TableCreateWithDefaultsInputSchema,
  TableDetailSchema,
  TableGetByIdInputSchema,
  TableListByBaseInputSchema,
  TableSummarySchema,
} from "~/types/base-table";

const numberRegex = String.raw`^-?[0-9]+(\.[0-9]+)?$`;

function textFilterSql(filter: z.infer<typeof GridFilterSchema>) {
  if (filter.type !== "text") return null;
  const { fieldId, op, value } = filter;
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

function sampleValueForField(type: string) {
  if (type === "NUMBER")
    return String(faker.number.int({ min: 0, max: 100000 }));
  return faker.word.words({ count: { min: 1, max: 3 } });
}

export const tableRouter = createTRPCRouter({
  listByBase: publicProcedure
    .input(TableListByBaseInputSchema)
    .output(TableSummarySchema.array())
    .query(({ ctx, input }) => {
      return ctx.db.table.findMany({
        where: { baseId: input.baseId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
        },
      });
    }),

  getById: publicProcedure
    .input(TableGetByIdInputSchema)
    .output(TableDetailSchema.nullable())
    .query(({ ctx, input }) => {
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

  create: publicProcedure
    .input(TableCreateInputSchema)
    .output(TableCreateOutputSchema)
    .mutation(async ({ ctx, input }) => {
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

  createWithDefaults: publicProcedure
    .input(TableCreateWithDefaultsInputSchema)
    .output(TableCreateOutputSchema)
    .mutation(async ({ ctx, input }) => {
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

  bulkInsertRows: publicProcedure
    .input(TableBulkInsertRowsInputSchema)
    .output(TableBulkInsertRowsOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const fields = await ctx.db.field.findMany({
        where: { tableId: input.tableId },
        orderBy: { order: "asc" },
      });

      if (fields.length === 0) {
        return { inserted: 0 };
      }

      const maxOrder = await ctx.db.record.aggregate({
        where: { tableId: input.tableId },
        _max: { order: true },
      });
      let nextOrder = (maxOrder._max.order ?? -1) + 1;

      const batchSize = 5000;
      let remaining = input.count;
      let inserted = 0;

      while (remaining > 0) {
        const currentBatchSize = Math.min(batchSize, remaining);
        const createdRecords = await ctx.db.record.createManyAndReturn({
          data: Array.from({ length: currentBatchSize }, (_, index) => ({
            tableId: input.tableId,
            order: nextOrder + index,
          })),
        });

        const cellBatch = createdRecords.flatMap((record) =>
          fields.map((field) => ({
            recordId: record.id,
            fieldId: field.id,
            value: sampleValueForField(field.type),
          })),
        );

        if (cellBatch.length > 0) {
          await ctx.db.cell.createMany({ data: cellBatch });
        }

        inserted += currentBatchSize;
        remaining -= currentBatchSize;
        nextOrder += currentBatchSize;
      }

      return { inserted };
    }),

  getGridWindow: publicProcedure
    .input(GridQueryInputSchema)
    .output(GridWindowOutputSchema)
    .query(async ({ ctx, input }) => {
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

      for (const filter of input.filters) {
        const clause =
          filter.type === "text"
            ? textFilterSql(filter)
            : numberFilterSql(filter);
        if (clause) whereClauses.push(clause);
      }

      const whereSql = Prisma.sql`WHERE ${Prisma.join(whereClauses, " AND ")}`;
      const sortSql = buildSortSql(input.sorts);
      const offset = input.cursor;
      const limitWithPeek = input.limit + 1;

      const [idRows, totalRows, fields] = await Promise.all([
        ctx.db.$queryRaw<Array<{ id: string; order: number }>>(
          Prisma.sql`
            SELECT r.id, r."order"
            FROM "Record" r
            ${whereSql}
            ${sortSql}
            OFFSET ${offset}
            LIMIT ${limitWithPeek}
          `,
        ),
        offset === 0
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

      const hasMore = idRows.length > input.limit;
      const pageRows = hasMore ? idRows.slice(0, input.limit) : idRows;
      const rowIds = pageRows.map((row) => row.id);

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

      return {
        rows: orderedRecords,
        fields: fields.filter(
          (field) => !input.hiddenFieldIds.includes(field.id),
        ),
        nextCursor: hasMore ? offset + input.limit : null,
        total: totalRows?.[0]?.count ?? 0,
      };
    }),
});
