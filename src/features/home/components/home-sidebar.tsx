import { CreateBaseButton } from "./create-base-button";
import { SidebarFooterLinks } from "./sidebar-footer-links";
import { SidebarNavItem } from "./sidebar-nav-item";

export function HomeSidebar() {
  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-[#e5e5e5] bg-white">
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3">
        <div className="space-y-0.5">
          <SidebarNavItem
            label="Home"
            href="/"
            active
            icon={
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6.5 6.5A.5.5 0 0 0 1.5 8.5h1v5a1 1 0 0 0 1 1h2.5a.5.5 0 0 0 .5-.5v-3h2v3a.5.5 0 0 0 .5.5H11.5a1 1 0 0 0 1-1v-5h1a.5.5 0 0 0 .354-.854l-6.5-6.5z" />
              </svg>
            }
          />
          <SidebarNavItem
            label="Starred"
            icon={
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1.63l1.76 3.57.39.8.88.13 3.94.57-2.85 2.78-.64.62.15.88.67 3.93-3.52-1.85L8 12.7l-.78.41-3.52 1.85.67-3.93.15-.88-.64-.62L1.03 6.7l3.94-.57.88-.13.39-.8L8 1.63z" />
              </svg>
            }
            trailing={
              <button type="button" className="flex items-center p-0.5 rounded hover:bg-[#f2f2f2]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-[#666]">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            }
          />

          {/* Starred empty state */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded border border-[#e5e5e5]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#ccc">
                <path d="M8 1.63l1.76 3.57.39.8.88.13 3.94.57-2.85 2.78-.64.62.15.88.67 3.93-3.52-1.85L8 12.7l-.78.41-3.52 1.85.67-3.93.15-.88-.64-.62L1.03 6.7l3.94-.57.88-.13.39-.8L8 1.63z" />
              </svg>
            </div>
            <p className="text-xs leading-4 text-[#888]">
              Your starred bases, interfaces, and workspaces will appear here
            </p>
          </div>

          <SidebarNavItem
            label="Shared"
            icon={
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.5 3a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM5.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM13.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM5 8l7-5M5 8l7 5" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            }
          />
          <SidebarNavItem
            label="Workspaces"
            icon={
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z" />
              </svg>
            }
            trailing={
              <span className="flex items-center gap-1">
                <button type="button" className="flex items-center p-0.5 rounded hover:bg-[#f2f2f2]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#666]">
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                </button>
                <button type="button" className="flex items-center p-0.5 rounded hover:bg-[#f2f2f2]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-[#666]">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </span>
            }
          />
        </div>
      </div>

      <div className="px-3 pb-4">
        <SidebarFooterLinks />
        <div className="pt-4">
          <CreateBaseButton />
        </div>
      </div>
    </aside>
  );
}
