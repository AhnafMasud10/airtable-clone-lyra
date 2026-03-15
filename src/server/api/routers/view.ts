import { assertTableAccess, assertViewAccess } from "~/server/api/auth-helpers";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { Prisma } from "../../../../generated/prisma";
import {
  ViewCreateInputSchema,
  ViewDeleteInputSchema,
  ViewForTableSchema,
  ViewListByTableInputSchema,
  ViewUpdateInputSchema,
} from "~/types/base-table";

export const viewRouter = createTRPCRouter({
  listByTable: protectedProcedure
    .input(ViewListByTableInputSchema)
    .output(ViewForTableSchema.array())
    .query(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
      return ctx.db.view.findMany({
        where: { tableId: input.tableId },
        orderBy: { createdAt: "asc" },
      });
    }),

  create: protectedProcedure
    .input(ViewCreateInputSchema)
    .output(ViewForTableSchema)
    .mutation(async ({ ctx, input }) => {
      await assertTableAccess(ctx.db, input.tableId, ctx.session.user.id);
      return ctx.db.view.create({
        data: {
          tableId: input.tableId,
          name: input.name,
          type: input.type,
        },
      });
    }),

  update: protectedProcedure
    .input(ViewUpdateInputSchema)
    .output(ViewForTableSchema)
    .mutation(async ({ ctx, input }) => {
      await assertViewAccess(ctx.db, input.viewId, ctx.session.user.id);
      let configData:
        | Prisma.InputJsonValue
        | typeof Prisma.JsonNull
        | undefined;
      if (input.config === undefined) {
        configData = undefined;
      } else if (input.config === null) {
        configData = Prisma.JsonNull;
      } else {
        configData = input.config as Prisma.InputJsonValue;
      }
      const configUpdate =
        configData === undefined ? {} : { config: configData };

      return ctx.db.view.update({
        where: { id: input.viewId },
        data: {
          ...(input.name ? { name: input.name } : {}),
          ...(input.type ? { type: input.type } : {}),
          ...configUpdate,
        },
      });
    }),

  saveConfig: protectedProcedure
    .input(ViewUpdateInputSchema.pick({ viewId: true, config: true }))
    .output(ViewForTableSchema)
    .mutation(async ({ ctx, input }) => {
      await assertViewAccess(ctx.db, input.viewId, ctx.session.user.id);
      let configData:
        | Prisma.InputJsonValue
        | typeof Prisma.JsonNull
        | undefined;
      if (input.config === null) {
        configData = Prisma.JsonNull;
      } else if (input.config !== undefined) {
        configData = input.config as Prisma.InputJsonValue;
      }

      return ctx.db.view.update({
        where: { id: input.viewId },
        data: {
          config: configData,
        },
      });
    }),

  delete: protectedProcedure
    .input(ViewDeleteInputSchema)
    .output(ViewDeleteInputSchema)
    .mutation(async ({ ctx, input }) => {
      await assertViewAccess(ctx.db, input.viewId, ctx.session.user.id);
      await ctx.db.view.delete({
        where: { id: input.viewId },
      });

      return { viewId: input.viewId };
    }),
});
