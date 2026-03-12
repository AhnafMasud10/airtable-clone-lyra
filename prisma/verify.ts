import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({
  adapter: new PrismaPg(pool),
  log: ["error", "warn"],
});

type CheckResult = {
  name: string;
  pass: boolean;
  details: string;
};

async function runChecks(): Promise<CheckResult[]> {
  const [users, bases, tables, views, fields, records, cells] = await Promise.all([
    db.user.count(),
    db.base.count(),
    db.table.count(),
    db.view.count(),
    db.field.count(),
    db.record.count(),
    db.cell.count(),
  ]);

  const [
    orphanBases,
    orphanTables,
    orphanViews,
    orphanFields,
    orphanRecords,
    orphanCellsByRecord,
    orphanCellsByField,
    invalidCellJoins,
  ] = await Promise.all([
    db.$queryRaw<Array<{ count: number }>>`
      SELECT CAST(COUNT(*) AS INTEGER) AS count
      FROM "Base" b
      LEFT JOIN "User" u ON u.id = b."ownerId"
      WHERE u.id IS NULL
    `,
    db.$queryRaw<Array<{ count: number }>>`
      SELECT CAST(COUNT(*) AS INTEGER) AS count
      FROM "AirtableTable" t
      LEFT JOIN "Base" b ON b.id = t."baseId"
      WHERE b.id IS NULL
    `,
    db.$queryRaw<Array<{ count: number }>>`
      SELECT CAST(COUNT(*) AS INTEGER) AS count
      FROM "View" v
      LEFT JOIN "AirtableTable" t ON t.id = v."tableId"
      WHERE t.id IS NULL
    `,
    db.$queryRaw<Array<{ count: number }>>`
      SELECT CAST(COUNT(*) AS INTEGER) AS count
      FROM "Field" f
      LEFT JOIN "AirtableTable" t ON t.id = f."tableId"
      WHERE t.id IS NULL
    `,
    db.$queryRaw<Array<{ count: number }>>`
      SELECT CAST(COUNT(*) AS INTEGER) AS count
      FROM "Record" r
      LEFT JOIN "AirtableTable" t ON t.id = r."tableId"
      WHERE t.id IS NULL
    `,
    db.$queryRaw<Array<{ count: number }>>`
      SELECT CAST(COUNT(*) AS INTEGER) AS count
      FROM "Cell" c
      LEFT JOIN "Record" r ON r.id = c."recordId"
      WHERE r.id IS NULL
    `,
    db.$queryRaw<Array<{ count: number }>>`
      SELECT CAST(COUNT(*) AS INTEGER) AS count
      FROM "Cell" c
      LEFT JOIN "Field" f ON f.id = c."fieldId"
      WHERE f.id IS NULL
    `,
    db.$queryRaw<Array<{ count: number }>>`
      SELECT CAST(COUNT(*) AS INTEGER) AS count
      FROM "Cell" c
      JOIN "Record" r ON r.id = c."recordId"
      JOIN "Field" f ON f.id = c."fieldId"
      WHERE r."tableId" <> f."tableId"
    `,
  ]);

  const orphanBaseCount = orphanBases[0]?.count ?? 0;
  const orphanTableCount = orphanTables[0]?.count ?? 0;
  const orphanViewCount = orphanViews[0]?.count ?? 0;
  const orphanFieldCount = orphanFields[0]?.count ?? 0;
  const orphanRecordCount = orphanRecords[0]?.count ?? 0;
  const orphanCellRecordCount = orphanCellsByRecord[0]?.count ?? 0;
  const orphanCellFieldCount = orphanCellsByField[0]?.count ?? 0;
  const invalidCellJoinCount = invalidCellJoins[0]?.count ?? 0;

  return [
    {
      name: "Seeded users and bases exist",
      pass: users > 0 && bases > 0,
      details: `users=${users}, bases=${bases}`,
    },
    {
      name: "Every base belongs to a user",
      pass: orphanBaseCount === 0,
      details: `orphans=${orphanBaseCount}`,
    },
    {
      name: "Every table belongs to a base",
      pass: orphanTableCount === 0,
      details: `orphans=${orphanTableCount}`,
    },
    {
      name: "Every view belongs to a table",
      pass: orphanViewCount === 0,
      details: `orphans=${orphanViewCount}`,
    },
    {
      name: "Every field belongs to a table",
      pass: orphanFieldCount === 0,
      details: `orphans=${orphanFieldCount}`,
    },
    {
      name: "Every record belongs to a table",
      pass: orphanRecordCount === 0,
      details: `orphans=${orphanRecordCount}`,
    },
    {
      name: "Every cell references valid row and column in same table",
      pass:
        orphanCellRecordCount === 0 &&
        orphanCellFieldCount === 0 &&
        invalidCellJoinCount === 0,
      details: `record-orphans=${orphanCellRecordCount}, field-orphans=${orphanCellFieldCount}, cross-table-cells=${invalidCellJoinCount}`,
    },
    {
      name: "Basic hierarchy counts look sane",
      pass:
        users <= bases &&
        bases <= tables &&
        tables <= views &&
        tables <= records &&
        records <= cells,
      details: `users=${users}, bases=${bases}, tables=${tables}, views=${views}, fields=${fields}, records=${records}, cells=${cells}`,
    },
  ];
}

try {
  const results = await runChecks();
  console.log("Database verification report:");
  for (const result of results) {
    const status = result.pass ? "PASS" : "FAIL";
    console.log(`- [${status}] ${result.name} (${result.details})`);
  }

  const failed = results.filter((r) => !r.pass);
  if (failed.length > 0) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error("Verification failed:", error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
  await pool.end();
}
