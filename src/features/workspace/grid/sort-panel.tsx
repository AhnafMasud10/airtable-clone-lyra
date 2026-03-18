"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GridField, GridSort } from "./types";

const PANEL_WIDTH = 420;
const FONT_FAMILY =
  "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif";

type SortPanelProps = Readonly<{
  sorts: GridSort[];
  onSortsChange: (sorts: GridSort[]) => void;
  allFields: GridField[];
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}>;

function getSortType(field: GridField): "text" | "number" {
  return field.type === "NUMBER" ? "number" : "text";
}

function makeDefaultSort(field: GridField): GridSort {
  return {
    fieldId: field.id,
    direction: "asc",
    type: getSortType(field),
  };
}

function ChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className="flex-none"
      aria-hidden="true"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path
        fill="currentColor"
        d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className="icon flex-none"
      aria-hidden="true"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path
        fill="currentColor"
        d="M6.5 1h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1ZM3 3.5h10a.5.5 0 0 1 0 1H12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8H3a.5.5 0 0 1 0-1Zm2.5 1v8h5v-8h-5Z"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className="icon flex-none"
      aria-hidden="true"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path
        fill="currentColor"
        d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"
      />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none text-[rgb(174,178,186)]"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <circle cx="6" cy="4" r="1" />
      <circle cx="10" cy="4" r="1" />
      <circle cx="6" cy="8" r="1" />
      <circle cx="10" cy="8" r="1" />
      <circle cx="6" cy="12" r="1" />
      <circle cx="10" cy="12" r="1" />
    </svg>
  );
}

function getDirectionLabel(direction: "asc" | "desc", type: "text" | "number") {
  if (type === "text") return direction === "asc" ? "A → Z" : "Z → A";
  return direction === "asc" ? "1 → 9" : "9 → 1";
}

function calcPos(anchor: HTMLButtonElement) {
  const rect = anchor.getBoundingClientRect();
  const padding = 8;
  const left = Math.max(
    padding,
    Math.min(rect.left, window.innerWidth - PANEL_WIDTH - padding),
  );
  return { top: rect.bottom + 4, left };
}

type SortRowProps = Readonly<{
  sort: GridSort;
  allFields: GridField[];
  usedFieldIds: Set<string>;
  isFirst: boolean;
  onChange: (sort: GridSort) => void;
  onDelete: () => void;
}>;

function SortRow({
  sort,
  allFields,
  usedFieldIds,
  isFirst,
  onChange,
  onDelete,
}: SortRowProps) {
  const [openDropdown, setOpenDropdown] = useState<"field" | "direction" | null>(
    null,
  );
  const [fieldSearch, setFieldSearch] = useState("");
  const rowRef = useRef<HTMLDivElement>(null);
  const fieldTriggerRef = useRef<HTMLButtonElement>(null);
  const dirTriggerRef = useRef<HTMLButtonElement>(null);

  const selectedField = allFields.find((f) => f.id === sort.fieldId);
  const dirLabel = getDirectionLabel(sort.direction, sort.type);

  useEffect(() => {
    if (!openDropdown) return;
    function handleDown(e: MouseEvent) {
      const target = e.target as Node;
      if (rowRef.current?.contains(target)) return;
      if ((target as Element).closest?.("[data-sort-dropdown]")) return;
      setOpenDropdown(null);
    }
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [openDropdown]);

  const availableFields = allFields.filter(
    (f) => f.id === sort.fieldId || !usedFieldIds.has(f.id),
  );
  const filteredFields = availableFields.filter((f) =>
    f.name.toLowerCase().includes(fieldSearch.toLowerCase()),
  );

  const handleFieldSelect = (field: GridField) => {
    onChange({
      fieldId: field.id,
      direction: sort.direction,
      type: getSortType(field),
    });
    setOpenDropdown(null);
    setFieldSearch("");
  };

  const handleDirectionSelect = (direction: "asc" | "desc") => {
    onChange({ ...sort, direction });
    setOpenDropdown(null);
  };

  return (
    <div
      ref={rowRef}
      className="flex w-full items-center gap-2"
      style={{ minHeight: 38 }}
    >
      {/* Drag handle + "Sort by" / "then by" label */}
      <div className="flex shrink-0 items-center gap-1" style={{ width: 90 }}>
        <DragHandleIcon />
        <span className="text-[13px] text-[rgb(97,102,112)]">
          {isFirst ? "Sort by" : "then by"}
        </span>
      </div>

      {/* Main sort control row */}
      <div className="flex min-w-0 flex-1 items-center">
        <div
          className="flex items-stretch rounded border border-[rgb(214,218,226)] bg-white"
          style={{ height: 30, flex: 1 }}
        >
          {/* Field selector */}
          <div className="relative flex items-stretch border-r border-[rgb(214,218,226)]" style={{ flex: 1 }}>
            <button
              ref={fieldTriggerRef}
              type="button"
              onClick={() =>
                setOpenDropdown((d) => (d === "field" ? null : "field"))
              }
              className="flex h-full w-full items-center px-2 text-[13px] text-[rgb(29,31,37)] hover:bg-[rgb(246,248,250)] focus:outline-none"
            >
              <div className="flex-auto truncate text-left">
                {selectedField?.name ?? "Select field"}
              </div>
              <div className="ml-1 flex flex-none items-center">
                <ChevronDown />
              </div>
            </button>
            {openDropdown === "field" &&
              fieldTriggerRef.current &&
              createPortal(
                <div
                  data-popup
                  data-sort-dropdown
                  className="fixed z-[10000] w-52 rounded-lg border border-[rgb(214,218,226)] bg-white shadow-lg"
                  style={{
                    top:
                      fieldTriggerRef.current.getBoundingClientRect().bottom + 4,
                    left: fieldTriggerRef.current.getBoundingClientRect().left,
                  }}
                >
                  <div className="border-b border-[rgb(214,218,226)] px-3 py-2">
                    <input
                      type="text"
                      value={fieldSearch}
                      onChange={(e) => setFieldSearch(e.target.value)}
                      placeholder="Find a field"
                      className="w-full bg-transparent text-[13px] text-[rgb(29,31,37)] placeholder-[rgb(150,155,165)] outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto py-1" style={{ maxHeight: 260 }}>
                    {filteredFields.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleFieldSelect(f)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[rgb(29,31,37)] hover:bg-[rgb(246,248,250)]"
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>,
                document.body,
              )}
          </div>

          {/* Direction selector */}
          <div className="relative flex items-stretch border-r border-[rgb(214,218,226)]" style={{ width: 100 }}>
            <button
              ref={dirTriggerRef}
              type="button"
              onClick={() =>
                setOpenDropdown((d) => (d === "direction" ? null : "direction"))
              }
              className="flex h-full w-full items-center px-2 text-[13px] text-[rgb(29,31,37)] hover:bg-[rgb(246,248,250)] focus:outline-none"
            >
              <div className="flex-auto truncate text-left">{dirLabel}</div>
              <div className="ml-1 flex flex-none items-center">
                <ChevronDown />
              </div>
            </button>
            {openDropdown === "direction" &&
              dirTriggerRef.current &&
              createPortal(
                <div
                  data-popup
                  data-sort-dropdown
                  className="fixed z-[10000] w-36 rounded-lg border border-[rgb(214,218,226)] bg-white py-1 shadow-lg"
                  style={{
                    top:
                      dirTriggerRef.current.getBoundingClientRect().bottom + 4,
                    left: dirTriggerRef.current.getBoundingClientRect().left,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleDirectionSelect("asc")}
                    className={`flex w-full items-center px-3 py-2 text-left text-[13px] hover:bg-[rgb(246,248,250)] ${sort.direction === "asc" ? "font-semibold text-[rgb(22,110,225)]" : "text-[rgb(29,31,37)]"}`}
                  >
                    {getDirectionLabel("asc", sort.type)}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectionSelect("desc")}
                    className={`flex w-full items-center px-3 py-2 text-left text-[13px] hover:bg-[rgb(246,248,250)] ${sort.direction === "desc" ? "font-semibold text-[rgb(22,110,225)]" : "text-[rgb(29,31,37)]"}`}
                  >
                    {getDirectionLabel("desc", sort.type)}
                  </button>
                </div>,
                document.body,
              )}
          </div>

          {/* Delete button */}
          <button
            type="button"
            onClick={onDelete}
            className="flex flex-none items-center justify-center text-[rgb(97,102,112)] hover:bg-[rgb(246,248,250)] focus:outline-none"
            style={{ width: 32 }}
            aria-label="Remove sort"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SortPanel({
  sorts,
  onSortsChange,
  allFields,
  onClose,
  anchorRef,
}: SortPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    setPos(calcPos(anchorRef.current));
    function onResize() {
      if (anchorRef.current) setPos(calcPos(anchorRef.current));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [anchorRef]);

  useEffect(() => {
    function handleDown(e: MouseEvent) {
      const target = e.target as Node;
      const el = target as Element;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target) &&
        !el.closest?.("[data-popup]")
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [onClose, anchorRef]);

  const usedFieldIds = new Set(sorts.map((s) => s.fieldId));

  const handleAdd = () => {
    const available = allFields.find((f) => !usedFieldIds.has(f.id));
    if (!available) return;
    onSortsChange([...sorts, makeDefaultSort(available)]);
  };

  const handleChange = (i: number, s: GridSort) => {
    const next = [...sorts];
    next[i] = s;
    onSortsChange(next);
  };

  const handleDelete = (i: number) => {
    onSortsChange(sorts.filter((_, idx) => idx !== i));
  };

  if (!pos) return null;

  const panel = (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: PANEL_WIDTH,
        zIndex: 9999,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        className="flex flex-col overflow-hidden rounded border border-[rgb(214,218,226)] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-[11px] leading-none font-semibold tracking-wide text-[rgb(97,102,112)] uppercase">
            Sort
          </h3>
        </div>

        {/* Sort rows */}
        <div className="overflow-auto px-4" style={{ maxHeight: 425 }}>
          {sorts.length === 0 && (
            <div className="py-2 text-[13px] text-[rgb(150,155,165)]">
              No sorts applied to this view
            </div>
          )}
          <div className="flex flex-col gap-1 pb-2">
            {sorts.map((sort, i) => (
              <SortRow
                key={sort.fieldId}
                sort={sort}
                allFields={allFields}
                usedFieldIds={usedFieldIds}
                isFirst={i === 0}
                onChange={(s) => handleChange(i, s)}
                onDelete={() => handleDelete(i)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center border-t border-[rgb(214,218,226)] px-4 py-3">
          <button
            type="button"
            onClick={handleAdd}
            disabled={usedFieldIds.size >= allFields.length}
            className="flex items-center gap-1 text-[13px] text-[rgb(97,102,112)] hover:text-[rgb(29,31,37)] disabled:opacity-40 focus:outline-none"
          >
            <PlusIcon />
            <span>Add sort</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
