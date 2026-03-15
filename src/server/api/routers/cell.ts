import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { CellForTableSchema, CellUpsertInputSchema } from "~/types/base-table";

export const cellRouter = createTRPCRouter({
  upsert: publicProcedure
    .input(CellUpsertInputSchema)
    .output(CellForTableSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.cell.upsert({
        where: {
          recordId_fieldId: {
            recordId: input.recordId,
            fieldId: input.fieldId,
          },
        },
        update: {
          value: input.value,
        },
        create: {
          recordId: input.recordId,
          fieldId: input.fieldId,
          value: input.value,
        },
      });
    }),
});
