"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GridField, GridFilter } from "./types";

type FilterPanelProps = Readonly<{
  filters: GridFilter[];
  onFiltersChange: (filters: GridFilter[]) => void;
  allFields: GridField[];
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}>;

const TEXT_OPS = [
  { op: "contains", label: "contains" },
  { op: "not_contains", label: "does not contain" },
  { op: "equals", label: "is" },
  { op: "is_empty", label: "is empty" },
  { op: "is_not_empty", label: "is not empty" },
] as const;

const NUMBER_OPS = [
  { op: "eq", label: "=" },
  { op: "gt", label: ">" },
  { op: "lt", label: "<" },
  { op: "gte", label: ">=" },
  { op: "lte", label: "<=" },
  { op: "is_empty", label: "is empty" },
  { op: "is_not_empty", label: "is not empty" },
] as const;

function getFilterType(field: GridField): "text" | "number" {
  return field.type === "NUMBER" ? "number" : "text";
}

function getOps(type: "text" | "number") {
  return type === "number" ? NUMBER_OPS : TEXT_OPS;
}

function isNoValueOp(op: string): op is "is_empty" | "is_not_empty" {
  return op === "is_empty" || op === "is_not_empty";
}

function makeDefaultFilter(field: GridField): GridFilter {
  const type = getFilterType(field);
  if (type === "number") {
    return { fieldId: field.id, type: "number", op: "eq", conjunction: "and" };
  }
  return { fieldId: field.id, type: "text", op: "contains", conjunction: "and" };
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" aria-hidden="true" style={{ shapeRendering: "geometricPrecision" }}>
      <path fill="currentColor" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none icon" aria-hidden="true" style={{ shapeRendering: "geometricPrecision" }}>
      <path fill="currentColor" d="M6.5 1h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1ZM3 3.5h10a.5.5 0 0 1 0 1H12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8H3a.5.5 0 0 1 0-1Zm2.5 1v8h5v-8h-5Z" />
    </svg>
  );
}

function DragIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none icon" aria-hidden="true" style={{ shapeRendering: "geometricPrecision" }}>
      <circle cx="5.5" cy="4" r="1.2" fill="currentColor" />
      <circle cx="5.5" cy="8" r="1.2" fill="currentColor" />
      <circle cx="5.5" cy="12" r="1.2" fill="currentColor" />
      <circle cx="10.5" cy="4" r="1.2" fill="currentColor" />
      <circle cx="10.5" cy="8" r="1.2" fill="currentColor" />
      <circle cx="10.5" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none icon" aria-hidden="true" style={{ shapeRendering: "geometricPrecision" }}>
      <path fill="currentColor" d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
    </svg>
  );
}

function AiSpinnerIcon() {
  return (
    <svg height="20" viewBox="0 0 160 160" width="20" xmlns="http://www.w3.org/2000/svg" style={{ color: "var(--colors-hyperlink-primary, rgb(22,110,225))" }}>
      {/* Simplified dotted ring icon to represent the AI spinner */}
      {[0, 32.7, 65.5, 98.2, 130.9, 163.6, 196.4, 229.1, 261.8, 294.5, 327.3].map((angle, i) => (
        <g key={i} transform={`rotate(${angle}, 80, 80)`}>
          <rect x="72" y="4" width="16" height="16" rx="4" fill="currentColor" opacity={0.15 + (i * 0.07)} />
        </g>
      ))}
      <rect x="48" y="72" width="16" height="16" rx="4" fill="currentColor" />
      <rect x="96" y="72" width="16" height="16" rx="4" fill="currentColor" />
    </svg>
  );
}

type FilterRowProps = Readonly<{
  filter: GridFilter;
  allFields: GridField[];
  isFirst: boolean;
  onChange: (filter: GridFilter) => void;
  onDelete: () => void;
}>;

function FilterRow({ filter, allFields, isFirst, onChange, onDelete }: FilterRowProps) {
  const [openDropdown, setOpenDropdown] = useState<"field" | "operator" | null>(null);
  const [fieldSearch, setFieldSearch] = useState("");
  const [opSearch, setOpSearch] = useState("");
  const rowRef = useRef<HTMLDivElement>(null);

  const selectedField = allFields.find((f) => f.id === filter.fieldId);
  const ops = getOps(filter.type);
  const opLabel = ops.find((o) => o.op === filter.op)?.label ?? filter.op;
  const conjunction = filter.conjunction ?? "and";

  useEffect(() => {
    if (!openDropdown) return;
    function handleDown(e: MouseEvent) {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [openDropdown]);

  const handleFieldSelect = (field: GridField) => {
    const newFilter = makeDefaultFilter(field);
    onChange({ ...newFilter, conjunction });
    setOpenDropdown(null);
    setFieldSearch("");
  };

  const handleOpSelect = (op: string) => {
    if (isNoValueOp(op)) {
      if (filter.type === "text") onChange({ fieldId: filter.fieldId, type: "text", op, conjunction });
      else if (filter.type === "number") onChange({ fieldId: filter.fieldId, type: "number", op, conjunction });
    } else if (filter.type === "text") {
      onChange({ ...filter, op: op as "contains" | "not_contains" | "equals" });
    } else if (filter.type === "number") {
      onChange({ ...filter, op: op as "eq" | "gt" | "lt" | "gte" | "lte" });
    }
    setOpenDropdown(null);
    setOpSearch("");
  };

  const handleValueChange = (val: string) => {
    if (filter.type === "number") {
      onChange({ ...filter, value: val === "" ? undefined : Number(val) });
    } else {
      onChange({ ...filter, value: val });
    }
  };

  const toggleConjunction = () => {
    onChange({ ...filter, conjunction: conjunction === "and" ? "or" : "and" });
  };

  const filteredFields = allFields.filter((f) =>
    f.name.toLowerCase().includes(fieldSearch.toLowerCase()),
  );
  const filteredOps = ops.filter((o) =>
    o.label.toLowerCase().includes(opSearch.toLowerCase()),
  );

  return (
    <div ref={rowRef} className="flex w-full" style={{ height: "2.5rem" }}>
      {/* Prefix: "Where" label or "and/or" conjunction picker */}
      <div className="flex items-center px-1 shrink-0" style={{ width: "4.5rem", paddingBottom: "0.5rem" }}>
        {isFirst ? (
          <div className="flex items-center flex-auto px-1 w-full h-full text-[13px] text-[rgb(29,31,37)]">
            Where
          </div>
        ) : (
          <div className="w-full h-full">
            <button
              type="button"
              onClick={toggleConjunction}
              className="rounded px-1 flex items-center flex-auto w-full h-full text-[13px] text-[rgb(29,31,37)] bg-white border border-[rgb(214,218,226)] hover:bg-[rgb(246,248,250)] focus:outline-none"
            >
              <div className="flex-auto flex items-center justify-between">
                <div>{conjunction}</div>
                <ChevronDown />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Main filter control row */}
      <div className="flex-auto flex items-center" style={{ paddingRight: "0.5rem", height: "2rem", marginTop: "auto", marginBottom: "auto" }}>
        <div className="flex items-stretch w-full">
          {/* Combined bordered box */}
          <div className="flex items-stretch border border-[rgb(214,218,226)] rounded bg-white" style={{ height: 30, flex: 1 }}>
            {/* Field selector — ~125px with right border */}
            <div className="relative flex items-stretch border-r border-[rgb(214,218,226)]" style={{ width: 125 }}>
              <button
                type="button"
                onClick={() => { setOpenDropdown((d) => d === "field" ? null : "field"); setFieldSearch(""); }}
                className="flex items-center px-2 w-full h-full text-[13px] text-[rgb(29,31,37)] hover:bg-[rgb(246,248,250)] focus:outline-none"
              >
                <div className="truncate flex-auto text-left">{selectedField?.name ?? "Select field"}</div>
                <div className="flex-none flex items-center ml-1">
                  <ChevronDown />
                </div>
              </button>
              {openDropdown === "field" && (
                <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-lg border border-[rgb(214,218,226)] bg-white shadow-lg">
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
                  <div className="max-h-52 overflow-y-auto py-1">
                    {filteredFields.map((f) => (
                      <button key={f.id} type="button" onClick={() => handleFieldSelect(f)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[rgb(29,31,37)] hover:bg-[rgb(246,248,250)]"
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Operator selector — ~125px with right border */}
            <div className="relative flex items-stretch border-r border-[rgb(214,218,226)]" style={{ width: 125 }}>
              <button
                type="button"
                onClick={() => { setOpenDropdown((d) => d === "operator" ? null : "operator"); setOpSearch(""); }}
                className="flex items-center px-2 w-full h-full text-[13px] text-[rgb(29,31,37)] hover:bg-[rgb(246,248,250)] focus:outline-none"
              >
                <div className="truncate flex-auto text-left">{opLabel}</div>
                <div className="flex-none flex items-center ml-1">
                  <ChevronDown />
                </div>
              </button>
              {openDropdown === "operator" && (
                <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-lg border border-[rgb(214,218,226)] bg-white shadow-lg">
                  <div className="border-b border-[rgb(214,218,226)] px-3 py-2">
                    <input
                      type="text"
                      value={opSearch}
                      onChange={(e) => setOpSearch(e.target.value)}
                      placeholder="Find an operator"
                      className="w-full bg-transparent text-[13px] text-[rgb(29,31,37)] placeholder-[rgb(150,155,165)] outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto py-1">
                    {filteredOps.map((o) => (
                      <button key={o.op} type="button" onClick={() => handleOpSelect(o.op)}
                        className="flex w-full items-center px-3 py-2 text-left text-[13px] text-[rgb(29,31,37)] hover:bg-[rgb(246,248,250)]"
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Value input — flex-auto with right border */}
            <div className="flex-auto flex items-stretch border-r border-[rgb(214,218,226)] overflow-hidden">
              {isNoValueOp(filter.op) ? (
                <div className="flex-auto" />
              ) : (
                <input
                  type={filter.type === "number" ? "number" : "text"}
                  value={filter.value ?? ""}
                  onChange={(e) => handleValueChange(e.target.value)}
                  placeholder="Enter a value"
                  className="w-full px-2 text-[13px] text-[rgb(29,31,37)] placeholder-[rgb(150,155,165)] bg-transparent outline-none"
                  style={{ border: 0 }}
                />
              )}
            </div>

            {/* Trash button — 2rem */}
            <button
              type="button"
              onClick={onDelete}
              className="flex-none flex items-center justify-center border-r border-[rgb(214,218,226)] hover:bg-[rgb(246,248,250)] text-[rgb(97,102,112)] focus:outline-none"
              style={{ width: "2rem", height: "auto" }}
              aria-label="Remove filter"
            >
              <TrashIcon />
            </button>

            {/* Drag handle — 2rem */}
            <div
              className="flex-none flex items-center justify-center cursor-grab text-[rgb(196,201,209)]"
              style={{ width: "2rem", height: "auto" }}
            >
              <DragIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PANEL_WIDTH = 600;
const FONT_FAMILY =
  "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif";

function calcPos(anchor: HTMLButtonElement) {
  const rect = anchor.getBoundingClientRect();
  const padding = 8;
  const left = Math.max(padding, Math.min(rect.left, window.innerWidth - PANEL_WIDTH - padding));
  return { top: rect.bottom + 4, left };
}

export function FilterPanel({
  filters,
  onFiltersChange,
  allFields,
  onClose,
  anchorRef,
}: FilterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const nextKey = useRef(0);
  const [filterKeys, setFilterKeys] = useState<number[]>(() =>
    filters.map(() => nextKey.current++),
  );

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
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [onClose, anchorRef]);

  const handleAdd = () => {
    const first = allFields[0];
    if (!first) return;
    onFiltersChange([...filters, makeDefaultFilter(first)]);
    setFilterKeys((prev) => [...prev, nextKey.current++]);
  };

  const handleChange = (i: number, f: GridFilter) => {
    const next = [...filters];
    next[i] = f;
    onFiltersChange(next);
  };

  const handleDelete = (i: number) => {
    onFiltersChange(filters.filter((_, idx) => idx !== i));
    setFilterKeys((prev) => prev.filter((_, idx) => idx !== i));
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
      {/* Outer popover shell */}
      <div className="rounded shadow-[0_4px_16px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col bg-white border border-[rgb(214,218,226)]" style={{ maxHeight: "calc(100vh - 120px)" }}>

        {/* Header: "Filter" title */}
        <div className="flex items-center justify-between px-4 pt-4">
          <h3 className="text-[11px] font-semibold text-[rgb(97,102,112)] uppercase tracking-wide leading-none">
            Filter
          </h3>
        </div>

        {/* AI prompt bar */}
        <div className="px-4 py-2">
          <div className="relative">
            <div
              className="flex items-center border border-[rgb(214,218,226)] bg-white p-1.5"
              style={{ borderRadius: 6 }}
            >
              <div className="flex-none flex items-center ml-1">
                <AiSpinnerIcon />
              </div>
              <div className="flex-auto px-2">
                <input
                  type="text"
                  placeholder="Describe what you want to see"
                  aria-label="Ask AI to generate filters"
                  className="w-full border-none outline-none text-[13px] text-[rgb(29,31,37)] placeholder-[rgb(150,155,165)] bg-white"
                  style={{ outline: "none", border: "none", boxShadow: "none" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <div className="px-4 pt-1 pb-2 text-[13px] text-[rgb(97,102,112)]">
          In this view, show records
        </div>

        {/* Filter rows — scrollable */}
        <div className="px-4 overflow-auto" style={{ maxHeight: 425 }}>
          {filters.length === 0 && (
            <div className="py-2 text-[13px] text-[rgb(150,155,165)]">
              No filters applied to this view
            </div>
          )}
          <div className="flex flex-col gap-1 pb-2">
            {filters.map((filter, i) => (
              <FilterRow
                key={filterKeys[i] ?? i}
                filter={filter}
                allFields={allFields}
                isFirst={i === 0}
                onChange={(f) => handleChange(i, f)}
                onDelete={() => handleDelete(i)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[rgb(214,218,226)]">
          <div className="flex items-center flex-wrap gap-x-3">
            {/* Add condition */}
            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-1 text-[13px] text-[rgb(97,102,112)] hover:text-[rgb(29,31,37)] focus:outline-none"
            >
              <PlusIcon />
              <span>Add condition</span>
            </button>

            {/* Add condition group */}
            <button
              type="button"
              className="flex items-center gap-1 text-[13px] text-[rgb(97,102,112)] hover:text-[rgb(29,31,37)] focus:outline-none"
            >
              <PlusIcon />
              <span>Add condition group</span>
            </button>

            {/* Help icon */}
            <button
              type="button"
              className="flex items-center justify-center w-4 h-4 rounded-full border border-[rgb(150,155,165)] text-[rgb(97,102,112)] hover:text-[rgb(29,31,37)] focus:outline-none text-[10px] font-semibold"
              aria-label="Help"
            >
              ?
            </button>
          </div>

          {/* Copy from another view */}
          <button
            type="button"
            className="text-[13px] text-[rgb(97,102,112)] hover:text-[rgb(29,31,37)] focus:outline-none"
          >
            Copy from another view
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
