import { HomeContent } from "./home-content";
import { HomeSidebar } from "./home-sidebar";
import { HomeTopbar } from "./home-topbar";

export function HomePageShell() {
  return (
    <main className="h-screen overflow-hidden bg-white text-[#333333]">
      <div className="flex h-full flex-col">
        <HomeTopbar />
        <div className="flex min-h-0 flex-1">
          <HomeSidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-auto bg-[#f8f8f8]">
            <div className="mx-auto w-full max-w-[1920px] flex-1 px-7 pt-6">
              <HomeContent />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
