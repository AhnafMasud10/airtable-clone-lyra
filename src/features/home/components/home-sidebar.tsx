import { CreateBaseButton } from "./create-base-button";
import { SidebarFooterLinks } from "./sidebar-footer-links";
import { SidebarNavItem } from "./sidebar-nav-item";

/* Phosphor icons (regular weight) matching Airtable's icon set */

function HouseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M152 208V160a8 8 0 0 0-8-8h-32a8 8 0 0 0-8 8v48a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V115.5a8 8 0 0 1 2.6-5.9l80-72.7a8 8 0 0 1 10.8 0l80 72.7a8 8 0 0 1 2.6 5.9V208a8 8 0 0 1-8 8h-48a8 8 0 0 1-8-8Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M128 18.3l30.3 61.4 67.8 9.9-49 47.8 11.6 67.5L128 173.5 67.3 204.9l11.6-67.5-49-47.8 67.8-9.9Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M176 104h24a8 8 0 0 1 8 8v96a8 8 0 0 1-8 8H56a8 8 0 0 1-8-8v-96a8 8 0 0 1 8-8h24" />
      <polyline points="88 64 128 24 168 64" />
      <line x1="128" y1="24" x2="128" y2="136" />
    </svg>
  );
}

function UsersThreeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ shapeRendering: "geometricPrecision" }}>
      <circle cx="128" cy="140" r="40" />
      <path d="M196 116a24 24 0 1 0-17.9-40" />
      <path d="M60 116a24 24 0 0 1 17.9-40" />
      <path d="M64 220a64 64 0 0 1 128 0" />
      <path d="M192 220c11.1-8.1 21.2-25.5 24-44" />
      <path d="M40 220c11.1-8.1 21.2-25.5 24-44" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ shapeRendering: "geometricPrecision" }}>
      <polyline points="208 96 128 176 48 96" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ shapeRendering: "geometricPrecision" }}>
      <line x1="40" y1="128" x2="216" y2="128" />
      <line x1="128" y1="40" x2="128" y2="216" />
    </svg>
  );
}

export function HomeSidebar() {
  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-[#e5e5e5] bg-white">
      <nav className="flex flex-none flex-col overflow-y-auto px-[12px] py-[12px]" style={{ minHeight: 579, height: "100%" }}>
        <div className="flex flex-auto flex-col">
          {/* Home */}
          <SidebarNavItem
            label="Home"
            href="/"
            active
            icon={<HouseIcon />}
          />

          {/* Starred */}
          <SidebarNavItem
            label="Starred"
            icon={<StarIcon />}
            trailing={
              <button type="button" className="m-[4px] flex items-center rounded p-[4px] hover:bg-[#e8e8e8]" aria-label="Collapse starred items" aria-expanded="true">
                <ChevronDownIcon className="text-[#333]" />
              </button>
            }
          />

          {/* Starred empty state */}
          <div className="flex w-full items-center truncate px-[12px]">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded border border-[#e5e5e5]">
              <svg width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="#ccc" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" style={{ shapeRendering: "geometricPrecision" }}>
                <path d="M128 18.3l30.3 61.4 67.8 9.9-49 47.8 11.6 67.5L128 173.5 67.3 204.9l11.6-67.5-49-47.8 67.8-9.9Z" />
              </svg>
            </div>
            <p className="ml-[12px] whitespace-normal py-[8px] text-left text-[11.5px] leading-[16px] text-[#888]">
              Your starred bases, interfaces, and workspaces will appear here
            </p>
          </div>

          {/* Shared */}
          <SidebarNavItem
            label="Shared"
            href="/shared"
            icon={<ShareIcon />}
          />

          {/* Workspaces */}
          <div className="mb-[8px] flex items-center justify-between rounded hover:bg-[#f5f5f5]">
            <a href="/workspaces" className="flex flex-1 items-center rounded px-[12px] py-[8px] no-underline">
              <h4 className="text-[16px] font-medium leading-[22px] text-[#333]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-[8px] flex shrink-0 items-center">
                      <UsersThreeIcon />
                    </span>
                    Workspaces
                  </div>
                  <button type="button" className="flex items-center rounded p-[4px] hover:bg-[#e8e8e8]" aria-label="Create a workspace" style={{ marginRight: -16 }}>
                    <PlusIcon className="text-[#333]" />
                  </button>
                </div>
              </h4>
            </a>
            <button type="button" className="m-[4px] flex items-center rounded p-[4px] hover:bg-[#e8e8e8]" aria-label="Expand workspaces" aria-expanded="false">
              <ChevronDownIcon className="text-[#333]" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div>
          <div className="mb-[16px] border-t border-[#e5e5e5]" />
          <SidebarFooterLinks />
          <div className="mt-[16px] mb-[8px]">
            <CreateBaseButton />
          </div>
        </div>
      </nav>
    </aside>
  );
}
