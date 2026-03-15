import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "../../../generated/prisma";

/**
 * Asserts the user owns the base. Throws FORBIDDEN if not.
 */
export async function assertBaseOwnership(
  db: PrismaClient,
  baseId: string,
  userId: string,
) {
  const base = await db.base.findUnique({
    where: { id: baseId },
    select: { ownerId: true },
  });
  if (base?.ownerId !== userId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
  }
}

/**
 * Resolves tableId to baseId and asserts ownership.
 */
export async function assertTableAccess(
  db: PrismaClient,
  tableId: string,
  userId: string,
) {
  const table = await db.table.findUnique({
    where: { id: tableId },
    select: { baseId: true },
  });
  if (!table) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
  }
  await assertBaseOwnership(db, table.baseId, userId);
  return table.baseId;
}

/**
 * Resolves recordId to baseId and asserts ownership.
 */
export async function assertRecordAccess(
  db: PrismaClient,
  recordId: string,
  userId: string,
) {
  const record = await db.record.findUnique({
    where: { id: recordId },
    select: { table: { select: { baseId: true } } },
  });
  if (!record) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Record not found" });
  }
  await assertBaseOwnership(db, record.table.baseId, userId);
  return record.table.baseId;
}

/**
 * Resolves fieldId to baseId and asserts ownership.
 */
export async function assertFieldAccess(
  db: PrismaClient,
  fieldId: string,
  userId: string,
) {
  const field = await db.field.findUnique({
    where: { id: fieldId },
    select: { table: { select: { baseId: true } } },
  });
  if (!field) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Field not found" });
  }
  await assertBaseOwnership(db, field.table.baseId, userId);
  return field.table.baseId;
}

/**
 * Resolves viewId to baseId and asserts ownership.
 */
export async function assertViewAccess(
  db: PrismaClient,
  viewId: string,
  userId: string,
) {
  const view = await db.view.findUnique({
    where: { id: viewId },
    select: { table: { select: { baseId: true } } },
  });
  if (!view) {
    throw new TRPCError({ code: "NOT_FOUND", message: "View not found" });
  }
  await assertBaseOwnership(db, view.table.baseId, userId);
  return view.table.baseId;
}
