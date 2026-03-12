export function SidebarFooterLinks() {
  return (
    <div className="space-y-2 border-t border-[#eceef2] pt-4 text-sm text-[#4e5a69]">
      <button
        type="button"
        className="block w-full rounded px-1 py-1 text-left hover:bg-[#eef1f5] hover:text-[#1f57d2]"
      >
        Templates and apps
      </button>
      <button
        type="button"
        className="block w-full rounded px-1 py-1 text-left hover:bg-[#eef1f5] hover:text-[#1f57d2]"
      >
        Marketplace
      </button>
      <button
        type="button"
        className="block w-full rounded px-1 py-1 text-left hover:bg-[#eef1f5] hover:text-[#1f57d2]"
      >
        Import
      </button>
    </div>
  );
}
