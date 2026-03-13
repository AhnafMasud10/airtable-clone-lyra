"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type KeyboardEvent, useCallback, useMemo, useRef } from "react";
import type { GridField, TableRowModel } from "./types";
import { GridCell } from "./grid-cell";

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
    () => [
      columnHelper.accessor("order", {
        id: "__row",
        header: "#",
        cell: (info) => info.getValue() + 1,
      }),
      ...fields.map((field) =>
        columnHelper.accessor((row) => row.cellsByField[field.id] ?? "", {
          id: field.id,
          header: field.name,
          cell: (info) => info.getValue(),
        }),
      ),
    ],
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
    estimateSize: () => 38,
    overscan: 16,
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

  return (
    <>
      <div
        ref={parentRef}
        className="min-h-0 flex-1 overflow-auto bg-white"
      >
        {isLoading ? (
          <div className="p-4 text-sm text-[#607082]">
            Loading table rows...
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

        <div className="sticky top-0 z-10 border-b border-[#d9dee7] bg-[#f2f4f8]">
          {table.getHeaderGroups().map((headerGroup) => (
            <div
              key={headerGroup.id}
              className="flex"
            >
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  className="shrink-0 truncate border-r border-[#e6ebf2] px-3 py-1.5 text-xs font-medium text-[#4f5d70]"
                  style={{ width: header.id === "__row" ? 66 : 180, height: 32, display: "flex", alignItems: "center" }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </div>
              ))}
              {/* Add field "+" button */}
              <button
                type="button"
                onClick={onAddField}
                className="flex shrink-0 items-center justify-center border-r border-[#e6ebf2] text-[#97a0af] hover:bg-[#edf0f5] hover:text-[#4f5d70]"
                style={{ width: 44, height: 32 }}
                title="Add field"
                aria-label="add a field"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ shapeRendering: "geometricPrecision" }}>
                  <path d="M8 3a.5.5 0 0 1 .5.5V7.5H12a.5.5 0 0 1 0 1H8.5v4a.5.5 0 0 1-1 0V8.5H4a.5.5 0 0 1 0-1h3.5V3.5A.5.5 0 0 1 8 3Z" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {virtualItems.map((item) => {
            const row = table.getRowModel().rows[item.index];
            if (!row) {
              return (
                <div
                  key={`loader-${item.key}`}
                  className="absolute flex border-b border-[#edf1f7] bg-white px-3 text-xs text-[#6d7887]"
                  style={{ transform: `translateY(${item.start}px)`, height: 32, alignItems: "center" }}
                >
                  {hasNextPage ? "Loading more..." : "End of rows"}
                </div>
              );
            }

            return (
              <div
                key={row.id}
                className="absolute flex border-b border-[#edf1f7] bg-white hover:bg-[#fafbfd]"
                style={{
                  transform: `translateY(${item.start}px)`,
                  height: 32,
                }}
              >
                {row.getVisibleCells().map((cell, cellIndex) => {
                  const fieldId = cell.column.id;
                  const cellValue = cell.getValue();
                  const rawValue =
                    typeof cellValue === "string" ||
                    typeof cellValue === "number"
                      ? String(cellValue)
                      : "";
                  const isEditable = fieldId !== "__row";

                  if (!isEditable) {
                    return (
                      <div
                        key={cell.id}
                        className="flex shrink-0 items-center border-r border-[#edf1f7] bg-[#f8fafc] px-3 text-xs text-[#607082]"
                        style={{ width: 66, height: 32 }}
                      >
                        {rawValue}
                      </div>
                    );
                  }

                  const isEditing =
                    editingCell?.rowId === row.original.id &&
                    editingCell.fieldId === fieldId;

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

        {/* Ghost "+" row to add a new record */}
        <button
          type="button"
          onClick={onAddRow}
          className="flex w-full items-center border-b border-[#edf1f7] bg-white text-[#97a0af] hover:bg-[#fafbfd] hover:text-[#4f5d70]"
          style={{ height: 32 }}
          title="Insert a new record"
          aria-label="Insert new record in grid"
        >
          <div className="flex shrink-0 items-center justify-center" style={{ width: 66, height: 32 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ shapeRendering: "geometricPrecision" }}>
              <path d="M8 3a.5.5 0 0 1 .5.5V7.5H12a.5.5 0 0 1 0 1H8.5v4a.5.5 0 0 1-1 0V8.5H4a.5.5 0 0 1 0-1h3.5V3.5A.5.5 0 0 1 8 3Z" />
            </svg>
          </div>
        </button>
      </div>

      {/* Summary bar */}
      <div className="shrink-0 border-t border-[#e2e5ea] bg-white px-3 py-1 text-xs text-[#607082]">
        {totalCount.toLocaleString()} records
      </div>
    </>
  );
}
