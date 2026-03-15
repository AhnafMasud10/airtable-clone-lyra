import { assertRecordAccess, assertTableAccess } from "~/server/api/auth-helpers";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  RecordCreateInputSchema,
  RecordDeleteInputSchema,
  RecordForTableSchema,
  RecordListByTableInputSchema,
} from "~/types/base-table";

export const recordRouter = createTRPCRouter({
  listByTable: protectedProcedure
    .input(RecordListByTableInputSchema)
    .output(RecordForTableSchema.array())
    .query(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
      return ctx.db.record.findMany({
        where: { tableId: input.tableId },
        include: {
          cells: true,
        },
        orderBy: { order: "asc" },
      });
    }),

  create: protectedProcedure
    .input(RecordCreateInputSchema)
    .output(RecordForTableSchema)
    .mutation(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
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

  delete: protectedProcedure
    .input(RecordDeleteInputSchema)
    .output(RecordDeleteInputSchema)
    .mutation(async ({ ctx, input }) => {
      await assertRecordAccess(ctx.db, input.recordId, ctx.session.user.id);
      await ctx.db.cell.deleteMany({
        where: { recordId: input.recordId },
      });

      await ctx.db.record.delete({
        where: { id: input.recordId },
      });

      return { recordId: input.recordId };
    }),
});
