import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  FieldCreateInputSchema,
  FieldDeleteInputSchema,
  FieldForTableSchema,
  FieldListByTableInputSchema,
  FieldUpdateInputSchema,
} from "~/types/base-table";

export const fieldRouter = createTRPCRouter({
  listByTable: publicProcedure
    .input(FieldListByTableInputSchema)
    .output(FieldForTableSchema.array())
    .query(({ ctx, input }) => {
      return ctx.db.field.findMany({
        where: { tableId: input.tableId },
        orderBy: { order: "asc" },
      });
    }),

  create: publicProcedure
    .input(FieldCreateInputSchema)
    .output(FieldForTableSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.field.create({
        data: {
          tableId: input.tableId,
          name: input.name,
          type: input.type ?? "TEXT",
          order: input.order ?? 0,
        },
      });
    }),

  update: publicProcedure
    .input(FieldUpdateInputSchema)
    .output(FieldForTableSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.field.update({
        where: { id: input.fieldId },
        data: {
          ...(input.name ? { name: input.name } : {}),
          ...(input.type ? { type: input.type } : {}),
          ...(typeof input.order === "number" ? { order: input.order } : {}),
        },
      });
    }),

  delete: publicProcedure
    .input(FieldDeleteInputSchema)
    .output(FieldDeleteInputSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.field.delete({
        where: { id: input.fieldId },
      });

      return { fieldId: input.fieldId };
    }),
});
