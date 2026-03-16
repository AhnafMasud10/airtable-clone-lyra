"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type KeyboardEvent, type UIEvent, useCallback, useMemo, useRef } from "react";
import type { GridField, TableRowModel } from "./types";
import { GridCell } from "./grid-cell";

const ROW_HEIGHT = 32;
const LEFT_PANE_WIDTH = 84;
const PRIMARY_COL_WIDTH = 181;
const COL_WIDTH = 180;
const ADD_FIELD_WIDTH = 44;

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M8 3a.5.5 0 0 1 .5.5v4h4a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0v-4h-4a.5.5 0 0 1 0-1h4v-4A.5.5 0 0 1 8 3Z" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M3.22 5.72a.75.75 0 0 1 1.06 0L8 9.44l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 6.78a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function IconDragHandle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <circle cx="5" cy="4" r="1.1" /><circle cx="5" cy="8" r="1.1" /><circle cx="5" cy="12" r="1.1" />
      <circle cx="11" cy="4" r="1.1" /><circle cx="11" cy="8" r="1.1" /><circle cx="11" cy="12" r="1.1" />
    </svg>
  );
}

function IconExpand() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M2.5 3.5a1 1 0 0 1 1-1H6a.5.5 0 0 1 0 1H3.5V6a.5.5 0 0 1-1 0V3.5Zm7 0A.5.5 0 0 1 10 3h2.5a1 1 0 0 1 1 1V6.5a.5.5 0 0 1-1 0V4H10a.5.5 0 0 1-.5-.5ZM3 9.5a.5.5 0 0 1 .5.5v2h2a.5.5 0 0 1 0 1H3.5a1 1 0 0 1-1-1V10a.5.5 0 0 1 .5-.5Zm9.5 0a.5.5 0 0 1 .5.5v2.5a1 1 0 0 1-1 1H10a.5.5 0 0 1 0-1h2V10a.5.5 0 0 1 .5-.5Z" />
    </svg>
  );
}

function IconCheckBold() {
  return (
    <svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
    </svg>
  );
}

function FieldTypeIcon({ type }: Readonly<{ type: string }>) {
  if (type === "NUMBER") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
        <path d="M5.5 1a.5.5 0 0 1 .492.592L5.73 3H8a.5.5 0 0 1 0 1H5.564l-.5 3H7.5a.5.5 0 0 1 0 1H4.897l-.39 2.408a.5.5 0 1 1-.986-.16L3.864 8H2a.5.5 0 0 1 0-1h2.03l.5-3H3a.5.5 0 0 1 0-1h1.697l.31-1.908A.5.5 0 0 1 5.5 1Zm5 0a.5.5 0 0 1 .492.592L10.73 3H13a.5.5 0 0 1 0 1h-2.436l-.5 3H12.5a.5.5 0 0 1 0 1H9.897l-.39 2.408a.5.5 0 1 1-.986-.16L8.864 8H7a.5.5 0 0 1 0-1h2.03l.5-3H8a.5.5 0 0 1 0-1h1.697l.31-1.908A.5.5 0 0 1 10.5 1Z" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M2.5 3A.5.5 0 0 1 3 2.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H8.5V13a.5.5 0 0 1-1 0V4.5H3a.5.5 0 0 1-.5-.5V3Z" />
    </svg>
  );
}

type GridTableProps = Readonly<{
  fields: GridField[];
  rowModels: TableRowModel[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  totalCount: number;
  editingCell: { rowId: string; fieldId: string; value: string } | null;
  onStartEdit: (rowId: string, fieldId: string, value: string) => void;
  onChangeEdit: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onFetchNextPage: () => void;
  onRetry: () => void;
  onAddField: () => void;
  onAddRow: () => void;
}>;

export function GridTable({
  fields,
  rowModels,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  isError,
  totalCount,
  editingCell,
  onStartEdit,
  onChangeEdit,
  onCommitEdit,
  onCancelEdit,
  onFetchNextPage,
  onRetry,
  onAddField,
  onAddRow,
}: GridTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const columnHelper = createColumnHelper<TableRowModel>();

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

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length + (hasNextPage ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 30,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  const lastVirtualItem = virtualItems.at(-1);
  if (
    lastVirtualItem &&
    hasNextPage &&
    !isFetchingNextPage &&
    lastVirtualItem.index >= table.getRowModel().rows.length - 40
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
    fields.reduce(
      (acc, _, i) => acc + (i === 0 ? PRIMARY_COL_WIDTH : COL_WIDTH),
      0,
    ) + ADD_FIELD_WIDTH;

  // Full row width (left pane + columns) — used in data rows
  const totalContentWidth = LEFT_PANE_WIDTH + totalColumnsWidth;

  return (
    <>
      {/* ── Outer wrapper: header + data stacked vertically ── */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

        {/* ── Header row — lives OUTSIDE the scroll container so it never moves ── */}
        <div
          className="flex shrink-0 border-b border-[#d9dee7] bg-[#f2f4f8]"
          style={{ height: ROW_HEIGHT }}
        >
          {/* Frozen left pane — always visible, not part of the scrolling header */}
          <div
            className="flex shrink-0 items-center justify-center border-r border-[#d9dee7] bg-[#f2f4f8]"
            style={{ width: LEFT_PANE_WIDTH, height: ROW_HEIGHT }}
          >
            <div className="flex h-[14px] w-[14px] items-center justify-center rounded-sm border border-[#b2bac5] bg-white text-white">
              <IconCheckBold />
            </div>
          </div>

          {/* Column headers — overflow hidden, scrollLeft driven by data scroll */}
          <div
            ref={headerScrollRef}
            className="flex-1 overflow-hidden"
            style={{ height: ROW_HEIGHT }}
          >
            <div className="flex" style={{ minWidth: totalColumnsWidth }}>
              {fields.map((field, i) => {
                const colWidth = i === 0 ? PRIMARY_COL_WIDTH : COL_WIDTH;
                return (
                  <div
                    key={field.id}
                    className="group relative flex shrink-0 items-center gap-[5px] border-r border-[#e6ebf2] px-3 text-xs font-semibold text-[#4f5d70]"
                    style={{ width: colWidth, height: ROW_HEIGHT }}
                  >
                    <span className="flex shrink-0 items-center text-[#637082]">
                      <FieldTypeIcon type={field.type} />
                    </span>
                    <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                      {field.name}
                    </span>
                    <button
                      type="button"
                      className="invisible flex shrink-0 items-center justify-center rounded text-[#97a0af] hover:bg-[#e0e5ed] group-hover:visible"
                      style={{ width: 20, height: 20 }}
                      aria-label={`Open ${field.name} column menu`}
                    >
                      <IconChevronDown />
                    </button>
                    <div className="absolute right-0 top-0 h-full w-[3px] cursor-col-resize opacity-0 hover:bg-[#2a79ef] hover:opacity-100 group-hover:opacity-30" />
                  </div>
                );
              })}

              {/* Add field "+" button */}
              <button
                type="button"
                onClick={onAddField}
                className="flex shrink-0 items-center justify-center border-r border-[#e6ebf2] text-[#97a0af] hover:bg-[#edf0f5] hover:text-[#4f5d70]"
                style={{ width: ADD_FIELD_WIDTH, height: ROW_HEIGHT }}
                title="Add field"
                aria-label="add a field"
              >
                <IconPlus />
              </button>
            </div>
          </div>
        </div>

        {/* ── Data scroll container (rows only, no header) ── */}
        <div
          ref={parentRef}
          className="min-h-0 flex-1 overflow-auto bg-white"
          style={{ overscrollBehavior: "none" }}
          onScroll={handleDataScroll}
        >
          {isLoading ? (
            <div className="p-4 text-sm text-[#607082]">Loading table rows...</div>
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
              width: "100%",
              minWidth: totalContentWidth,
            }}
          >
            {virtualItems.map((item) => {
              const row = table.getRowModel().rows[item.index];

              if (!row) {
                return (
                  <div
                    key={`loader-${item.key}`}
                    className="absolute flex border-b border-[#edf1f7]"
                    style={{
                      transform: `translateY(${item.start}px)`,
                      height: ROW_HEIGHT,
                      width: "100%",
                      minWidth: totalContentWidth,
                    }}
                  >
                    <div
                      className="sticky left-0 z-10 flex shrink-0 items-center border-r border-[#edf1f7] bg-white"
                      style={{ width: LEFT_PANE_WIDTH, height: ROW_HEIGHT }}
                    />
                    <div
                      className="flex items-center px-3 text-xs text-[#6d7887]"
                      style={{ height: ROW_HEIGHT }}
                    >
                      {hasNextPage ? "Loading more..." : "End of rows"}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={row.id}
                  className="group absolute flex border-b border-[#edf1f7] bg-white hover:bg-[#fafbfd]"
                  style={{
                    transform: `translateY(${item.start}px)`,
                    height: ROW_HEIGHT,
                    width: "100%",
                    minWidth: totalContentWidth,
                  }}
                >
                  {/* Frozen left pane — drag handle / row number / checkbox / expand */}
                  <div
                    className="sticky left-0 z-10 flex shrink-0 items-center border-r border-[#d9dee7] bg-white group-hover:bg-[#fafbfd]"
                    style={{ width: LEFT_PANE_WIDTH, height: ROW_HEIGHT }}
                  >
                    <div className="invisible flex w-4 shrink-0 items-center justify-center text-[#97a0af] group-hover:visible">
                      <IconDragHandle />
                    </div>
                    <span className="flex-1 text-center text-xs text-[#6d7887] group-hover:hidden">
                      {row.original.order + 1}
                    </span>
                    <div className="hidden flex-1 items-center justify-center group-hover:flex">
                      <div className="h-[14px] w-[14px] rounded-sm border border-[#b2bac5] bg-white" />
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
                    const colWidth =
                      cellIndex === 0 ? PRIMARY_COL_WIDTH : COL_WIDTH;

                    return (
                      <GridCell
                        key={cell.id}
                        rowId={row.original.id}
                        fieldId={fieldId}
                        value={rawValue}
                        isEditing={isEditing}
                        editValue={isEditing ? editingCell.value : ""}
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
            className="flex border-b border-[#edf1f7] bg-white"
            style={{ width: "100%", minWidth: totalContentWidth, height: ROW_HEIGHT }}
          >
            <button
              type="button"
              onClick={onAddRow}
              className="sticky left-0 z-10 flex shrink-0 items-center justify-center border-r border-[#d9dee7] bg-white text-[#97a0af] hover:text-[#4f5d70]"
              style={{ width: LEFT_PANE_WIDTH, height: ROW_HEIGHT }}
              title="You can also insert a new record anywhere by pressing Shift-Enter"
              aria-label="Insert new record in grid"
            >
              <IconPlus />
            </button>
            <div className="flex-1" style={{ height: ROW_HEIGHT }} />
          </div>
        </div>
      </div>

      {/* ── Summary bar ── */}
      <div className="flex shrink-0 items-center gap-2 border-t border-[#e2e5ea] bg-white px-3 text-xs text-[#607082]" style={{ height: 36 }}>
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
            className="flex items-center gap-1 rounded-r-full border border-[#d9dee7] bg-white pl-1 pr-2 text-[#4f5d70] hover:bg-[#f0f2f5]"
            style={{ height: 26 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-none">
              <path d="M13.5 8V11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 9.5H15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.25 2.5V5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 3.75H6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.5 11.5V13.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.5 12.5H11.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11.6515 2.35241L2.35746 11.6464C2.1622 11.8417 2.1622 12.1583 2.35746 12.3536L3.65014 13.6462C3.8454 13.8415 4.16198 13.8415 4.35725 13.6462L13.6513 4.3522C13.8465 4.15694 13.8465 3.84035 13.6513 3.64509L12.3586 2.35241C12.1633 2.15715 11.8468 2.15715 11.6515 2.35241Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 5L11 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Add…</span>
          </button>
        </div>

        {/* Record count */}
        <span>{totalCount.toLocaleString()} records</span>
      </div>
    </>
  );
}
