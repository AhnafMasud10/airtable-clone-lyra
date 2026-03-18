"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GridField, GridSort } from "./types";
import { FieldTypeIcon } from "./field-type-icon";

const PANEL_WIDTH = 420;
const FONT_FAMILY =
  "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

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

function CloseIcon() {
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
        d="M4.5 4.5l7 7M11.5 4.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
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

function MagnifyingGlassIcon({ color }: { color?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill={color ?? "currentColor"}
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M11.27 10.21a6 6 0 1 0-1.06 1.06l3.26 3.26a.75.75 0 1 0 1.06-1.06l-3.26-3.26ZM7 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />
    </svg>
  );
}

function HelpIcon() {
  return (
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
  );
}

function getDirectionLabel(
  direction: "asc" | "desc",
  type: "text" | "number",
) {
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

// ── Sort Row (for configured sorts view) ──────────────────────────────

type SortRowProps = Readonly<{
  sort: GridSort;
  allFields: GridField[];
  usedFieldIds: Set<string>;
  onChange: (sort: GridSort) => void;
  onDelete: () => void;
}>;

function SortRow({
  sort,
  allFields,
  usedFieldIds,
  onChange,
  onDelete,
}: SortRowProps) {
  const [openDropdown, setOpenDropdown] = useState<
    "field" | "direction" | null
  >(null);
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
      {/* Field selector */}
      <div
        className="relative flex items-stretch rounded-md border border-[rgb(214,218,226)] bg-white"
        style={{ height: 32, flex: 1 }}
      >
        <button
          ref={fieldTriggerRef}
          type="button"
          onClick={() =>
            setOpenDropdown((d) => (d === "field" ? null : "field"))
          }
          className="flex h-full w-full items-center px-3 text-[13px] font-medium text-[rgb(29,31,37)] hover:bg-[rgb(246,248,250)] focus:outline-none"
          style={{ borderRadius: "inherit" }}
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
              className="fixed z-[10005] w-64 overflow-hidden rounded-lg bg-white"
              style={{
                top:
                  fieldTriggerRef.current.getBoundingClientRect().bottom + 4,
                left: fieldTriggerRef.current.getBoundingClientRect().left,
                boxShadow:
                  "0 0 0 1px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)",
              }}
            >
              <div className="flex items-center border-b border-[rgb(214,218,226)] px-3 py-2">
                <MagnifyingGlassIcon color="rgb(150,155,165)" />
                <input
                  type="text"
                  value={fieldSearch}
                  onChange={(e) => setFieldSearch(e.target.value)}
                  placeholder="Find a field"
                  className="flex-auto border-none bg-transparent pl-1.5 text-[13px] text-[rgb(29,31,37)] placeholder-[rgb(150,155,165)] outline-none"
                  autoFocus
                />
              </div>
              <div
                className="overflow-y-auto py-1"
                style={{ maxHeight: 260 }}
              >
                {filteredFields.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFieldSelect(f)}
                    className="flex w-full items-center px-3 py-1.5 text-left text-[13px] text-[rgb(29,31,37)] hover:bg-[rgb(247,248,250)]"
                  >
                    <FieldTypeIcon type={f.type} />
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>,
            document.body,
          )}
      </div>

      {/* Direction selector */}
      <div
        className="relative flex items-stretch rounded-md border border-[rgb(214,218,226)] bg-white"
        style={{ height: 32, width: 110 }}
      >
        <button
          ref={dirTriggerRef}
          type="button"
          onClick={() =>
            setOpenDropdown((d) =>
              d === "direction" ? null : "direction",
            )
          }
          className="flex h-full w-full items-center px-3 text-[13px] font-medium text-[rgb(29,31,37)] hover:bg-[rgb(246,248,250)] focus:outline-none"
          style={{ borderRadius: "inherit" }}
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
              className="fixed z-[10005] w-36 rounded-lg border border-[rgb(214,218,226)] bg-white py-1 shadow-lg"
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
        className="flex flex-none items-center justify-center rounded text-[rgb(97,102,112)] hover:bg-[rgb(246,248,250)] hover:text-[rgb(29,31,37)] focus:outline-none"
        style={{ width: 28, height: 28 }}
        aria-label="Remove sort"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

// ── Main SortPanel ────────────────────────────────────────────────────

export function SortPanel({
  sorts,
  onSortsChange,
  allFields,
  onClose,
  anchorRef,
}: SortPanelProps) {
  const [search, setSearch] = useState("");
  const [addSortOpen, setAddSortOpen] = useState(false);
  const [autoSort, setAutoSort] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
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
      const inAddOverlay = el.closest?.("[data-sort-dropdown]");
      const inPanel = panelRef.current?.contains(target);
      const inAnchor = anchorRef.current?.contains(target);

      if (addSortOpen && !inAddOverlay) {
        setAddSortOpen(false);
      }
      if (
        !inPanel &&
        !inAnchor &&
        !inAddOverlay &&
        !el.closest?.("[data-popup]")
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [onClose, anchorRef, addSortOpen]);

  const usedFieldIds = new Set(sorts.map((s) => s.fieldId));
  const availableFields = allFields.filter((f) => !usedFieldIds.has(f.id));
  const filteredFields = availableFields.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleFieldPick = (field: GridField) => {
    onSortsChange([...sorts, makeDefaultSort(field)]);
    setSearch("");
    setAddSortOpen(false);
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

  const hasSorts = sorts.length > 0;

  // ── Field picker view (no sorts yet) ──────────────────────────────
  const fieldPickerView = (
    <>
      {/* Header */}
      <div className="px-4 pt-4 pb-0">
        <div className="flex items-center">
          <p
            className="text-[13px] font-semibold leading-6 text-[rgb(97,102,112)]"
            style={{ fontFamily: "inherit" }}
          >
            Sort by
          </p>
          <button
            type="button"
            aria-label="Learn more about sorting"
            className="ml-1 flex items-center rounded text-[rgb(97,102,112)] hover:text-[rgb(29,31,37)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(22,110,225)]"
          >
            <HelpIcon />
          </button>
        </div>
      </div>

      {/* Separator */}
      <div
        className="mx-4 mt-2"
        style={{ height: 1, backgroundColor: "rgb(229, 233, 240)" }}
      />

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="flex-none text-[rgb(22,110,225)]">
          <MagnifyingGlassIcon color="rgb(22,110,225)" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find a field"
          className="flex-auto border-none bg-transparent text-[15px] text-[rgb(29,31,37)] placeholder-[rgb(150,155,165)] outline-none"
          autoFocus
        />
      </div>

      {/* Field list */}
      <div
        className="overflow-y-auto px-1 pb-2"
        style={{ maxHeight: 360 }}
      >
        {filteredFields.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => handleFieldPick(f)}
            className="flex w-full items-center rounded-md px-3 py-2.5 text-left text-[15px] font-medium text-[rgb(29,31,37)] hover:bg-[rgb(247,248,250)]"
          >
            <span className="mr-3 flex-none">
              <FieldTypeIcon type={f.type} />
            </span>
            <span className="truncate">{f.name}</span>
          </button>
        ))}
        {filteredFields.length === 0 && (
          <div className="px-4 py-5 text-center text-[12px] text-[rgb(150,155,165)]">
            No fields available
          </div>
        )}
      </div>
    </>
  );

  // ── Configured sorts view ─────────────────────────────────────────
  const configuredView = (
    <>
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center">
          <p
            className="text-[13px] font-semibold leading-6 text-[rgb(97,102,112)]"
            style={{ fontFamily: "inherit" }}
          >
            Sort by
          </p>
          <button
            type="button"
            aria-label="Learn more about sorting"
            className="ml-1 flex items-center rounded text-[rgb(97,102,112)] hover:text-[rgb(29,31,37)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(22,110,225)]"
          >
            <HelpIcon />
          </button>
        </div>
      </div>

      {/* Separator */}
      <div
        className="mx-4"
        style={{ height: 1, backgroundColor: "rgb(229, 233, 240)" }}
      />

      {/* Sort rows */}
      <div className="overflow-auto px-4 pt-3" style={{ maxHeight: 425 }}>
        <div className="flex flex-col gap-2 pb-2">
          {sorts.map((sort, i) => (
            <SortRow
              key={sort.fieldId}
              sort={sort}
              allFields={allFields}
              usedFieldIds={usedFieldIds}
              onChange={(s) => handleChange(i, s)}
              onDelete={() => handleDelete(i)}
            />
          ))}
        </div>
      </div>

      {/* Add another sort */}
      <div className="relative px-4 py-2">
        <button
          ref={addButtonRef}
          type="button"
          onClick={() => setAddSortOpen((o) => !o)}
          disabled={usedFieldIds.size >= allFields.length}
          className="flex items-center gap-1.5 text-[13px] text-[rgb(97,102,112)] hover:text-[rgb(29,31,37)] focus:outline-none disabled:opacity-40"
        >
          <PlusIcon />
          <span>Add another sort</span>
        </button>

        {/* Field picker overlay for Add another sort */}
        {addSortOpen &&
          addButtonRef.current &&
          createPortal(
            <div
              data-popup
              data-sort-dropdown
              className="fixed z-[10005] w-64 overflow-hidden rounded-lg bg-white"
              style={{
                top:
                  addButtonRef.current.getBoundingClientRect().bottom + 4,
                left: addButtonRef.current.getBoundingClientRect().left,
                boxShadow:
                  "0 0 0 1px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)",
              }}
            >
              <div className="flex items-center border-b border-[rgb(214,218,226)] px-3 py-2">
                <MagnifyingGlassIcon color="rgb(150,155,165)" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find a field"
                  className="flex-auto border-none bg-transparent pl-1.5 text-[13px] text-[rgb(29,31,37)] placeholder-[rgb(150,155,165)] outline-none"
                  autoFocus
                />
              </div>
              <div
                className="overflow-y-auto py-1"
                style={{ minHeight: 100, maxHeight: 260 }}
              >
                {filteredFields.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFieldPick(f)}
                    className="flex w-full items-center px-3 py-1.5 text-left text-[13px] text-[rgb(29,31,37)] hover:bg-[rgb(247,248,250)]"
                  >
                    <FieldTypeIcon type={f.type} />
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
                {filteredFields.length === 0 && (
                  <div className="px-4 py-5 text-center text-[12px] text-[rgb(150,155,165)]">
                    No fields available
                  </div>
                )}
              </div>
            </div>,
            document.body,
          )}
      </div>

      {/* Automatically sort records toggle */}
      <div
        className="mt-1 border-t border-[rgb(229,233,240)] bg-[rgb(247,248,250)] px-4 py-3"
        style={{ borderRadius: "0 0 8px 8px" }}
      >
        <button
          type="button"
          onClick={() => setAutoSort((v) => !v)}
          className="flex w-full items-center gap-3 text-left focus:outline-none"
        >
          {/* Toggle switch */}
          <span
            className="relative flex-none rounded-full transition-colors"
            style={{
              width: 32,
              height: 18,
              backgroundColor: autoSort
                ? "rgb(22, 110, 225)"
                : "rgb(174, 178, 186)",
            }}
          >
            <span
              className="absolute top-[2px] rounded-full bg-white transition-transform"
              style={{
                width: 14,
                height: 14,
                left: autoSort ? 16 : 2,
                transition: "left 150ms ease",
              }}
            />
          </span>
          <span className="text-[13px] text-[rgb(29,31,37)]">
            Automatically sort records
          </span>
        </button>
      </div>
    </>
  );

  const panel = (
    <div
      ref={panelRef}
      data-popup
      data-testid="view-config-sort"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: PANEL_WIDTH,
        zIndex: 10004,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        className="flex flex-col overflow-hidden rounded-lg bg-white"
        style={{
          maxHeight: "calc(100vh - 120px)",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        {hasSorts ? configuredView : fieldPickerView}
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
