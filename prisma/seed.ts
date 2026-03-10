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

type RowData = Record<string, string | number | boolean | null | undefined>;

async function createTableWithRows(params: {
  baseId: string;
  tableName: string;
  fieldNames: string[];
  rows: RowData[];
}) {
  const { baseId, tableName, fieldNames, rows } = params;

  const table = await db.airtableTable.create({
    data: {
      name: tableName,
      baseId,
    },
  });

  const fields = await Promise.all(
    fieldNames.map((fieldName) =>
      db.field.create({
        data: {
          name: fieldName,
          tableId: table.id,
        },
      }),
    ),
  );

  const fieldByName = new Map(fields.map((field) => [field.name, field]));

  for (const row of rows) {
    const record = await db.record.create({
      data: {
        tableId: table.id,
      },
    });

    await Promise.all(
      Object.entries(row).map(async ([fieldName, value]) => {
        const field = fieldByName.get(fieldName);
        if (!field) return;

        await db.cell.create({
          data: {
            recordId: record.id,
            fieldId: field.id,
            value: value == null ? null : String(value),
          },
        });
      }),
    );
  }
}

async function main() {
  console.log("Seeding database...");

  // Reset in FK-safe order for repeatable seeds.
  await db.cell.deleteMany();
  await db.record.deleteMany();
  await db.field.deleteMany();
  await db.airtableTable.deleteMany();
  await db.base.deleteMany();
  await db.workspace.deleteMany();
  await db.user.deleteMany();

  const users = await Promise.all([
    db.user.create({
      data: {
        name: "Alice Johnson",
        email: "alice@example.com",
      },
    }),
    db.user.create({
      data: {
        name: "Bob Lee",
        email: "bob@example.com",
      },
    }),
  ]);

  for (const user of users) {
    const productWorkspace = await db.workspace.create({
      data: {
        name: `${user.name ?? "User"} Product Workspace`,
        ownerId: user.id,
      },
    });

    const opsWorkspace = await db.workspace.create({
      data: {
        name: `${user.name ?? "User"} Operations Workspace`,
        ownerId: user.id,
      },
    });

    const productBase = await db.base.create({
      data: {
        name: "Product Planning",
        workspaceId: productWorkspace.id,
      },
    });

    const crmBase = await db.base.create({
      data: {
        name: "CRM",
        workspaceId: productWorkspace.id,
      },
    });

    const operationsBase = await db.base.create({
      data: {
        name: "Operations Tracker",
        workspaceId: opsWorkspace.id,
      },
    });

    await createTableWithRows({
      baseId: productBase.id,
      tableName: "Features",
      fieldNames: ["Title", "Status", "Priority", "Owner"],
      rows: [
        {
          Title: "Kanban View",
          Status: "In Progress",
          Priority: "High",
          Owner: user.name ?? "Unknown",
        },
        {
          Title: "CSV Import",
          Status: "Backlog",
          Priority: "Medium",
          Owner: user.name ?? "Unknown",
        },
        {
          Title: "Activity Feed",
          Status: "Done",
          Priority: "Low",
          Owner: user.name ?? "Unknown",
        },
      ],
    });

    await createTableWithRows({
      baseId: crmBase.id,
      tableName: "Leads",
      fieldNames: ["Name", "Email", "Company", "Stage"],
      rows: [
        {
          Name: "Maya Patel",
          Email: "maya@northstar.io",
          Company: "Northstar",
          Stage: "Qualified",
        },
        {
          Name: "Noah Kim",
          Email: "noah@acme.co",
          Company: "Acme",
          Stage: "New",
        },
        {
          Name: "Zara Chen",
          Email: "zara@betaapps.dev",
          Company: "BetaApps",
          Stage: "Proposal",
        },
      ],
    });

    await createTableWithRows({
      baseId: operationsBase.id,
      tableName: "Incidents",
      fieldNames: ["Summary", "Severity", "State", "Assignee"],
      rows: [
        {
          Summary: "API latency spike",
          Severity: "P1",
          State: "Monitoring",
          Assignee: user.name ?? "Unknown",
        },
        {
          Summary: "Web login timeout",
          Severity: "P2",
          State: "Investigating",
          Assignee: user.name ?? "Unknown",
        },
      ],
    });
  }

  console.log("Seed completed successfully.");
}

try {
  await main();
} catch (error) {
  console.error("Seed failed:", error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
  await pool.end();
}
