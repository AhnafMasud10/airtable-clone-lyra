import { notFound, redirect } from "next/navigation";
import { api } from "~/trpc/server";

type BasePageProps = Readonly<{
  params: Promise<{ baseId: string }>;
}>;

export default async function BasePage({ params }: BasePageProps) {
  const { baseId } = await params;
  const base = await api.base.getById({ baseId });

  if (!base) notFound();
  const firstTable = base.tables[0];
  const firstView = firstTable?.views[0];

  if (!firstTable || !firstView) notFound();

  redirect(`/base/${base.id}/table/${firstTable.id}/view/${firstView.id}`);
}
