/* Phosphor icons (regular weight) matching Airtable's footer icon set */

function BookOpenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#333]" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M128 88a32 32 0 0 0-32-32H48v152h56a24 24 0 0 1 24 24" />
      <path d="M128 88a32 32 0 0 1 32-32h48v152h-56a24 24 0 0 0-24 24" />
    </svg>
  );
}

function ShoppingBagOpenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#333]" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="32" y="48" width="192" height="176" rx="8" />
      <path d="M88 88a40 40 0 0 0 80 0" />
      <line x1="32" y1="88" x2="224" y2="88" />
    </svg>
  );
}

function UploadSimpleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#333]" style={{ shapeRendering: "geometricPrecision" }}>
      <line x1="128" y1="152" x2="128" y2="40" />
      <polyline points="88 80 128 40 168 80" />
      <path d="M216 152v56a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8v-56" />
    </svg>
  );
}

export function SidebarFooterLinks() {
  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center rounded px-[8px] hover:bg-[#f5f5f5]"
        style={{ height: 32 }}
      >
        <BookOpenIcon />
        <span className="ml-[4px] text-[14px] font-normal leading-[22px] text-[#333]">Templates and apps</span>
      </button>
      <a
        href="#"
        className="flex w-full items-center rounded px-[8px] no-underline hover:bg-[#f5f5f5]"
        style={{ height: 32 }}
      >
        <ShoppingBagOpenIcon />
        <span className="ml-[4px] text-[14px] font-normal leading-[22px] text-[#333]">Marketplace</span>
      </a>
      <button
        type="button"
        className="flex w-full items-center rounded px-[8px] hover:bg-[#f5f5f5]"
        style={{ height: 32 }}
      >
        <UploadSimpleIcon />
        <span className="ml-[4px] text-[14px] font-normal leading-[22px] text-[#333]">Import</span>
      </button>
    </div>
  );
}
