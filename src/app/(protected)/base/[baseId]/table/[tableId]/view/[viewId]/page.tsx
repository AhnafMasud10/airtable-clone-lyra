import { notFound } from "next/navigation";
import { BaseGridPageClient } from "~/features/workspace/grid/base-grid-page-client";
import { api } from "~/trpc/server";

type BaseTableViewPageProps = Readonly<{
  params: Promise<{ baseId: string; tableId: string; viewId: string }>;
}>;

export default async function BaseTableViewPage({
  params,
}: BaseTableViewPageProps) {
  const { baseId, tableId, viewId } = await params;

  const base = await api.base.getById({ baseId });
  if (!base) notFound();

  const currentTable = base.tables.find((table) => table.id === tableId);
  if (!currentTable) notFound();

  const currentView = currentTable.views.find((view) => view.id === viewId);
  if (!currentView) notFound();

  const initialTables = base.tables.map((table) => ({
    id: table.id,
    name: table.name,
  }));

  return (
    <BaseGridPageClient
      baseId={base.id}
      baseName={base.name}
      initialTables={initialTables}
      initialTableId={tableId}
      initialViewId={viewId}
    />
  );
}
