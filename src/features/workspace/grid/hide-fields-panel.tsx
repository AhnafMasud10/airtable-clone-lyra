"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GridField } from "./types";

type HideFieldsPanelProps = Readonly<{
  allFields: GridField[];
  hiddenFieldIds: string[];
  onToggleField: (fieldId: string) => void;
  onHideAll: () => void;
  onShowAll: () => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}>;

function FieldTypeIcon({ type }: Readonly<{ type: string }>) {
  if (type === "NUMBER") {
    return (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="shrink-0 text-[rgb(97,102,112)]">
        <path d="M3 2.5h1.5v11H3v-11Zm8.5 0H13v11h-1.5v-11ZM6 7.25h4v1.5H6v-1.5Z" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="shrink-0 text-[rgb(97,102,112)]">
      <path d="M2 4.5h12a.5.5 0 0 0 0-1H2a.5.5 0 0 0 0 1Zm0 4h8a.5.5 0 0 0 0-1H2a.5.5 0 0 0 0 1Zm0 4h10a.5.5 0 0 0 0-1H2a.5.5 0 0 0 0 1Z" />
    </svg>
  );
}

function Toggle({ checked, onChange }: Readonly<{ checked: boolean; onChange: () => void }>) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative shrink-0 rounded-full transition-colors duration-150 focus:outline-none"
      style={{
        width: 28,
        height: 16,
        backgroundColor: checked ? "rgb(32, 201, 151)" : "rgb(196, 201, 209)",
      }}
    >
      <span
        className="absolute top-0.5 rounded-full bg-white shadow-sm transition-transform duration-150"
        style={{
          width: 12,
          height: 12,
          left: 2,
          transform: checked ? "translateX(12px)" : "translateX(0)",
        }}
      />
    </button>
  );
}

function DragHandle() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="shrink-0 text-[rgb(196,201,209)]">
      <circle cx="5" cy="4" r="1.2" />
      <circle cx="5" cy="8" r="1.2" />
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="11" cy="4" r="1.2" />
      <circle cx="11" cy="8" r="1.2" />
      <circle cx="11" cy="12" r="1.2" />
    </svg>
  );
}

const FONT_FAMILY =
  "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif";

export function HideFieldsPanel({
  allFields,
  hiddenFieldIds,
  onToggleField,
  onHideAll,
  onShowAll,
  onClose,
  anchorRef,
}: HideFieldsPanelProps) {
  const [search, setSearch] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Calculate position from anchor button
  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [anchorRef]);

  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClose, anchorRef]);

  const filteredFields = allFields.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (!pos) return null;

  const panel = (
    <div
      ref={panelRef}
      className="rounded-lg border border-[rgb(220,225,234)] bg-white shadow-lg"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: 300,
        zIndex: 9999,
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* Search */}
      <div className="border-b border-[rgb(220,225,234)] px-3 py-2">
        <div className="flex items-center gap-2 rounded border border-[rgb(220,225,234)] bg-white px-2 py-1">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="shrink-0 text-[rgb(150,155,165)]">
            <path d="M11.27 10.21a6 6 0 1 0-1.06 1.06l3.26 3.26a.75.75 0 1 0 1.06-1.06l-3.26-3.26ZM7 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a field"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[rgb(29,31,37)] placeholder-[rgb(150,155,165)] outline-none"
            autoFocus
          />
        </div>
      </div>

      {/* Field list */}
      <div className="max-h-72 overflow-y-auto py-1">
        {filteredFields.map((field) => {
          const isVisible = !hiddenFieldIds.includes(field.id);
          return (
            <div
              key={field.id}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-[rgb(246,248,250)]"
              style={{ height: 36 }}
            >
              <Toggle checked={isVisible} onChange={() => onToggleField(field.id)} />
              <FieldTypeIcon type={field.type} />
              <span className="flex-1 truncate text-[13px] text-[rgb(29,31,37)]">
                {field.name}
              </span>
              <DragHandle />
            </div>
          );
        })}
        {filteredFields.length === 0 && (
          <div className="px-3 py-4 text-center text-[12px] text-[rgb(150,155,165)]">
            No fields found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-2 border-t border-[rgb(220,225,234)] px-3 py-2">
        <button
          type="button"
          onClick={onHideAll}
          className="flex-1 rounded border border-[rgb(220,225,234)] px-2 py-1.5 text-[12px] font-medium text-[rgb(97,102,112)] hover:bg-[rgb(246,248,250)]"
        >
          Hide all
        </button>
        <button
          type="button"
          onClick={onShowAll}
          className="flex-1 rounded border border-[rgb(220,225,234)] px-2 py-1.5 text-[12px] font-medium text-[rgb(97,102,112)] hover:bg-[rgb(246,248,250)]"
        >
          Show all
        </button>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
