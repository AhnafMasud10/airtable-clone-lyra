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
          <div className="flex min-w-0 flex-1 flex-col overflow-auto" style={{ backgroundColor: "#f9f9f9", minWidth: 480 }}>
            <div className="flex-auto px-[53px] pt-[45px]" style={{ maxWidth: 1920 }}>
              <HomeContent />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
