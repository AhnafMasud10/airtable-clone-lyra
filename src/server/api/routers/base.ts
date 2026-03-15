import { assertBaseOwnership } from "~/server/api/auth-helpers";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  BaseCreateInputSchema,
  BaseCreateOutputSchema,
  BaseGetByIdInputSchema,
  BaseSummarySchema,
} from "~/types/base-table";

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

  create: protectedProcedure
    .input(BaseCreateInputSchema)
    .output(BaseCreateOutputSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.base.create({
        data: {
          name: input.name,
          ownerId: ctx.session.user.id,
        },
      });
    }),
});
