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

function isNoValueOp(op: string) {
  return op === "is_empty" || op === "is_not_empty";
}

function makeDefaultFilter(field: GridField): GridFilter {
  const type = getFilterType(field);
  if (type === "number") {
    return { fieldId: field.id, type: "number", op: "eq", conjunction: "and" };
  }
  return { fieldId: field.id, type: "text", op: "contains", conjunction: "and" };
}

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
      const noValOp = op as "is_empty" | "is_not_empty";
      if (filter.type === "text") onChange({ fieldId: filter.fieldId, type: "text", op: noValOp, conjunction });
      else if (filter.type === "number") onChange({ fieldId: filter.fieldId, type: "number", op: noValOp, conjunction });
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
    <div ref={rowRef} className="relative flex items-center gap-2 px-4 py-1.5">
      {/* Where / And/Or toggle */}
      {isFirst ? (
        <span className="shrink-0 text-[13px] text-[rgb(97,102,112)]" style={{ width: 44 }}>
          Where
        </span>
      ) : (
        <button
          type="button"
          onClick={toggleConjunction}
          className="flex shrink-0 items-center gap-0.5 rounded border border-[rgb(220,225,234)] px-1.5 py-0.5 text-[12px] font-medium text-[rgb(97,102,112)] hover:bg-[rgb(246,248,250)]"
          style={{ width: 52 }}
        >
          <span>{conjunction === "or" ? "Or" : "And"}</span>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
            <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>
      )}

      {/* Field selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => { setOpenDropdown((d) => d === "field" ? null : "field"); setFieldSearch(""); }}
          className="flex items-center gap-1 rounded border border-[rgb(220,225,234)] bg-white px-2 py-1 text-[13px] text-[rgb(29,31,37)] hover:bg-[rgb(246,248,250)]"
          style={{ minWidth: 110 }}
        >
          <span className="flex-1 truncate text-left">{selectedField?.name ?? "Select field"}</span>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" className="shrink-0 text-[rgb(97,102,112)]">
            <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>
        {openDropdown === "field" && (
          <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-[rgb(220,225,234)] bg-white shadow-lg">
            <div className="border-b border-[rgb(220,225,234)] px-3 py-2">
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
                  <FieldTypeIcon type={f.type} />
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Operator selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => { setOpenDropdown((d) => d === "operator" ? null : "operator"); setOpSearch(""); }}
          className="flex items-center gap-1 rounded border border-[rgb(220,225,234)] bg-white px-2 py-1 text-[13px] text-[rgb(29,31,37)] hover:bg-[rgb(246,248,250)]"
          style={{ minWidth: 130 }}
        >
          <span className="flex-1 truncate text-left">{opLabel}</span>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" className="shrink-0 text-[rgb(97,102,112)]">
            <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>
        {openDropdown === "operator" && (
          <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-lg border border-[rgb(220,225,234)] bg-white shadow-lg">
            <div className="border-b border-[rgb(220,225,234)] px-3 py-2">
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
                  className="flex w-full items-center px-3 py-2.5 text-left text-[13px] text-[rgb(29,31,37)] hover:bg-[rgb(246,248,250)]"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Value input */}
      {isNoValueOp(filter.op) ? (
        <div className="flex-1" />
      ) : (
        <input
          type={filter.type === "number" ? "number" : "text"}
          value={filter.value ?? ""}
          onChange={(e) => handleValueChange(e.target.value)}
          className="h-7 min-w-0 flex-1 rounded border border-[rgb(220,225,234)] px-2 text-[13px] text-[rgb(29,31,37)] outline-none focus:border-[rgb(22,110,225)]"
          placeholder="Enter a value"
        />
      )}

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[rgb(150,155,165)] hover:bg-[rgb(229,233,240)] hover:text-[rgb(97,102,112)]"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6.5 1h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1ZM3 3.5h10a.5.5 0 0 1 0 1H12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8H3a.5.5 0 0 1 0-1Zm2.5 1v8h5v-8h-5Z" />
        </svg>
      </button>

      {/* Drag handle */}
      <div className="flex h-7 w-5 shrink-0 cursor-grab items-center justify-center text-[rgb(196,201,209)]">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.2" /><circle cx="5" cy="8" r="1.2" /><circle cx="5" cy="12" r="1.2" />
          <circle cx="11" cy="4" r="1.2" /><circle cx="11" cy="8" r="1.2" /><circle cx="11" cy="12" r="1.2" />
        </svg>
      </div>
    </div>
  );
}

const PANEL_WIDTH = 520;
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

  // Recalculate position on mount and on window resize
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
      className="rounded-lg border border-[rgb(220,225,234)] bg-white shadow-lg"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: PANEL_WIDTH,
        zIndex: 9999,
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* Header */}
      <div className="px-4 pt-3 pb-2 text-[12px] text-[rgb(97,102,112)]">
        In this view, show records
      </div>

      {filters.length === 0 && (
        <div className="px-4 pb-3 text-[13px] text-[rgb(150,155,165)]">
          No filters applied to this view
        </div>
      )}

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

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[rgb(220,225,234)] px-4 py-2">
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 text-[13px] text-[rgb(97,102,112)] hover:text-[rgb(29,31,37)]"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
          </svg>
          Add condition
        </button>
        <button
          type="button"
          className="text-[12px] text-[rgb(22,110,225)] hover:underline"
        >
          Copy from another view
        </button>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
