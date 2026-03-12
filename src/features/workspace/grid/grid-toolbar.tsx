"use client";

import type { GridField } from "./types";

type GridToolbarProps = Readonly<{
  selectedTableName: string;
  globalSearch: string;
  onGlobalSearchChange: (value: string) => void;
  fields: GridField[];
  fieldsCount: number;
  selectedTableId: string | null;
}>;

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M2.5 4h11a.5.5 0 0 0 0-1h-11a.5.5 0 0 0 0 1Zm0 4.5h11a.5.5 0 0 0 0-1h-11a.5.5 0 0 0 0 1Zm0 4.5h11a.5.5 0 0 0 0-1h-11a.5.5 0 0 0 0 1Z" />
    </svg>
  );
}

function GridFeatureIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="2" y="2" width="12" height="12" rx="1.5" fill="none" stroke="rgb(22, 110, 225)" strokeWidth="1.2" />
      <line x1="2" y1="6" x2="14" y2="6" stroke="rgb(22, 110, 225)" strokeWidth="1.2" />
      <line x1="6" y1="6" x2="6" y2="14" stroke="rgb(22, 110, 225)" strokeWidth="1.2" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function MagnifyingGlassIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M11.27 10.21a6 6 0 1 0-1.06 1.06l3.26 3.26a.75.75 0 1 0 1.06-1.06l-3.26-3.26ZM7 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />
    </svg>
  );
}

type ToolbarButtonProps = Readonly<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}>;

function ToolbarButton({ icon, label, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center rounded px-2 py-1 text-[rgb(97,102,112)] hover:bg-[rgb(229,233,240)]"
    >
      {icon}
      <div className="ml-1 max-w-24 truncate" style={{ fontSize: 13 }}>
        {label}
      </div>
    </button>
  );
}

const FONT_FAMILY =
  "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif";

export function GridToolbar({
  selectedTableName,
  globalSearch,
  onGlobalSearchChange,
}: GridToolbarProps) {
  return (
    <section
      aria-label="View configuration"
      className="flex shrink-0 items-center gap-2 overflow-hidden border-b border-black/10 bg-white"
      style={{
        height: 48,
        minWidth: 600,
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* Left section: sidebar toggle + view name */}
      <div className="flex flex-1 items-center pl-3 pr-2">
        {/* Sidebar toggle */}
        <button
          type="button"
          className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded text-[rgb(97,102,112)] hover:bg-[rgb(229,233,240)]"
          aria-label="Close sidebar"
        >
          <ListIcon />
        </button>

        {/* View name */}
        <h2 className="flex items-center">
          <button
            type="button"
            className="flex items-center rounded px-2 hover:bg-[rgb(229,233,240)]"
            style={{ height: 26, maxWidth: "fit-content" }}
          >
            <span className="mr-2 flex shrink-0 items-center">
              <GridFeatureIcon />
            </span>
            <span
              className="mr-2 truncate"
              style={{
                fontSize: 13,
                fontWeight: 600,
                maxWidth: 200,
                color: "rgb(29, 31, 37)",
              }}
            >
              Grid view
            </span>
            <ChevronDownIcon />
          </button>
        </h2>
      </div>

      {/* Right section: toolbar buttons */}
      <div className="flex flex-1 items-center justify-end pr-2" style={{ height: 48 }}>
        <div className="flex items-center">
          {/* Hide fields */}
          <ToolbarButton
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
                <path d="M2.2 8.7c-.3-.4-.3-.9 0-1.3C3.5 5.4 5.6 4 8 4s4.5 1.4 5.8 3.3c.3.4.3 1 0 1.4C12.5 10.6 10.4 12 8 12s-4.5-1.4-5.8-3.3ZM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            }
            label="Hide fields"
          />

          {/* Filter */}
          <ToolbarButton
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
                <path d="M2 4.5h12a.5.5 0 0 0 0-1H2a.5.5 0 0 0 0 1Zm2 4h8a.5.5 0 0 0 0-1H4a.5.5 0 0 0 0 1Zm2 4h4a.5.5 0 0 0 0-1H6a.5.5 0 0 0 0 1Z" />
              </svg>
            }
            label="Filter"
          />

          {/* Group */}
          <ToolbarButton
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
                <rect x="2" y="2" width="5" height="5" rx="1" />
                <rect x="9" y="2" width="5" height="5" rx="1" />
                <rect x="2" y="9" width="5" height="5" rx="1" />
                <rect x="9" y="9" width="5" height="5" rx="1" />
              </svg>
            }
            label="Group"
          />

          {/* Sort */}
          <ToolbarButton
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
                <path d="M4.5 2.5v11M4.5 13.5l-2-2m2 2 2-2M11.5 13.5v-11M11.5 2.5l-2 2m2-2 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            }
            label="Sort"
          />

          {/* Color */}
          <ToolbarButton
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
                <path d="M10.5 2.5 3 10v3h3l7.5-7.5-3-3Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            label="Color"
          />

          {/* Row height */}
          <div className="mr-2 flex cursor-pointer items-center rounded px-2 py-1 text-[rgb(97,102,112)] hover:bg-[rgb(229,233,240)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </svg>
          </div>

          {/* Share and sync */}
          <ToolbarButton
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
                <path d="M10 2h4v4m0-4L8 8M6 3H3v10h10v-3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            label="Share and sync"
          />
        </div>

        {/* Search toggle */}
        <button
          type="button"
          className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded text-[rgb(97,102,112)] hover:bg-[rgb(229,233,240)]"
          aria-label="toggle view search input"
        >
          <MagnifyingGlassIcon />
        </button>
      </div>

      {/* Hidden expanded search (shows when search is active) */}
      {globalSearch !== "" && (
        <div className="absolute right-3 top-1 z-10">
          <input
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
            placeholder={`Search ${selectedTableName}`}
            className="h-7 w-48 rounded border border-[rgb(22,110,225)] bg-white px-2 text-[13px] outline-none"
            autoFocus
          />
        </div>
      )}

    </section>
  );
}
