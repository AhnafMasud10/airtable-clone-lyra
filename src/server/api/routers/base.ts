import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  BaseCreateInputSchema,
  BaseCreateOutputSchema,
  BaseGetByIdInputSchema,
  BaseSummarySchema,
  BaseUpdateInputSchema,
} from "~/types/base-table";

import { assertBaseOwnership } from "../auth-helpers";

export const baseRouter = createTRPCRouter({
  list: protectedProcedure
    .output(BaseSummarySchema.array())
    .query(({ ctx }) => {
      return ctx.db.base.findMany({
        where: { ownerId: ctx.session.user.id },
        include: {
          tables: {
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });
    }),

  getById: protectedProcedure
    .input(BaseGetByIdInputSchema)
    .query(async ({ ctx, input }) => {
      await assertBaseOwnership(ctx.db, input.baseId, ctx.session.user.id);
      return ctx.db.base.findUnique({
        where: { id: input.baseId },
        select: {
          id: true,
          name: true,
          ownerId: true,
          tables: {
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
              views: {
                orderBy: { createdAt: "asc" },
                select: { id: true, name: true },
              },
            },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(BaseUpdateInputSchema)
    .mutation(async ({ ctx, input }) => {
      await assertBaseOwnership(ctx.db, input.baseId, ctx.session.user.id);
      return ctx.db.base.update({
        where: { id: input.baseId },
        data: {
          ...(input.name ? { name: input.name } : {}),
        },
        select: { id: true, name: true },
      });
    }),

  create: protectedProcedure
    .input(BaseCreateInputSchema)
    .output(BaseCreateOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const base = await tx.base.create({
          data: {
            name: input.name,
            ownerId: ctx.session.user.id,
          },
        });

        const table = await tx.table.create({
          data: {
            name: "Untitled",
            baseId: base.id,
          },
        });

        await tx.view.create({
          data: {
            tableId: table.id,
            name: "Grid view",
            type: "GRID",
          },
        });

        await tx.field.createMany({
          data: [
            { tableId: table.id, name: "Name", type: "TEXT", order: 0 },
            { tableId: table.id, name: "Notes", type: "LONG_TEXT", order: 1 },
          ],
        });

        return base;
      });
    }),
});
