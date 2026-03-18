"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  type KeyboardEvent,
  type UIEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import type { GridField, TableRowModel } from "./types";
import { GridCell } from "./grid-cell";
import { CreateFieldPanel } from "./create-field-panel";

const ROW_HEIGHT = 32;
const LEFT_PANE_WIDTH = 84;
const PRIMARY_COL_WIDTH = 181;
const COL_WIDTH = 180;
const ADD_FIELD_WIDTH = 44;
const MIN_COL_WIDTH = 60;

function IconPlus() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M8 3a.5.5 0 0 1 .5.5v4h4a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0v-4h-4a.5.5 0 0 1 0-1h4v-4A.5.5 0 0 1 8 3Z" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M3.22 5.72a.75.75 0 0 1 1.06 0L8 9.44l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 6.78a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function IconDragHandle() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <circle cx="5" cy="4" r="1.1" />
      <circle cx="5" cy="8" r="1.1" />
      <circle cx="5" cy="12" r="1.1" />
      <circle cx="11" cy="4" r="1.1" />
      <circle cx="11" cy="8" r="1.1" />
      <circle cx="11" cy="12" r="1.1" />
    </svg>
  );
}

function IconExpand() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M2.5 3.5a1 1 0 0 1 1-1H6a.5.5 0 0 1 0 1H3.5V6a.5.5 0 0 1-1 0V3.5Zm7 0A.5.5 0 0 1 10 3h2.5a1 1 0 0 1 1 1V6.5a.5.5 0 0 1-1 0V4H10a.5.5 0 0 1-.5-.5ZM3 9.5a.5.5 0 0 1 .5.5v2h2a.5.5 0 0 1 0 1H3.5a1 1 0 0 1-1-1V10a.5.5 0 0 1 .5-.5Zm9.5 0a.5.5 0 0 1 .5.5v2.5a1 1 0 0 1-1 1H10a.5.5 0 0 1 0-1h2V10a.5.5 0 0 1 .5-.5Z" />
    </svg>
  );
}

function IconCheckBold() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
    </svg>
  );
}

function getFieldTypeLabel(type: string): string {
  switch (type) {
    case "NUMBER":
      return "Number";
    case "LONG_TEXT":
      return "Long text";
    case "USER":
    case "COLLABORATOR":
      return "User";
    case "SELECT":
    case "SINGLE_SELECT":
      return "Single select";
    case "ATTACHMENT":
    case "MULTIPLE_ATTACHMENT":
      return "Attachment";
    case "DATE":
      return "Date";
    case "AI_TEXT":
      return "Long text (agent)";
    default:
      return "Single line text";
  }
}

function FieldTypeIcon({ type, title }: Readonly<{ type: string; title?: string }>) {
  const props = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "currentColor",
    className: "flex-none primaryDisplayTypeIcon",
    style: { shapeRendering: "geometricPrecision" as const },
  };
  const icon = (() => {
  switch (type) {
    case "NUMBER":
      return (
        <svg {...props}>
          <path d="M5.5 1a.5.5 0 0 1 .492.592L5.73 3H8a.5.5 0 0 1 0 1H5.564l-.5 3H7.5a.5.5 0 0 1 0 1H4.897l-.39 2.408a.5.5 0 1 1-.986-.16L3.864 8H2a.5.5 0 0 1 0-1h2.03l.5-3H3a.5.5 0 0 1 0-1h1.697l.31-1.908A.5.5 0 0 1 5.5 1Zm5 0a.5.5 0 0 1 .492.592L10.73 3H13a.5.5 0 0 1 0 1h-2.436l-.5 3H12.5a.5.5 0 0 1 0 1H9.897l-.39 2.408a.5.5 0 1 1-.986-.16L8.864 8H7a.5.5 0 0 1 0-1h2.03l.5-3H8a.5.5 0 0 1 0-1h1.697l.31-1.908A.5.5 0 0 1 10.5 1Z" />
        </svg>
      );
    case "LONG_TEXT":
      return (
        <svg {...props}>
          <path d="M2 4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 4Zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 7Zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 10Zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 2 13Z" />
        </svg>
      );
    case "USER":
    case "COLLABORATOR":
      return (
        <svg {...props}>
          <path d="M8 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm0 1a4 4 0 0 0-4 4 1 1 0 0 0 1 1h6a1 1 0 0 0 1-1 4 4 0 0 0-4-4Z" />
        </svg>
      );
    case "SELECT":
    case "SINGLE_SELECT":
      return (
        <svg {...props}>
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM5.22 6.22a.75.75 0 0 1 1.06 0L8 7.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0L5.22 7.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      );
    case "ATTACHMENT":
    case "MULTIPLE_ATTACHMENT":
      return (
        <svg {...props}>
          <path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12.5 2h-9ZM7 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-5ZM5 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-3Zm4-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4Z" />
        </svg>
      );
    case "DATE":
      return (
        <svg {...props}>
          <path d="M4.5 1a.5.5 0 0 1 .5.5V3h6V1.5a.5.5 0 0 1 1 0V3h1.5A1.5 1.5 0 0 1 15 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5v-9A1.5 1.5 0 0 1 2.5 3H4V1.5a.5.5 0 0 1 .5-.5ZM2.5 4a.5.5 0 0 0-.5.5V6h12V4.5a.5.5 0 0 0-.5-.5h-11ZM14 7H2v6.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V7Z" />
        </svg>
      );
    case "AI_TEXT":
      return (
        <svg {...props}>
          <path d="M2 4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 4Zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 7Zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 10Zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 2 13Z" />
          <circle cx="13" cy="3" r="2" fill="#7c3aed" />
        </svg>
      );
    default: // TEXT / single line text
      return (
        <svg {...props}>
          <path d="M2.5 3A.5.5 0 0 1 3 2.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H8.5V13a.5.5 0 0 1-1 0V4.5H3a.5.5 0 0 1-.5-.5V3Z" />
        </svg>
      );
  }
  })();
  const label = title ?? getFieldTypeLabel(type);
  return (
    <div className="relative flex shrink-0" title={label} aria-hidden>
      {icon}
    </div>
  );
}

type GridTableProps = Readonly<{
  fields: GridField[];
  rowModels: TableRowModel[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isPlaceholderData: boolean;
  isError: boolean;
  totalCount: number;
  editingCell: { rowId: string; fieldId: string; value: string } | null;
  selectedRowIds: Set<string>;
  onToggleRow: (rowId: string) => void;
  onToggleAll: (allIds: string[]) => void;
  onStartEdit: (rowId: string, fieldId: string, value: string) => void;
  onChangeEdit: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onFetchNextPage: () => void;
  onRetry: () => void;
  onCreateField: (
    name: string,
    type: "TEXT" | "LONG_TEXT" | "NUMBER",
    options?: Record<string, unknown>,
  ) => void;
  onAddRow: () => void;
  onReorderFields: (fromIndex: number, toIndex: number) => void;
  onRowContextMenu?: (e: React.MouseEvent, rowId: string) => void;
  filteredFieldIds?: Set<string>;
  onBulkInsert?: () => void;
  isBulkInserting?: boolean;
  bulkProgress?: { inserted: number; total: number } | null;
}>;

export function GridTable({
  fields,
  rowModels,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  isPlaceholderData,
  isError,
  totalCount,
  editingCell,
  selectedRowIds,
  onToggleRow,
  onToggleAll,
  onStartEdit,
  onChangeEdit,
  onCommitEdit,
  onCancelEdit,
  onFetchNextPage,
  onRetry,
  onCreateField,
  onAddRow,
  onReorderFields,
  onRowContextMenu,
  filteredFieldIds,
  onBulkInsert,
  isBulkInserting,
  bulkProgress,
}: GridTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [showCreateFieldPanel, setShowCreateFieldPanel] = useState(false);
  const columnHelper = createColumnHelper<TableRowModel>();

  // Column widths: fieldId -> width in px (overrides defaults)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const resizeRef = useRef<{
    fieldId: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const getColumnWidth = useCallback(
    (fieldId: string, index: number) =>
      columnWidths[fieldId] ?? (index === 0 ? PRIMARY_COL_WIDTH : COL_WIDTH),
    [columnWidths],
  );

  const handleResizeStart = useCallback(
    (fieldId: string, startX: number, startWidth: number) => {
      resizeRef.current = { fieldId, startX, startWidth };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      const onMove = (e: globalThis.MouseEvent) => {
        const r = resizeRef.current;
        if (!r) return;
        const delta = e.clientX - r.startX;
        const newWidth = Math.max(MIN_COL_WIDTH, r.startWidth + delta);
        setColumnWidths((prev) => ({ ...prev, [r.fieldId]: newWidth }));
      };
      const onUp = () => {
        resizeRef.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [],
  );

  // ── Column drag-to-reorder state ───────────────────────────────────
  const [dragCol, setDragCol] = useState<{
    fieldIndex: number;
    mouseX: number;
    grabOffsetX: number; // mouseX minus column's left edge at drag start
    wrapperTop: number;
    wrapperHeight: number;
  } | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const dropTargetRef = useRef<number | null>(null);
  const dragFieldRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  dropTargetRef.current = dropTargetIndex;

  // Column left-edge offsets (relative to header scroll content)
  const columnLeftOffsets = useMemo(() => {
    const offsets: number[] = [];
    let acc = 0;
    fields.forEach((f, i) => {
      offsets.push(acc);
      acc += getColumnWidth(f.id, i);
    });
    offsets.push(acc); // right edge of last column
    return offsets;
  }, [fields, getColumnWidth]);

  const handleColumnDragMouseDown = useCallback(
    (e: React.MouseEvent, fieldIndex: number) => {
      // Don't start drag from the resize handle or buttons
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault();

      const headerEl = headerScrollRef.current;
      const wrapper = wrapperRef.current;
      if (!headerEl || !wrapper) return;

      const headerRect = headerEl.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const scrollLeft = headerEl.scrollLeft;
      const colLeft = (columnLeftOffsets[fieldIndex] ?? 0) - scrollLeft + headerRect.left;
      const grabOffsetX = e.clientX - colLeft;

      dragFieldRef.current = fieldIndex;
      setDragCol({
        fieldIndex,
        mouseX: e.clientX,
        grabOffsetX,
        wrapperTop: wrapperRect.top,
        wrapperHeight: wrapperRect.height,
      });

      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      const onMove = (ev: MouseEvent) => {
        setDragCol((prev) =>
          prev ? { ...prev, mouseX: ev.clientX } : null,
        );

        // Determine drop target from mouse position
        const hRect = headerEl.getBoundingClientRect();
        const sLeft = headerEl.scrollLeft;
        const relativeX = ev.clientX - hRect.left + sLeft;

        let targetIdx = 0;
        for (let i = 0; i < (columnLeftOffsets.length - 1); i++) {
          const mid =
            ((columnLeftOffsets[i] ?? 0) + (columnLeftOffsets[i + 1] ?? 0)) / 2;
          if (relativeX > mid) targetIdx = i + 1;
        }
        targetIdx = Math.max(0, Math.min(targetIdx, fields.length - 1));
        dropTargetRef.current = targetIdx;
        setDropTargetIndex(targetIdx);
      };

      const onUp = () => {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);

        const fromIdx = dragFieldRef.current;
        const toIdx = dropTargetRef.current;
        setDragCol(null);
        setDropTargetIndex(null);
        dragFieldRef.current = null;
        dropTargetRef.current = null;

        if (fromIdx !== null && toIdx !== null && fromIdx !== toIdx) {
          onReorderFields(fromIdx, toIdx);
        }
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [columnLeftOffsets, fields.length, onReorderFields],
  );

  const columns = useMemo(
    () =>
      fields.map((field) =>
        columnHelper.accessor((row) => row.cellsByField[field.id] ?? "", {
          id: field.id,
          header: field.name,
          cell: (info) => info.getValue(),
        }),
      ),
    [columnHelper, fields],
  );

  const table = useReactTable({
    data: rowModels,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Virtualize against totalCount so the scrollbar reflects all rows,
  // even ones not yet fetched. Unloaded rows render as skeletons.
  const loadedRowCount = table.getRowModel().rows.length;
  const virtualRowCount = Math.max(loadedRowCount, totalCount);

  const rowVirtualizer = useVirtualizer({
    count: virtualRowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 50,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Fetch next page when scrolling near the edge of loaded data
  const lastVirtualItem = virtualItems.at(-1);
  if (
    lastVirtualItem &&
    hasNextPage &&
    !isFetchingNextPage &&
    lastVirtualItem.index >= loadedRowCount - 40
  ) {
    onFetchNextPage();
  }

  const focusCell = useCallback((rowIndex: number, colIndex: number) => {
    const target = document.querySelector<HTMLElement>(
      `[data-cell='${rowIndex}-${colIndex}']`,
    );
    target?.focus();
  }, []);

  const handleCellKey = useCallback(
    (
      event: KeyboardEvent<HTMLButtonElement>,
      rowIndex: number,
      colIndex: number,
    ) => {
      if (
        event.key === "ArrowRight" ||
        (event.key === "Tab" && !event.shiftKey)
      ) {
        event.preventDefault();
        focusCell(rowIndex, colIndex + 1);
      } else if (
        event.key === "ArrowLeft" ||
        (event.key === "Tab" && event.shiftKey)
      ) {
        event.preventDefault();
        focusCell(rowIndex, Math.max(0, colIndex - 1));
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        focusCell(rowIndex + 1, colIndex);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        focusCell(Math.max(0, rowIndex - 1), colIndex);
      }
    },
    [focusCell],
  );

  // Ref for the column-headers scroll container (kept in sync with data scroll)
  const headerScrollRef = useRef<HTMLDivElement>(null);

  // Mirror horizontal scroll from data pane → header pane
  const handleDataScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  // Width of just the columns area (no left pane) — used in the header scroller
  const totalColumnsWidth =
    fields.reduce((acc, f, i) => acc + getColumnWidth(f.id, i), 0) +
    ADD_FIELD_WIDTH;

  // Full scroll content width (left pane + columns + add button)
  const totalContentWidth = LEFT_PANE_WIDTH + totalColumnsWidth;

  // Grid rows width — where horizontal lines stop (left pane + field columns only, no + button)
  const gridRowsWidth =
    LEFT_PANE_WIDTH + fields.reduce((acc, f, i) => acc + getColumnWidth(f.id, i), 0);


  return (
    <>
      {/* ── Outer wrapper: header + data stacked vertically ── */}
      <div ref={wrapperRef} className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* ── Header row — Airtable-style headerAndDataRowContainer ── */}
        <div
          className="relative z-10 flex shrink-0 bg-white"
          style={{ height: ROW_HEIGHT }}
        >
          {/* Frozen left pane — headerLeftPane with checkbox */}
          <div
            className="flex shrink-0 items-center justify-center border-r border-[#e6ebf2] bg-white"
            style={{ width: LEFT_PANE_WIDTH, height: ROW_HEIGHT }}
          >
            {(() => {
              const allIds = table.getRowModel().rows.map((r) => r.original.id);
              const allSelected =
                allIds.length > 0 &&
                allIds.every((id) => selectedRowIds.has(id));
              const someSelected =
                !allSelected && allIds.some((id) => selectedRowIds.has(id));
              return (
                <button
                  type="button"
                  onClick={() => onToggleAll(allIds)}
                  className="flex h-[14px] w-[14px] items-center justify-center rounded-sm border bg-white text-white focus:outline-none"
                  style={{
                    borderColor:
                      allSelected || someSelected ? "#2a79ef" : "#b2bac5",
                    backgroundColor: allSelected ? "#2a79ef" : "white",
                  }}
                  aria-label="Select all rows"
                >
                  {allSelected && <IconCheckBold />}
                  {someSelected && (
                    <div className="h-[2px] w-[8px] rounded-sm bg-[#2a79ef]" />
                  )}
                </button>
              );
            })()}
          </div>

          {/* Column headers — headerRightPane, scrollLeft driven by data scroll */}
          <div
            ref={headerScrollRef}
            className="flex-1 overflow-hidden bg-white"
            style={{ height: ROW_HEIGHT }}
          >
            <div className="flex" style={{ minWidth: totalColumnsWidth }}>
              {fields.map((field, i) => {
                const colWidth = getColumnWidth(field.id, i);
                const isDragging = dragCol?.fieldIndex === i;
                const dragFrom = dragCol?.fieldIndex ?? null;
                const isDropTarget = dropTargetIndex === i && dragFrom !== null && dragFrom !== i;
                const indicatorSide = dragFrom !== null && dragFrom < i ? "right" : "left";
                const isFieldFiltered = filteredFieldIds?.has(field.id);
                const fieldTypeLabel = getFieldTypeLabel(field.type);
                const isPrimary = i === 0;
                return (
                  <div
                    key={field.id}
                    data-columnid={field.id}
                    data-columnindex={i}
                    data-tutorial-selector-id="gridHeaderCell"
                    data-primary={isPrimary ? "true" : undefined}
                    onMouseDown={(e) => handleColumnDragMouseDown(e, i)}
                    className="group relative flex shrink-0 items-center border-r border-[#e6ebf2] text-[#4f5d70]"
                    style={{
                      width: colWidth,
                      height: ROW_HEIGHT,
                      opacity: isDragging ? 0.35 : 1,
                      cursor: dragCol ? "grabbing" : "grab",
                      backgroundColor: isFieldFiltered ? "#e6f4df" : undefined,
                    }}
                  >
                    {/* Drop indicator — blue line on insertion edge */}
                    {isDropTarget && (
                      <div
                        className="pointer-events-none absolute top-0 bottom-0 z-30"
                        style={{
                          [indicatorSide]: 0,
                          width: 2,
                          backgroundColor: "#2a79ef",
                        }}
                      />
                    )}
                    {/* contentWrapper — Airtable-style structure */}
                    <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
                      <div
                        className="flex min-w-0 flex-1 items-center gap-2"
                        aria-label={`${field.name} column header (${fieldTypeLabel} field)`}
                      >
                        <FieldTypeIcon type={field.type} />
                        <span
                          className="min-w-0 flex-1 overflow-hidden text-ellipsis text-[13px] font-semibold leading-4"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical" as const,
                            textOverflow: "ellipsis",
                          }}
                          title={field.name}
                        >
                          {field.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="flex shrink-0 items-center justify-center rounded p-0.5 text-[#97a0af] hover:bg-[#e0e5ed] hover:text-[#4f5d70]"
                        style={{ width: 20, height: 20 }}
                        aria-label={`Open ${field.name} column menu`}
                        data-tutorial-selector-id="openColumnMenuButton"
                      >
                        <IconChevronDown />
                      </button>
                    </div>
                    {/* Resize handle — right edge */}
                    <button
                      type="button"
                      aria-label={`Resize ${field.name} column`}
                      className="absolute top-0 right-0 z-20 h-full w-1.5 cursor-col-resize border-0 bg-transparent p-0 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ marginRight: -2 }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleResizeStart(field.id, e.clientX, colWidth);
                      }}
                    >
                      <span className="absolute right-0 top-0 h-full w-px bg-transparent group-hover:bg-[#2a79ef]" />
                    </button>
                  </div>
                );
              })}

              {/* Add field "+" button — ghost cell style like Airtable */}
              {!isLoading && (
                <button
                  ref={addButtonRef}
                  type="button"
                  onClick={() => setShowCreateFieldPanel(true)}
                  className="flex shrink-0 items-center justify-center border-r border-[#e6ebf2] text-[#97a0af] hover:bg-[#edf0f5] hover:text-[#4f5d70]"
                  style={{ width: ADD_FIELD_WIDTH, height: ROW_HEIGHT }}
                  title="Add field"
                  aria-label="add a field"
                  data-tutorial-selector-id="gridHeaderAddFieldButton"
                >
                  <IconPlus />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Fixed bottom border under header ── */}
        <div
          className="shrink-0"
          style={{ height: 1, backgroundColor: "#d2d9e3" }}
          aria-hidden
        />

        {/* ── Data scroll container (rows only, no header) ── */}
        <div
          ref={parentRef}
          className="relative min-h-0 flex-1 overflow-auto bg-white"
          style={{ overscrollBehavior: "none" }}
          onScroll={handleDataScroll}
        >
          {/* Drop indicator line spanning the data area */}
          {dragCol && dropTargetIndex !== null && dropTargetIndex !== dragCol.fieldIndex && (() => {
            const fromIdx = dragCol.fieldIndex;
            const indicateRight = fromIdx < dropTargetIndex;
            const edgeOffset = indicateRight
              ? (columnLeftOffsets[dropTargetIndex + 1] ?? 0)
              : (columnLeftOffsets[dropTargetIndex] ?? 0);
            return (
              <div
                className="pointer-events-none absolute z-30"
                style={{
                  left: LEFT_PANE_WIDTH + edgeOffset,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  backgroundColor: "#2a79ef",
                }}
              />
            );
          })()}
          {(isLoading || isPlaceholderData) ? (
            <div
              className="absolute inset-0 z-20 bg-white"
              aria-label="Loading table"
            >
              {/* Skeleton rows */}
              {Array.from({ length: 20 }).map((_, rowIdx) => (
                <div
                  key={rowIdx}
                  className="flex border-b border-[#e6ebf2]"
                  style={{ height: ROW_HEIGHT }}
                >
                  {/* Left pane skeleton */}
                  <div
                    className="flex shrink-0 items-center justify-center border-r border-[#e6ebf2]"
                    style={{ width: LEFT_PANE_WIDTH, height: ROW_HEIGHT }}
                  >
                    <div
                      className="animate-pulse rounded bg-[#e8ecf1]"
                      style={{ width: 16, height: 10 }}
                    />
                  </div>
                  {/* Cell skeletons */}
                  {(fields.length > 0 ? fields : Array.from({ length: 5 })).map((_, colIdx) => (
                    <div
                      key={colIdx}
                      className="flex shrink-0 items-center border-r border-[#e6ebf2] px-3"
                      style={{
                        width: fields.length > 0
                          ? getColumnWidth(fields[colIdx]?.id ?? '', colIdx)
                          : colIdx === 0 ? PRIMARY_COL_WIDTH : COL_WIDTH,
                        height: ROW_HEIGHT,
                      }}
                    >
                      <div
                        className="animate-pulse rounded bg-[#e8ecf1]"
                        style={{
                          width: `${45 + ((rowIdx * 7 + colIdx * 13) % 40)}%`,
                          height: 12,
                        }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
          {isError ? (
            <div className="flex items-center gap-2 p-4 text-sm text-[#8b1f1f]">
              <span>Failed to load row window.</span>
              <button
                type="button"
                onClick={onRetry}
                className="rounded border border-[#d2d9e3] px-2 py-1 text-xs text-[#5e6978]"
              >
                Retry
              </button>
            </div>
          ) : null}

          {/* ── Virtualised data rows ── */}
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
              width: totalContentWidth,
              minWidth: totalContentWidth,
              willChange: "transform",
            }}
          >
            {virtualItems.map((item) => {
              const row = table.getRowModel().rows[item.index];

              // Skeleton row for not-yet-loaded data
              if (!row) {
                return (
                  <div
                    key={`skeleton-${item.key}`}
                    className="absolute flex border-b border-[#d2d9e3]"
                    style={{
                      transform: `translateY(${item.start}px)`,
                      height: ROW_HEIGHT,
                      width: gridRowsWidth,
                    }}
                  >
                    <div
                      className="sticky left-0 z-10 flex shrink-0 items-center justify-center border-r border-b border-[#d2d9e3] bg-white"
                      style={{ width: LEFT_PANE_WIDTH, height: ROW_HEIGHT }}
                    >
                      <span className="text-xs text-[#c5cbd4]">
                        {item.index + 1}
                      </span>
                    </div>
                    {fields.map((field, colIdx) => (
                      <div
                        key={field.id}
                        className="flex shrink-0 items-center border-r border-[#e6ebf2] px-3"
                        style={{
                          width: getColumnWidth(field.id, colIdx),
                          height: ROW_HEIGHT,
                        }}
                      >
                        <div
                          className="animate-pulse rounded bg-[#e8ecf1]"
                          style={{
                            width: `${45 + ((item.index * 7 + colIdx * 13) % 40)}%`,
                            height: 12,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                );
              }

              const isSelected = selectedRowIds.has(row.original.id);
              return (
                <div
                  key={row.id}
                  data-row
                  className="group absolute flex border-b border-[#d2d9e3]"
                  onContextMenu={(e) => {
                    if (onRowContextMenu) {
                      e.preventDefault();
                      onRowContextMenu(e, row.original.id);
                    }
                  }}
                  style={{
                    transform: `translateY(${item.start}px)`,
                    height: ROW_HEIGHT,
                    width: gridRowsWidth,
                    backgroundColor: isSelected ? "#ebf3ff" : "white",
                  }}
                >
                  {/* Frozen left pane — drag handle / row number / checkbox / expand */}
                  <div
                    className="sticky left-0 z-10 flex shrink-0 items-center border-r border-b border-[#d2d9e3]"
                    style={{
                      width: LEFT_PANE_WIDTH,
                      height: ROW_HEIGHT,
                      backgroundColor: isSelected ? "#ebf3ff" : "white",
                    }}
                  >
                    <div className="invisible flex w-4 shrink-0 items-center justify-center text-[#97a0af] group-hover:visible">
                      <IconDragHandle />
                    </div>
                    {/* Row number: hide on hover or when selected */}
                    {!isSelected && (
                      <span className="flex-1 text-center text-xs text-[#6d7887] group-hover:hidden">
                        {item.index + 1}
                      </span>
                    )}
                    {/* Checkbox: visible on hover or when selected */}
                    <div
                      className={`flex-1 items-center justify-center ${isSelected ? "flex" : "hidden group-hover:flex"}`}
                    >
                      <button
                        type="button"
                        onClick={() => onToggleRow(row.original.id)}
                        className="flex h-[14px] w-[14px] items-center justify-center rounded-sm border text-white focus:outline-none"
                        style={{
                          borderColor: isSelected ? "#2a79ef" : "#b2bac5",
                          backgroundColor: isSelected ? "#2a79ef" : "white",
                        }}
                        aria-label={isSelected ? "Deselect row" : "Select row"}
                      >
                        {isSelected && <IconCheckBold />}
                      </button>
                    </div>
                    <div className="invisible flex w-5 shrink-0 items-center justify-center text-[#97a0af] group-hover:visible">
                      <IconExpand />
                    </div>
                  </div>

                  {/* Data cells */}
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const fieldId = cell.column.id;
                    const cellValue = cell.getValue();
                    const rawValue =
                      typeof cellValue === "string" ||
                      typeof cellValue === "number"
                        ? String(cellValue)
                        : "";
                    const isEditing =
                      editingCell?.rowId === row.original.id &&
                      editingCell.fieldId === fieldId;
                    const colWidth = getColumnWidth(fieldId, cellIndex);

                    return (
                      <GridCell
                        key={cell.id}
                        rowId={row.original.id}
                        fieldId={fieldId}
                        value={rawValue}
                        isEditing={isEditing}
                        editValue={isEditing ? editingCell.value : ""}
                        isFiltered={filteredFieldIds?.has(fieldId)}
                        virtualRowIndex={item.index}
                        cellIndex={cellIndex}
                        colWidth={colWidth}
                        onStartEdit={onStartEdit}
                        onChangeEdit={onChangeEdit}
                        onCommitEdit={onCommitEdit}
                        onCancelEdit={onCancelEdit}
                        onCellKeyDown={handleCellKey}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* ── Ghost row — insert new record ── */}
          <div
            className="flex border-b border-[#d2d9e3] bg-white"
            style={{
              width: gridRowsWidth,
              height: ROW_HEIGHT,
            }}
          >
            <button
              type="button"
              onClick={onAddRow}
              className="sticky left-0 z-10 flex shrink-0 items-center justify-center border-r border-b border-[#d2d9e3] bg-white text-[#97a0af] hover:text-[#4f5d70]"
              style={{ width: LEFT_PANE_WIDTH, height: ROW_HEIGHT }}
              title="You can also insert a new record anywhere by pressing Shift-Enter"
              aria-label="Insert new record in grid"
            >
              <IconPlus />
            </button>
            <div
              className="flex-1 border-r border-[#d2d9e3]"
              style={{ height: ROW_HEIGHT }}
            />
          </div>
        </div>

        {/* ── Floating shadow column while dragging ── */}
        {dragCol && (() => {
          const dragField = fields[dragCol.fieldIndex];
          if (!dragField) return null;
          const colWidth = getColumnWidth(dragField.id, dragCol.fieldIndex);
          return (
            <div
              className="pointer-events-none fixed z-50"
              style={{
                left: dragCol.mouseX - dragCol.grabOffsetX,
                top: dragCol.wrapperTop,
                width: colWidth,
                height: dragCol.wrapperHeight,
              }}
            >
              {/* Shadow header */}
              <div
                className="flex items-center gap-[5px] border-r border-b border-[#c0cad8] px-3 text-xs font-semibold text-[#4f5d70]"
                style={{
                  height: ROW_HEIGHT,
                  backgroundColor: "rgba(220, 228, 240, 0.92)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                <span className="flex shrink-0 items-center text-[#637082]">
                  <FieldTypeIcon type={dragField.type} />
                </span>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {dragField.name}
                </span>
              </div>
              {/* Shadow body — translucent column fill */}
              <div
                style={{
                  height: `calc(100% - ${ROW_HEIGHT}px)`,
                  backgroundColor: "rgba(42, 121, 239, 0.06)",
                  borderRight: "1px solid rgba(42, 121, 239, 0.18)",
                  borderLeft: "1px solid rgba(42, 121, 239, 0.18)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
                }}
              />
            </div>
          );
        })()}
      </div>

      {/* ── Summary bar ── */}
      <div
        className="flex shrink-0 items-center gap-2 border-t border-[#e2e5ea] bg-white px-3 text-xs text-[#607082]"
        style={{ height: 36 }}
      >
        {/* Add record pill button */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onAddRow}
            aria-label="Add record"
            className="flex items-center justify-center rounded-l-full border border-[#d9dee7] bg-white px-2 text-[#4f5d70] hover:bg-[#f0f2f5]"
            style={{ height: 26, borderRight: "none" }}
          >
            <IconPlus />
          </button>
          <button
            type="button"
            onClick={onAddRow}
            className="flex items-center gap-1 rounded-r-full border border-[#d9dee7] bg-white pr-2 pl-1 text-[#4f5d70] hover:bg-[#f0f2f5]"
            style={{ height: 26 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-none"
            >
              <path
                d="M13.5 8V11"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 9.5H15"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.25 2.5V5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 3.75H6.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.5 11.5V13.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 12.5H11.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.6515 2.35241L2.35746 11.6464C2.1622 11.8417 2.1622 12.1583 2.35746 12.3536L3.65014 13.6462C3.8454 13.8415 4.16198 13.8415 4.35725 13.6462L13.6513 4.3522C13.8465 4.15694 13.8465 3.84035 13.6513 3.64509L12.3586 2.35241C12.1633 2.15715 11.8468 2.15715 11.6515 2.35241Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 5L11 7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Add…</span>
          </button>
        </div>

        {/* Record count */}
        <span>{totalCount.toLocaleString()} records</span>

        {/* Bulk insert 100K rows */}
        {onBulkInsert && (
          <button
            type="button"
            onClick={onBulkInsert}
            disabled={isBulkInserting}
            className="ml-auto rounded border border-[#d9dee7] bg-white px-2 py-0.5 text-[#4f5d70] hover:bg-[#f0f2f5] disabled:opacity-50"
            style={{ height: 26 }}
          >
            {bulkProgress
              ? `Inserting… ${bulkProgress.inserted.toLocaleString()} / ${bulkProgress.total.toLocaleString()}`
              : "Add 100K rows"}
          </button>
        )}
      </div>

      {showCreateFieldPanel && addButtonRef.current && (
        <CreateFieldPanel
          anchorRef={addButtonRef}
          onSelect={(name, type, options) => {
            onCreateField(name, type, options);
            setShowCreateFieldPanel(false);
          }}
          onClose={() => setShowCreateFieldPanel(false)}
        />
      )}
    </>
  );
}
