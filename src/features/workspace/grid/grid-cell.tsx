"use client";

import { type KeyboardEvent, memo } from "react";

type GridCellProps = Readonly<{
  rowId: string;
  fieldId: string;
  value: string;
  isEditing: boolean;
  editValue: string;
  virtualRowIndex: number;
  cellIndex: number;
  onStartEdit: (rowId: string, fieldId: string, value: string) => void;
  onChangeEdit: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onCellKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    rowIndex: number,
    colIndex: number,
  ) => void;
}>;

export const GridCell = memo(function GridCell({
  rowId,
  fieldId,
  value,
  isEditing,
  editValue,
  virtualRowIndex,
  cellIndex,
  onStartEdit,
  onChangeEdit,
  onCommitEdit,
  onCancelEdit,
  onCellKeyDown,
}: GridCellProps) {
  if (isEditing) {
    return (
      <div className="border-r border-[#edf1f7] px-1 py-1">
        <input
          autoFocus
          value={editValue}
          onChange={(e) => onChangeEdit(e.target.value)}
          onBlur={onCommitEdit}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancelEdit();
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          className="h-6 w-full rounded border border-[#2a79ef] px-2 text-xs outline-none"
        />
      </div>
    );
  }

  return (
    <div className="border-r border-[#edf1f7] px-1 py-1">
      <button
        type="button"
        data-cell={`${virtualRowIndex}-${cellIndex}`}
        onDoubleClick={() => onStartEdit(rowId, fieldId, value)}
        onKeyDown={(e) => onCellKeyDown(e, virtualRowIndex, cellIndex)}
        className="h-6 w-full rounded px-2 text-left text-xs text-[#253044] hover:bg-[#f1f5fc] focus:ring-2 focus:ring-[#2a79ef] focus:outline-none"
      >
        {value}
      </button>
    </div>
  );
});
