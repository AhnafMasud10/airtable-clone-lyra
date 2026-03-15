import { notFound, redirect } from "next/navigation";
import { api } from "~/trpc/server";

type BaseTablePageProps = Readonly<{
  params: Promise<{ baseId: string; tableId: string }>;
}>;

export default async function BaseTablePage({ params }: BaseTablePageProps) {
  const { baseId, tableId } = await params;

  const table = await api.table.getById({ tableId });
  if (table?.baseId !== baseId) notFound();

  const firstView = table.views[0];
  if (!firstView) notFound();

  redirect(`/base/${baseId}/table/${tableId}/view/${firstView?.id}`);
}
