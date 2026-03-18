import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  FieldCreateInputSchema,
  FieldDeleteInputSchema,
  FieldForTableSchema,
  FieldListByTableInputSchema,
  FieldReorderInputSchema,
  FieldUpdateInputSchema,
} from "~/types/base-table";

import { assertFieldAccess, assertTableAccess } from "../auth-helpers";

export const fieldRouter = createTRPCRouter({
  listByTable: protectedProcedure
    .input(FieldListByTableInputSchema)
    .output(FieldForTableSchema.array())
    .query(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
      return ctx.db.field.findMany({
        where: { tableId: input.tableId },
        orderBy: { order: "asc" },
      });
    }),

  create: protectedProcedure
    .input(FieldCreateInputSchema)
    .output(FieldForTableSchema)
    .mutation(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
      return ctx.db.field.create({
        data: {
          tableId: input.tableId,
          name: input.name,
          type: input.type ?? "TEXT",
          order: input.order ?? 0,
        },
      });
    }),

  update: protectedProcedure
    .input(FieldUpdateInputSchema)
    .output(FieldForTableSchema)
    .mutation(async ({ ctx, input }) => {
      await assertFieldAccess(ctx.db, input.fieldId, ctx.session.user.id);
      return ctx.db.field.update({
        where: { id: input.fieldId },
        data: {
          ...(input.name ? { name: input.name } : {}),
          ...(input.type ? { type: input.type } : {}),
          ...(typeof input.order === "number" ? { order: input.order } : {}),
        },
      });
    }),

  reorder: protectedProcedure
    .input(FieldReorderInputSchema)
    .output(FieldForTableSchema.array())
    .mutation(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
      await ctx.db.$transaction(
        input.fieldIds.map((fieldId, index) =>
          ctx.db.field.update({
            where: { id: fieldId },
            data: { order: index },
          }),
        ),
      );
      return ctx.db.field.findMany({
        where: { tableId: input.tableId },
        orderBy: { order: "asc" },
      });
    }),

  delete: protectedProcedure
    .input(FieldDeleteInputSchema)
    .output(FieldDeleteInputSchema)
    .mutation(async ({ ctx, input }) => {
      await assertFieldAccess(ctx.db, input.fieldId, ctx.session.user.id);
      await ctx.db.field.delete({
        where: { id: input.fieldId },
      });

      return { fieldId: input.fieldId };
    }),
});
