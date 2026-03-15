import { HomePageShell } from "~/features/home/components/home-page-shell";
import { api } from "~/trpc/server";

export default async function Home() {
  const bases = await api.base.list();
  return <HomePageShell bases={bases} />;
}
