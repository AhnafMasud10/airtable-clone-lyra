import { HomeContent } from "./home-content";
import { HomeSidebar } from "./home-sidebar";
import { HomeTopbar } from "./home-topbar";
import type { HomeBase } from "../types";

type HomePageShellProps = Readonly<{
  bases: HomeBase[];
  isError?: boolean;
}>;

export function HomePageShell({ bases, isError = false }: HomePageShellProps) {
  return (
    <main className="h-screen overflow-hidden bg-[#f2f3f6] text-[#1f2328]">
      <div className="flex h-full">
        <HomeSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <HomeTopbar />
          <section className="min-h-0 flex-1 overflow-auto px-8 py-7">
            <div className="mx-auto max-w-[980px]">
              <HomeContent bases={bases} isError={isError} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
