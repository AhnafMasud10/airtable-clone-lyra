import { baseRouter } from "~/server/api/routers/base";
import { cellRouter } from "~/server/api/routers/cell";
import { fieldRouter } from "~/server/api/routers/field";
import { postRouter } from "~/server/api/routers/post";
import { recordRouter } from "~/server/api/routers/record";
import { tableRouter } from "~/server/api/routers/table";
import { viewRouter } from "~/server/api/routers/view";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  base: baseRouter,
  cell: cellRouter,
  field: fieldRouter,
  post: postRouter,
  record: recordRouter,
  table: tableRouter,
  view: viewRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
