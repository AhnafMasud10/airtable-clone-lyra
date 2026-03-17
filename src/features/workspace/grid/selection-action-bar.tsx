"use client";

import { createPortal } from "react-dom";

type SelectionActionBarProps = Readonly<{
  selectedCount: number;
  onDelete: () => void;
  isDeleting: boolean;
}>;

function OmniIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
        <g key={i} transform={`rotate(${angle}, 10, 10)`}>
          <rect
            x="9" y="1.5" width="2" height="2"
            rx="0.5"
            fill="currentColor"
            opacity={0.15 + i * 0.07}
          />
        </g>
      ))}
      <rect x="4" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="14" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function RobotIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M9 11V8a3 3 0 0 1 6 0v3" />
      <circle cx="9" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 3v2" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

export function SelectionActionBar({ selectedCount, onDelete, isDeleting }: SelectionActionBarProps) {
  if (selectedCount === 0) return null;

  const bar = (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999]"
      style={{ fontFamily: "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div className="rounded-xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.16)] border border-[rgb(214,218,226)] overflow-hidden" style={{ minWidth: 280 }}>

        {/* Ask Omni */}
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3 text-left bg-[rgb(247,249,251)] hover:bg-[rgb(240,243,247)] transition-colors"
        >
          <span className="flex-none text-[rgb(97,102,112)]">
            <OmniIcon />
          </span>
          <span className="text-[13px] font-medium text-[rgb(29,31,37)]">
            Ask Omni about {selectedCount} {selectedCount === 1 ? "record" : "records"}
          </span>
        </button>

        <div className="h-px bg-[rgb(229,233,240)]" />

        {/* Run field agent */}
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[rgb(247,249,251)] transition-colors"
        >
          <span className="flex-none text-[rgb(97,102,112)]">
            <RobotIcon />
          </span>
          <span className="flex-1 text-[13px] text-[rgb(29,31,37)]">Run field agent</span>
          <span className="flex-none text-[rgb(150,155,165)]">
            <ChevronRight />
          </span>
        </button>

        <div className="h-px bg-[rgb(229,233,240)]" />

        {/* Send all selected records */}
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[rgb(247,249,251)] transition-colors"
        >
          <span className="flex-none text-[rgb(97,102,112)]">
            <EnvelopeIcon />
          </span>
          <span className="text-[13px] text-[rgb(29,31,37)]">Send all selected records</span>
        </button>

        <div className="h-px bg-[rgb(229,233,240)]" />

        {/* Delete all selected records */}
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[rgb(255,245,245)] transition-colors disabled:opacity-50"
        >
          <span className="flex-none text-[rgb(195,60,60)]">
            <TrashIcon />
          </span>
          <span className="text-[13px] font-medium text-[rgb(195,60,60)]">
            {isDeleting ? "Deleting…" : "Delete all selected records"}
          </span>
        </button>

      </div>
    </div>
  );

  return createPortal(bar, document.body);
}
