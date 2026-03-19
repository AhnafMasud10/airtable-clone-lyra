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
  const cls = "flex-none ml-2 mr-1.5 text-[rgb(97,102,112)]";
  switch (type) {
    case "USER":
    case "ASSIGNEE":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={cls} aria-hidden="true">
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 5.5a5 5 0 0 1 10 0H3Z" />
        </svg>
      );
    case "STATUS":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={cls} aria-hidden="true">
          <path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2ZM.5 8a7.5 7.5 0 1 1 15 0 7.5 7.5 0 0 1-15 0Zm4.97 2.47 4-4a.75.75 0 1 1 1.06 1.06l-4 4-2-2a.75.75 0 1 1 1.06-1.06l.88.94Z" />
        </svg>
      );
    case "ATTACHMENT":
    case "ATTACHMENTS":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={cls} aria-hidden="true">
          <path d="M4 2.5A1.5 1.5 0 0 1 5.5 1h5.586a1.5 1.5 0 0 1 1.06.44l1.915 1.914A1.5 1.5 0 0 1 14.5 4.414V13.5a1.5 1.5 0 0 1-1.5 1.5h-7.5A1.5 1.5 0 0 1 4 13.5v-11Zm1.5-.5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V4.914L11.086 3.5H10V5a.5.5 0 0 1-.5.5h-3A.5.5 0 0 1 6 5V3H5.5Zm1 0v2h2V2H6.5Z" />
        </svg>
      );
    case "DATE":
    case "CALENDAR":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={cls} aria-hidden="true">
          <path d="M5 0a.75.75 0 0 1 .75.75V2h4.5V.75a.75.75 0 0 1 1.5 0V2H13a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 13 15H3a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 3 2h1.25V.75A.75.75 0 0 1 5 0Zm-2 5.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8H3Zm2 2h1.5v1.5H5V7.5Zm0 3h1.5V12H5v-1.5Zm3-3h1.5v1.5H8V7.5Zm0 3h1.5V12H8v-1.5Zm3-3h1.5v1.5H11V7.5Z" />
        </svg>
      );
    case "NUMBER":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={cls} aria-hidden="true">
          <path d="M3 2.5h1.5v11H3v-11Zm8.5 0H13v11h-1.5v-11ZM6 7.25h4v1.5H6v-1.5Z" />
        </svg>
      );
    case "LONG_TEXT":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={cls} aria-hidden="true">
          <path d="M2 3.75A.75.75 0 0 1 2.75 3h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75Zm0 4A.75.75 0 0 1 2.75 7h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 7.75Zm0 4A.75.75 0 0 1 2.75 11h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 2 11.75Z" />
        </svg>
      );
    default:
      // TEXT / single line
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={cls} aria-hidden="true">
          <path d="M2 3.75A.75.75 0 0 1 2.75 3h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75Zm0 4A.75.75 0 0 1 2.75 7h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 2 7.75Zm0 4A.75.75 0 0 1 2.75 11h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 2 11.75Z" />
        </svg>
      );
  }
}

function PillToggle({ checked }: Readonly<{ checked: boolean }>) {
  return (
    <div
      className="flex flex-none items-center rounded-full transition-colors duration-150"
      style={{
        width: 13,
        height: 8,
        padding: 2,
        backgroundColor: checked ? "rgb(45, 127, 249)" : "rgb(196, 201, 209)",
        justifyContent: checked ? "flex-end" : "flex-start",
      }}
    >
      <div
        className="rounded-full bg-white flex-none"
        style={{ width: 4, height: 4 }}
      />
    </div>
  );
}

function DragHandle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" aria-hidden="true">
      <circle cx="6" cy="4" r="1" />
      <circle cx="6" cy="8" r="1" />
      <circle cx="6" cy="12" r="1" />
      <circle cx="10" cy="4" r="1" />
      <circle cx="10" cy="8" r="1" />
      <circle cx="10" cy="12" r="1" />
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

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [anchorRef]);

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
      data-popup
      className="rounded-lg bg-white overflow-hidden"
      style={{
        position: "fixed",
        top: Math.min(pos.top, window.innerHeight - 200),
        left: Math.min(pos.left, window.innerWidth - 340),
        minWidth: "20rem",
        maxWidth: "calc(100vw - 16px)",
        maxHeight: "calc(100vh - 16px)",
        zIndex: 9999,
        fontFamily: FONT_FAMILY,
        boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.12)",
      }}
    >
      {/* Search row */}
      <div
        className="flex items-center mx-3 mt-1"
        style={{ borderBottom: "2px solid rgb(224,226,231)" }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find a field"
          className="flex-auto min-w-0 bg-transparent text-[13px] text-[rgb(29,31,37)] placeholder-[rgb(150,155,165)] outline-none py-1.5 px-0"
          style={{ border: 0 }}
          autoFocus
        />
        <button
          type="button"
          aria-label="Learn more about hiding fields"
          className="flex items-center text-[rgb(150,155,165)] hover:text-[rgb(97,102,112)] ml-2 focus:outline-none"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 8 1.5ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-2.75a1 1 0 0 0-.956.703.75.75 0 1 1-1.432-.452 2.5 2.5 0 1 1 3.127 3.153.75.75 0 0 1-.739.596.75.75 0 0 1-.75-.75V8a.75.75 0 0 1 .75-.75 1 1 0 1 0 0-2ZM7.25 11a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Z" />
          </svg>
        </button>
      </div>

      {/* Field list */}
      <div
        className="overflow-y-auto px-2 pt-0.5 pb-0.5"
        style={{ minHeight: 100, maxHeight: "calc(100vh - 380px)" }}
      >
        <ul className="m-0 list-none p-0">
          {filteredFields.map((field) => {
            const isVisible = !hiddenFieldIds.includes(field.id);
            return (
              <li key={field.id} className="mt-1">
                <div className="flex items-center">
                  {/* Toggle + icon + name (clickable area) */}
                  <div
                    role="checkbox"
                    aria-checked={isVisible}
                    tabIndex={0}
                    onClick={() => onToggleField(field.id)}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        onToggleField(field.id);
                      }
                    }}
                    className="flex flex-auto items-center px-1 rounded cursor-pointer hover:bg-[rgb(242,244,247)] select-none"
                    style={{ minHeight: 24 }}
                  >
                    <PillToggle checked={isVisible} />
                    <FieldTypeIcon type={field.type} />
                    <div className="flex-auto truncate text-sm text-[rgb(29,31,37)]">
                      {field.name}
                    </div>
                  </div>
                  {/* Drag handle */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Drag to reorder"
                    className="flex items-center ml-0.5 cursor-grab text-[rgb(196,201,209)] hover:text-[rgb(150,155,165)] focus:outline-none"
                    style={{ padding: "0 2px" }}
                  >
                    <DragHandle />
                  </div>
                </div>
              </li>
            );
          })}
          {filteredFields.length === 0 && (
            <li className="px-4 py-5 text-center text-xs text-[rgb(150,155,165)]">
              No fields found
            </li>
          )}
        </ul>
      </div>

      {/* Footer: Hide all / Show all */}
      <div className="mt-1 mb-2">
        <div className="flex px-2">
          <button
            type="button"
            onClick={onHideAll}
            className="flex-1 mx-1 text-center text-[13px] font-semibold text-[rgb(97,102,112)] rounded py-1 bg-[rgb(242,244,247)] hover:bg-[rgb(229,233,240)] focus:outline-none cursor-pointer"
          >
            Hide all
          </button>
          <button
            type="button"
            onClick={onShowAll}
            className="flex-1 mx-1 text-center text-[13px] font-semibold text-[rgb(97,102,112)] rounded py-1 bg-[rgb(242,244,247)] hover:bg-[rgb(229,233,240)] focus:outline-none cursor-pointer"
          >
            Show all
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
