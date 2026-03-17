import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { CellForTableSchema, CellUpsertInputSchema } from "~/types/base-table";

import { assertRecordAccess } from "../auth-helpers";

export const cellRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(CellUpsertInputSchema)
    .output(CellForTableSchema)
    .mutation(async ({ ctx, input }) => {
      await assertRecordAccess(ctx.db, input.recordId, ctx.session.user.id);
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
