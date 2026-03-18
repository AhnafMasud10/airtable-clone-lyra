import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  RecordCreateInputSchema,
  RecordDeleteInputSchema,
  RecordForTableSchema,
  RecordListByTableInputSchema,
} from "~/types/base-table";

import { assertRecordAccess, assertTableAccess } from "../auth-helpers";

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

  insertAbove: protectedProcedure
    .input(z.object({ tableId: z.string().min(1), recordId: z.string().min(1) }))
    .output(RecordForTableSchema)
    .mutation(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
      const anchor = await ctx.db.record.findUnique({
        where: { id: input.recordId },
      });
      if (anchor?.tableId !== input.tableId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Record not found" });
      }
      const created = await ctx.db.$transaction(async (tx) => {
        await tx.record.updateMany({
          where: { tableId: input.tableId, order: { gte: anchor.order } },
          data: { order: { increment: 1 } },
        });
        return tx.record.create({
          data: { tableId: input.tableId, order: anchor.order },
        });
      });
      return { ...created, cells: [] };
    }),

  insertBelow: protectedProcedure
    .input(z.object({ tableId: z.string().min(1), recordId: z.string().min(1) }))
    .output(RecordForTableSchema)
    .mutation(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
      const anchor = await ctx.db.record.findUnique({
        where: { id: input.recordId },
      });
      if (anchor?.tableId !== input.tableId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Record not found" });
      }
      const created = await ctx.db.$transaction(async (tx) => {
        await tx.record.updateMany({
          where: { tableId: input.tableId, order: { gt: anchor.order } },
          data: { order: { increment: 1 } },
        });
        return tx.record.create({
          data: { tableId: input.tableId, order: anchor.order + 1 },
        });
      });
      return { ...created, cells: [] };
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

  duplicate: protectedProcedure
    .input(z.object({ recordId: z.string().min(1) }))
    .output(RecordForTableSchema)
    .mutation(async ({ ctx, input }) => {
      const source = await ctx.db.record.findUnique({
        where: { id: input.recordId },
        include: { cells: true },
      });
      if (!source) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Record not found" });
      }
      await assertRecordAccess(ctx.db, input.recordId, ctx.session.user.id);

      const maxOrder = await ctx.db.record.aggregate({
        where: { tableId: source.tableId },
        _max: { order: true },
      });
      const newOrder = (maxOrder._max.order ?? -1) + 1;

      const created = await ctx.db.record.create({
        data: {
          tableId: source.tableId,
          order: newOrder,
        },
      });

      if (source.cells.length > 0) {
        await ctx.db.cell.createMany({
          data: source.cells.map((c) => ({
            recordId: created.id,
            fieldId: c.fieldId,
            value: c.value,
          })),
        });
      }

      const cells = await ctx.db.cell.findMany({
        where: { recordId: created.id },
      });
      return { ...created, cells };
    }),

  bulkDelete: protectedProcedure
    .input(z.object({ recordIds: z.array(z.string().min(1)).min(1) }))
    .output(z.object({ deletedCount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      for (const recordId of input.recordIds) {
        await assertRecordAccess(ctx.db, recordId, ctx.session.user.id);
      }
      await ctx.db.cell.deleteMany({
        where: { recordId: { in: input.recordIds } },
      });
      const result = await ctx.db.record.deleteMany({
        where: { id: { in: input.recordIds } },
      });
      return { deletedCount: result.count };
    }),
});
