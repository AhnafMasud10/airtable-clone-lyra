"use client";

import { useState } from "react";
import type { ViewItem } from "./types";

type ViewsSidebarProps = Readonly<{
  views: ViewItem[];
  selectedViewId: string | null;
  onSelectView: (view: ViewItem) => void;
  onCreateView: () => void;
}>;

function GridFeatureIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="2" y="2" width="12" height="12" rx="1.5" fill="none" stroke="rgb(22, 110, 225)" strokeWidth="1.2" />
      <line x1="2" y1="6" x2="14" y2="6" stroke="rgb(22, 110, 225)" strokeWidth="1.2" />
      <line x1="6" y1="6" x2="6" y2="14" stroke="rgb(22, 110, 225)" strokeWidth="1.2" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M2.5 4h11a.5.5 0 0 0 0-1h-11a.5.5 0 0 0 0 1Zm0 4.5h11a.5.5 0 0 0 0-1h-11a.5.5 0 0 0 0 1Zm0 4.5h11a.5.5 0 0 0 0-1h-11a.5.5 0 0 0 0 1Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M8 3a.5.5 0 0 1 .5.5V7.5H12a.5.5 0 0 1 0 1H8.5v4a.5.5 0 0 1-1 0V8.5H4a.5.5 0 0 1 0-1h3.5V3.5A.5.5 0 0 1 8 3Z" />
    </svg>
  );
}

function MagnifyingGlassIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M11.27 10.21a6 6 0 1 0-1.06 1.06l3.26 3.26a.75.75 0 1 0 1.06-1.06l-3.26-3.26ZM7 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6.32-2.9-.9-.37a5.17 5.17 0 0 0-.3-.73l.37-.9a.5.5 0 0 0-.1-.54l-.85-.85a.5.5 0 0 0-.54-.1l-.9.37a5.17 5.17 0 0 0-.73-.3l-.37-.9A.5.5 0 0 0 9.52 3h-1.2a.5.5 0 0 0-.48.36l-.37.9a5.17 5.17 0 0 0-.73.3l-.9-.37a.5.5 0 0 0-.54.1l-.85.85a.5.5 0 0 0-.1.54l.37.9c-.12.23-.22.48-.3.73l-.9.37A.5.5 0 0 0 3 8.38v1.2a.5.5 0 0 0 .36.48l.9.37c.08.25.18.5.3.73l-.37.9a.5.5 0 0 0 .1.54l.85.85a.5.5 0 0 0 .54.1l.9-.37c.23.12.48.22.73.3l.37.9a.5.5 0 0 0 .48.36h1.2a.5.5 0 0 0 .48-.36l.37-.9c.25-.08.5-.18.73-.3l.9.37a.5.5 0 0 0 .54-.1l.85-.85a.5.5 0 0 0 .1-.54l-.37-.9c.12-.23.22-.48.3-.73l.9-.37A.5.5 0 0 0 13 9.52v-1.2a.5.5 0 0 0-.36-.48l-.32.16Z" />
    </svg>
  );
}

function OverflowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none text-[rgb(97,102,112)]" style={{ shapeRendering: "geometricPrecision" }}>
      <circle cx="4" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="12" cy="8" r="1.25" fill="currentColor" />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <circle cx="6" cy="4" r="1" />
      <circle cx="10" cy="4" r="1" />
      <circle cx="6" cy="8" r="1" />
      <circle cx="10" cy="8" r="1" />
      <circle cx="6" cy="12" r="1" />
      <circle cx="10" cy="12" r="1" />
    </svg>
  );
}

const FONT_FAMILY =
  "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif";

export function ViewsSidebar({
  views,
  selectedViewId,
  onSelectView,
  onCreateView,
}: ViewsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredViews = searchQuery
    ? views.filter((v) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : views;

  return (
    <nav
      className="relative shrink-0 overflow-hidden"
      style={{
        width: 280,
        transition: "width 200ms ease-in",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        className="flex h-full flex-col border-r border-black/10"
        style={{ width: 280, padding: "5px 8px" }}
      >
        {/* Create new... button */}
        <div className="shrink-0 pb-2">
          <button
            type="button"
            onClick={onCreateView}
            className="flex w-full items-center rounded-lg bg-transparent px-3 text-left hover:bg-[rgb(229,233,240)]"
            style={{
              height: 32,
              fontSize: 13,
              color: "rgb(29, 31, 37)",
              justifyContent: "flex-start",
            }}
          >
            <span className="mr-2">
              <PlusIcon />
            </span>
            <span className="truncate select-none">Create new...</span>
          </button>

          {/* Search input */}
          <div className="relative mt-1">
            <div className="relative flex w-full items-center">
              <input
                type="text"
                className="h-7 w-full rounded border border-black/10 bg-white pl-7 pr-8 text-[13px] outline-none focus:border-[rgb(22,110,225)] focus:ring-1 focus:ring-[rgb(22,110,225)]"
                placeholder="Find a view"
                aria-label="Find a view"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-2 text-[rgb(97,102,112)]">
                <MagnifyingGlassIcon />
              </span>
              <span className="absolute right-1 flex items-center text-[rgb(97,102,112)]">
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded hover:bg-[rgb(229,233,240)]"
                >
                  <CogIcon />
                </button>
              </span>
            </div>
          </div>
        </div>

        {/* View list */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <ul>
            {filteredViews.map((view) => {
              const isActive = selectedViewId === view.id;
              return (
                <li key={view.id}>
                  <button
                    type="button"
                    className="group flex w-full cursor-pointer flex-col justify-center rounded px-3 py-2 text-left"
                    style={{
                      backgroundColor: isActive
                        ? "rgb(229, 233, 240)"
                        : undefined,
                    }}
                    onClick={() => onSelectView(view)}
                  >
                    <div className="flex items-center">
                      <div className="flex flex-1 items-center">
                        <span className="mr-2 flex shrink-0 items-center">
                          <GridFeatureIcon />
                        </span>
                        <span
                          className="truncate"
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            lineHeight: "18px",
                            color: "rgb(29, 31, 37)",
                          }}
                        >
                          {view.name}
                        </span>
                      </div>
                      <span className={`flex items-center gap-0.5 ${isActive ? "visible" : "invisible group-hover:visible"}`}>
                        <span
                          className="flex items-center justify-center"
                          aria-label="Menu"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <OverflowIcon />
                        </span>
                        <span className="flex items-center text-[rgb(174,178,186)]">
                          <DragHandleIcon />
                        </span>
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 top-0 cursor-col-resize bg-transparent hover:bg-[rgb(22,110,225)]"
        style={{ width: 3 }}
      />
    </nav>
  );
}
