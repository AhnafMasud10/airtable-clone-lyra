import Link from "next/link";
import { db } from "~/server/db";

type HomeProps = Readonly<{
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}>;

export default async function Home({ searchParams }: HomeProps) {
  const params = await Promise.resolve(searchParams ?? {});

  const workspaces = await db.workspace.findMany({
    include: {
      owner: true,
      bases: {
        include: {
          tables: {
            include: {
              fields: {
                orderBy: { name: "asc" },
              },
              records: {
                include: {
                  cells: true,
                },
                orderBy: { id: "asc" },
              },
            },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const currentWorkspace = workspaces[0];
  const currentBases = currentWorkspace?.bases ?? [];
  const requestedBaseId =
    typeof params.base === "string" ? params.base : undefined;
  const selectedBase =
    currentBases.find((base) => base.id === requestedBaseId) ?? currentBases[0];

  const selectedBaseTables = selectedBase?.tables ?? [];
  const requestedTableId =
    typeof params.table === "string" ? params.table : undefined;
  const selectedTable =
    selectedBaseTables.find((table) => table.id === requestedTableId) ??
    selectedBaseTables[0];

  const currentBase = selectedBase;
  const currentTable = selectedTable;
  const fields = currentTable?.fields ?? [];
  const records = currentTable?.records ?? [];
  const ownerName = currentWorkspace?.owner?.name ?? "Owner";
  const ownerInitial = ownerName.charAt(0).toUpperCase() || "U";

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#1f2328]">
      <div className="flex min-h-screen">
        <aside className="w-56 border-r border-[#e5e8eb] bg-white p-4">
          <div className="mb-8 flex items-center gap-2 text-xl font-semibold">
            <span className="text-[#4a8bff]">A</span>
            <span>Lyra Tables</span>
          </div>
          <nav className="space-y-2 text-sm">
            <div className="rounded-md bg-[#f0f4ff] px-3 py-2 font-medium text-[#1f57d2]">
              Home
            </div>
            <div className="rounded-md px-3 py-2 text-[#586069]">Starred</div>
            <div className="rounded-md px-3 py-2 text-[#586069]">Shared</div>
            <div className="rounded-md px-3 py-2 text-[#586069]">
              Workspaces
            </div>
          </nav>
        </aside>

        <section className="flex-1 p-8">
          <header className="mb-6 flex items-center justify-between gap-4">
            <input
              className="w-full max-w-md rounded-lg border border-[#d0d7de] bg-white px-3 py-2 text-sm outline-none focus:border-[#4a8bff]"
              placeholder="Search..."
              readOnly
            />
            <div className="flex items-center gap-3">
              <button className="rounded-md bg-[#1f6feb] px-4 py-2 text-sm font-medium text-white">
                + Create
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7c3aed] text-xs font-semibold text-white">
                {ownerInitial}
              </div>
            </div>
          </header>

          <div className="rounded-xl border border-[#e5e8eb] bg-white p-6">
            <h1 className="text-3xl font-semibold">
              {currentWorkspace?.name ?? "No workspace found"}
            </h1>
            <p className="mt-2 text-sm text-[#656d76]">
              Workspace owner: {ownerName}
            </p>

            <div className="mt-8">
              <div className="mb-3 text-sm font-medium text-[#656d76]">
                Last opened
              </div>

              {currentBases.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#d0d7de] p-6 text-sm text-[#656d76]">
                  No bases yet. Run `bun run db:seed` to populate sample data.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {currentBases.map((base) => {
                    const initial = base.name.charAt(0).toUpperCase() || "B";
                    const defaultTableId = base.tables[0]?.id;
                    return (
                      <Link
                        key={base.id}
                        href={
                          defaultTableId
                            ? `/?base=${base.id}&table=${defaultTableId}`
                            : `/?base=${base.id}`
                        }
                        className={`rounded-lg border bg-[#fcfcfd] p-4 transition hover:border-[#bfd3ff] ${
                          currentBase?.id === base.id
                            ? "border-[#1f6feb]"
                            : "border-[#e5e8eb]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1f6feb] text-sm font-semibold text-white">
                            {initial}
                          </div>
                          <div>
                            <h2 className="text-sm font-semibold">
                              {base.name}
                            </h2>
                            <p className="text-xs text-[#656d76]">
                              Opened recently
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-10">
              <div className="mb-3 text-sm font-medium text-[#656d76]">
                Bases
              </div>
              <div className="mb-6 flex flex-wrap gap-2">
                {currentBases.map((base) => {
                  const defaultTableId = base.tables[0]?.id;
                  return (
                    <Link
                      key={base.id}
                      href={
                        defaultTableId
                          ? `/?base=${base.id}&table=${defaultTableId}`
                          : `/?base=${base.id}`
                      }
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        currentBase?.id === base.id
                          ? "border-[#1f6feb] bg-[#eaf2ff] text-[#1f57d2]"
                          : "border-[#d0d7de] bg-white text-[#586069]"
                      }`}
                    >
                      {base.name}
                    </Link>
                  );
                })}
              </div>

              <div className="mb-3 text-sm font-medium text-[#656d76]">
                Tables
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {(currentBase?.tables ?? []).map((table) => (
                  <Link
                    key={table.id}
                    href={`/?base=${currentBase?.id}&table=${table.id}`}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                      currentTable?.id === table.id
                        ? "border-[#1f6feb] bg-[#eaf2ff] text-[#1f57d2]"
                        : "border-[#d0d7de] bg-white text-[#586069]"
                    }`}
                  >
                    {table.name}
                  </Link>
                ))}
              </div>

              {currentTable ? (
                <div className="overflow-hidden rounded-lg border border-[#d0d7de]">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0 text-sm">
                      <thead>
                        <tr className="bg-[#f6f8fa]">
                          <th className="sticky left-0 z-10 border-r border-b border-[#d0d7de] bg-[#f6f8fa] px-3 py-2 text-left font-semibold text-[#57606a]">
                            #
                          </th>
                          {fields.map((field) => (
                            <th
                              key={field.id}
                              className="border-r border-b border-[#d0d7de] px-4 py-2 text-left font-semibold text-[#57606a]"
                            >
                              {field.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((record, rowIndex) => {
                          const cellMap = new Map(
                            record.cells.map((cell) => [
                              cell.fieldId,
                              cell.value ?? "",
                            ]),
                          );

                          return (
                            <tr
                              key={record.id}
                              className="bg-white hover:bg-[#f9fbff]"
                            >
                              <td className="sticky left-0 border-r border-b border-[#d0d7de] bg-white px-3 py-2 text-xs text-[#656d76]">
                                {rowIndex + 1}
                              </td>
                              {fields.map((field) => (
                                <td
                                  key={`${record.id}-${field.id}`}
                                  className="border-r border-b border-[#d0d7de] px-4 py-2 text-[#24292f]"
                                >
                                  {cellMap.get(field.id) || ""}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                        {records.length === 0 && (
                          <tr>
                            <td
                              colSpan={fields.length + 1}
                              className="px-4 py-6 text-center text-sm text-[#656d76]"
                            >
                              No records found in this table.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[#d0d7de] p-6 text-sm text-[#656d76]">
                  No tables found for this base.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
