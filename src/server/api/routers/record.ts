import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  RecordCreateInputSchema,
  RecordDeleteInputSchema,
  RecordForTableSchema,
  RecordListByTableInputSchema,
} from "~/types/base-table";

export const recordRouter = createTRPCRouter({
  listByTable: publicProcedure
    .input(RecordListByTableInputSchema)
    .output(RecordForTableSchema.array())
    .query(({ ctx, input }) => {
      return ctx.db.record.findMany({
        where: { tableId: input.tableId },
        include: {
          cells: true,
        },
        orderBy: { order: "asc" },
      });
    }),

  create: publicProcedure
    .input(RecordCreateInputSchema)
    .output(RecordForTableSchema)
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.db.record.create({
        data: {
          tableId: input.tableId,
          order: input.order ?? 0,
        },
      });

      return {
        ...created,
        cells: [],
      };
    }),

  delete: publicProcedure
    .input(RecordDeleteInputSchema)
    .output(RecordDeleteInputSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.cell.deleteMany({
        where: { recordId: input.recordId },
      });

      await ctx.db.record.delete({
        where: { id: input.recordId },
      });

      return { recordId: input.recordId };
    }),

  bulkDelete: publicProcedure
    .input(z.object({ recordIds: z.array(z.string().min(1)).min(1) }))
    .output(z.object({ deletedCount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.cell.deleteMany({
        where: { recordId: { in: input.recordIds } },
      });
      const result = await ctx.db.record.deleteMany({
        where: { id: { in: input.recordIds } },
      });
      return { deletedCount: result.count };
    }),
});
