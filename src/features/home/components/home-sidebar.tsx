import { CreateBaseButton } from "./create-base-button";
import { SidebarFooterLinks } from "./sidebar-footer-links";
import { SidebarNavItem } from "./sidebar-nav-item";

export function HomeSidebar() {
  return (
    <aside className="flex h-screen w-[232px] flex-col border-r border-[#e7eaf0] bg-[#f6f7f9]">
      <div className="px-3 pt-3 pb-3">
        <div className="mb-3 flex items-center gap-2 px-1.5">
          <span className="text-[#5a6574]">≡</span>
          <div className="h-4 w-4 rounded-sm bg-gradient-to-r from-[#ffd553] via-[#ff5f5f] to-[#4f8fff]" />
          <span className="text-[22px] font-semibold tracking-tight text-[#1f2328]">
            Airtable
          </span>
        </div>

        <div className="space-y-1">
          <SidebarNavItem label="Home" href="/" active icon="⌂" />
          <SidebarNavItem
            label="Starred"
            icon="☆"
            trailing={<span className="text-xs text-[#8a94a3]">▾</span>}
          />
          <div className="mx-2 rounded-md border border-[#ebeef3] bg-white px-3 py-2 text-[11px] leading-4 text-[#7a8594]">
            Your starred bases, interfaces, and workspaces will appear here
          </div>
          <SidebarNavItem label="Shared" icon="↗" />
          <SidebarNavItem
            label="Workspaces"
            icon="⚇"
            trailing={
              <span className="flex items-center gap-2 text-xs text-[#7a8594]">
                <span>+</span>
                <span>›</span>
              </span>
            }
          />
        </div>
      </div>

      <div className="mt-auto px-3 pb-4">
        <SidebarFooterLinks />
        <div className="pt-4">
          <CreateBaseButton />
        </div>
      </div>
    </aside>
  );
}
