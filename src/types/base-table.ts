import { z } from "zod";

export const ViewTypeSchema = z.enum([
  "GRID",
  "KANBAN",
  "CALENDAR",
  "GALLERY",
  "FORM",
]);

export const FieldTypeSchema = z.enum([
  "TEXT",
  "LONG_TEXT",
  "NUMBER",
  "BOOLEAN",
  "DATE",
  "SINGLE_SELECT",
  "MULTI_SELECT",
]);

export const TableSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const BaseSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  tables: z.array(TableSummarySchema),
});

export const BaseGetByIdInputSchema = z.object({
  baseId: z.string().min(1),
});

export const BaseCreateInputSchema = z.object({
  name: z.string().min(1).max(100),
  ownerId: z.string().min(1).optional(),
});

export const BaseCreateOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
});

export const TableListByBaseInputSchema = z.object({
  baseId: z.string().min(1),
});

export const TableGetByIdInputSchema = z.object({
  tableId: z.string().min(1),
});

export const TableCreateInputSchema = z.object({
  name: z.string().min(1).max(100),
  baseId: z.string().min(1),
});

export const TableCreateWithDefaultsInputSchema = z.object({
  name: z.string().min(1).max(100),
  baseId: z.string().min(1),
  defaultRowCount: z.number().int().min(0).max(5000).default(0),
});

export const TableCreateOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseId: z.string(),
});

export const TableSeedInputSchema = z.object({
  baseId: z.string().min(1),
  name: z.string().min(1).max(100),
});

export const TableBulkInsertRowsInputSchema = z.object({
  tableId: z.string().min(1),
  count: z.number().int().min(1).max(1000000).default(100000),
});

export const TableBulkInsertRowsOutputSchema = z.object({
  inserted: z.number().int().nonnegative(),
});

export const ViewForTableSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ViewTypeSchema,
  tableId: z.string(),
  config: z.unknown().nullable(),
});

export const ViewListByTableInputSchema = z.object({
  tableId: z.string().min(1),
});

export const ViewCreateInputSchema = z.object({
  tableId: z.string().min(1),
  name: z.string().min(1).max(100),
  type: ViewTypeSchema.default("GRID"),
  config: z.unknown().optional(),
});

export const ViewUpdateInputSchema = z.object({
  viewId: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  type: ViewTypeSchema.optional(),
  config: z.unknown().optional(),
});

export const ViewDeleteInputSchema = z.object({
  viewId: z.string().min(1),
});

export const FieldListByTableInputSchema = z.object({
  tableId: z.string().min(1),
});

export const FieldCreateInputSchema = z.object({
  tableId: z.string().min(1),
  name: z.string().min(1).max(100),
  type: FieldTypeSchema.optional(),
  order: z.number().int().nonnegative().optional(),
  options: z.unknown().optional(),
});

export const FieldUpdateInputSchema = z.object({
  fieldId: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  type: FieldTypeSchema.optional(),
  order: z.number().int().nonnegative().optional(),
  options: z.unknown().optional(),
});

export const FieldDeleteInputSchema = z.object({
  fieldId: z.string().min(1),
});

export const FieldReorderInputSchema = z.object({
  tableId: z.string().min(1),
  fieldIds: z.array(z.string().min(1)).min(1),
});

export const FieldForTableSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: FieldTypeSchema,
  tableId: z.string(),
  order: z.number().int(),
  options: z.unknown().nullable(),
});

export const CellForTableSchema = z.object({
  id: z.string(),
  recordId: z.string(),
  fieldId: z.string(),
  value: z.string().nullable(),
});

export const RecordListByTableInputSchema = z.object({
  tableId: z.string().min(1),
});

export const RecordCreateInputSchema = z.object({
  tableId: z.string().min(1),
  order: z.number().int().nonnegative().optional(),
});

export const RecordDeleteInputSchema = z.object({
  recordId: z.string().min(1),
});

export const CellUpsertInputSchema = z.object({
  recordId: z.string().min(1),
  fieldId: z.string().min(1),
  value: z.string().nullable(),
});

export const RecordForTableSchema = z.object({
  id: z.string(),
  tableId: z.string(),
  order: z.number().int(),
  cells: z.array(CellForTableSchema),
});

export const GridSortDirectionSchema = z.enum(["asc", "desc"]);
export const GridSortTypeSchema = z.enum(["text", "number"]);

export const GridSortSchema = z.object({
  fieldId: z.string().min(1),
  direction: GridSortDirectionSchema,
  type: GridSortTypeSchema,
});

export const GridTextFilterSchema = z.object({
  fieldId: z.string().min(1),
  type: z.literal("text"),
  op: z.enum([
    "is_empty",
    "is_not_empty",
    "contains",
    "not_contains",
    "equals",
  ]),
  value: z.string().optional(),
  conjunction: z.enum(["and", "or"]).default("and"),
});

export const GridNumberFilterSchema = z.object({
  fieldId: z.string().min(1),
  type: z.literal("number"),
  op: z.enum(["is_empty", "is_not_empty", "gt", "lt", "gte", "lte", "eq"]),
  value: z.number().optional(),
  conjunction: z.enum(["and", "or"]).default("and"),
});

export const GridFilterSchema = z.union([
  GridTextFilterSchema,
  GridNumberFilterSchema,
]);

export const GridQueryInputSchema = z.object({
  tableId: z.string().min(1),
  cursor: z.number().int().nonnegative().default(0),
  limit: z.number().int().min(20).max(1000).default(200),
  globalSearch: z.string().optional(),
  filters: z.array(GridFilterSchema).default([]),
  sorts: z.array(GridSortSchema).default([]),
  hiddenFieldIds: z.array(z.string()).default([]),
});

export const GridWindowOutputSchema = z.object({
  rows: z.array(RecordForTableSchema),
  fields: z.array(FieldForTableSchema),
  nextCursor: z.number().int().nonnegative().nullable(),
  total: z.number().int().nonnegative(),
});

export const TableDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseId: z.string(),
  views: z.array(ViewForTableSchema),
  fields: z.array(FieldForTableSchema),
  records: z.array(RecordForTableSchema),
});
