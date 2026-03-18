"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GridField } from "./types";
import { FieldTypeIcon } from "./field-type-icon";

const GROUP_UNSUPPORTED_TYPES = new Set([
  "ATTACHMENT",
  "MULTIPLE_ATTACHMENT",
  "ATTACHMENTS",
]);

type GroupPanelProps = Readonly<{
  allFields: GridField[];
  onClose: () => void;
  onSelectField?: (fieldId: string) => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}>;

export function GroupPanel({
  allFields,
  onClose,
  onSelectField,
  anchorRef,
}: GroupPanelProps) {
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
      data-testid="view-config-group"
      className="rounded-lg overflow-hidden bg-white"
      style={{
        position: "fixed",
        top: Math.min(pos.top, window.innerHeight - 200),
        left: Math.min(pos.left, window.innerWidth - 340),
        minWidth: 280,
        maxWidth: "calc(100vw - 16px)",
        zIndex: 10004,
        fontFamily:
          "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{ minWidth: 280 }}>
        {/* Header */}
        <div className="px-3 py-1.5">
          <div className="flex justify-between items-center mx-1">
            <div className="flex items-center">
              <p
                className="text-[13px] font-semibold text-[rgb(97,102,112)] leading-6"
                style={{ fontFamily: "inherit" }}
              >
                Group by
              </p>
              <button
                type="button"
                aria-label="Learn more about grouping"
                className="flex items-center ml-1 text-[rgb(97,102,112)] hover:text-[rgb(29,31,37)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(22,110,225)] rounded"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="flex-none"
                  style={{ shapeRendering: "geometricPrecision" }}
                >
                  <path d="M8 1.5a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 8 1.5ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-2.75a1 1 0 0 0-.956.703.75.75 0 1 1-1.432-.452 2.5 2.5 0 1 1 3.127 3.153.75.75 0 0 1-.739.596.75.75 0 0 1-.75-.75V8a.75.75 0 0 1 .75-.75 1 1 0 1 0 0-2ZM7.25 11a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <hr className="border-t border-[rgba(0,0,0,0.1)] mx-1 my-1 border-b-0" />

        {/* Search */}
        <div className="flex items-center px-3 py-1">
          <MagnifyingGlassIcon />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a field"
            className="flex-auto border-none outline-none placeholder-[rgb(150,155,165)] pl-1.5 bg-transparent text-[13px] text-[rgb(29,31,37)]"
          />
        </div>

        {/* Field list */}
        <div
          className="overflow-auto flex flex-col justify-center px-2"
          style={{
            minHeight: 100,
            maxHeight: "calc(100vh - 380px)",
          }}
        >
          {filteredFields.map((field) => {
            const isDisabled = GROUP_UNSUPPORTED_TYPES.has(field.type);
            return (
              <div
                key={field.id}
                role="option"
                aria-disabled={isDisabled}
                aria-selected={false}
                tabIndex={isDisabled ? -1 : 0}
                title={
                  isDisabled
                    ? "This field type does not support grouping"
                    : undefined
                }
                onClick={() => {
                  if (!isDisabled && onSelectField) {
                    onSelectField(field.id);
                    onClose();
                  }
                }}
                className={`flex items-center px-3 py-1 rounded cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(22,110,225)] ${
                  isDisabled
                    ? "text-[#b2bac5] cursor-default"
                    : "hover:bg-[rgb(247,248,250)] text-[rgb(29,31,37)]"
                }`}
              >
                <FieldTypeIcon type={field.type} disabled={isDisabled} />
                <span className="truncate text-[13px]">{field.name}</span>
              </div>
            );
          })}
          {filteredFields.length === 0 && (
            <div className="px-4 py-5 text-center text-[12px] text-[rgb(150,155,165)]">
              No fields found
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}

function MagnifyingGlassIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none text-[rgb(150,155,165)]"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M11.27 10.21a6 6 0 1 0-1.06 1.06l3.26 3.26a.75.75 0 1 0 1.06-1.06l-3.26-3.26ZM7 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />
    </svg>
  );
}
