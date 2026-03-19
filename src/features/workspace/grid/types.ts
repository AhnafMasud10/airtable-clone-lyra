import type { RouterInputs, RouterOutputs } from "~/trpc/react";

export type TableSummary = RouterOutputs["table"]["listByBase"][number];
export type GridRow = RouterOutputs["table"]["getGridWindow"]["rows"][number];
export type GridField =
  RouterOutputs["table"]["getGridWindow"]["fields"][number];
export type ViewItem = RouterOutputs["view"]["listByTable"][number];

export type GridFilter = NonNullable<
  RouterInputs["table"]["getGridWindow"]["filters"]
>[number];
export type GridSort = NonNullable<
  RouterInputs["table"]["getGridWindow"]["sorts"]
>[number];

export type TableRowModel = {
  id: string;
  order: number;
  cellsByField: Record<string, string>;
  _skeleton?: boolean;
};

export const PAGE_SIZE = 500;
export const INITIAL_LOAD_SIZE = 1000;
