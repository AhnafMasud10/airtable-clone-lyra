import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  BaseCreateInputSchema,
  BaseCreateOutputSchema,
  BaseGetByIdInputSchema,
  BaseSummarySchema,
} from "~/types/base-table";

export const baseRouter = createTRPCRouter({
  list: publicProcedure.output(BaseSummarySchema.array()).query(({ ctx }) => {
    return ctx.db.base.findMany({
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

  getById: publicProcedure
    .input(BaseGetByIdInputSchema)
    .query(({ ctx, input }) => {
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

  create: publicProcedure
    .input(BaseCreateInputSchema)
    .output(BaseCreateOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const resolvedOwnerId =
        input.ownerId ??
        (
          await ctx.db.user.findFirst({
            orderBy: { createdAt: "asc" },
            select: { id: true },
          })
        )?.id ??
        (
          await ctx.db.user.create({
            data: {
              name: "Demo User",
              email: `demo-${Date.now()}@example.com`,
            },
            select: { id: true },
          })
        ).id;

      return ctx.db.base.create({
        data: {
          name: input.name,
          ownerId: resolvedOwnerId,
        },
      });
    }),
});
