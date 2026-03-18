"use client";

import { type KeyboardEvent, memo, useMemo } from "react";

function getHighlightedSegments(
  text: string,
  searchTerm: string,
): { text: string; highlight: boolean }[] {
  if (!searchTerm.trim()) return [{ text, highlight: false }];
  const term = searchTerm.trim().toLowerCase();
  const segments: { text: string; highlight: boolean }[] = [];
  let pos = 0;
  while (pos < text.length) {
    const matchIndex = text.toLowerCase().indexOf(term, pos);
    if (matchIndex === -1) {
      segments.push({ text: text.slice(pos), highlight: false });
      break;
    }
    if (matchIndex > pos) {
      segments.push({ text: text.slice(pos, matchIndex), highlight: false });
    }
    segments.push({
      text: text.slice(matchIndex, matchIndex + term.length),
      highlight: true,
    });
    pos = matchIndex + term.length;
  }
  return segments;
}

type GridCellProps = Readonly<{
  rowId: string;
  fieldId: string;
  value: string;
  isEditing: boolean;
  editValue: string;
  isFiltered?: boolean;
  searchTerm?: string;
  hasSearchMatch?: boolean;
  virtualRowIndex: number;
  cellIndex: number;
  colWidth: number;
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
  isFiltered,
  searchTerm,
  hasSearchMatch,
  virtualRowIndex,
  cellIndex,
  colWidth,
  onStartEdit,
  onChangeEdit,
  onCommitEdit,
  onCancelEdit,
  onCellKeyDown,
}: GridCellProps) {
  const filteredBg = isFiltered ? "bg-[#ecfce5]" : "";
  const searchMatchBg = hasSearchMatch ? "bg-[#fef9c3]" : "";

  const highlightedContent = useMemo(() => {
    if (!searchTerm?.trim() || !value) return null;
    const segments = getHighlightedSegments(value, searchTerm);
    return (
      <>
        {segments.map((seg, i) =>
          seg.highlight ? (
            <mark
              key={`${i}-${seg.text}-h`}
              className="rounded bg-[#fde047] font-normal text-inherit"
              style={{ padding: "0 1px" }}
            >
              {seg.text}
            </mark>
          ) : (
            <span key={`${i}-${seg.text}-n`}>{seg.text}</span>
          ),
        )}
      </>
    );
  }, [value, searchTerm]);

  if (isEditing) {
    return (
      <div
        className={`shrink-0 border-r border-[#d2d9e3] ${filteredBg} ${searchMatchBg}`}
        style={{ width: colWidth, height: 32 }}
      >
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
          className="h-full w-full border-2 border-[#2a79ef] px-[6px] text-[13px] leading-4 outline-none"
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 border-r border-[#d2d9e3] ${filteredBg} ${searchMatchBg}`}
      style={{ width: colWidth, height: 32 }}
    >
      <button
        type="button"
        data-cell={`${virtualRowIndex}-${cellIndex}`}
        data-search-match={hasSearchMatch ? "true" : undefined}
        onDoubleClick={() => onStartEdit(rowId, fieldId, value)}
        onKeyDown={(e) => {
          const isCopy = (e.ctrlKey || e.metaKey) && e.key === "c";
          const isPaste = (e.ctrlKey || e.metaKey) && e.key === "v";
          if (isCopy) {
            e.preventDefault();
            void navigator.clipboard.writeText(value);
            return;
          }
          if (isPaste) {
            e.preventDefault();
            void navigator.clipboard.readText().then((text) => {
              onStartEdit(rowId, fieldId, text);
            });
            return;
          }
          const isPrintable =
            e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
          if (isPrintable) {
            e.preventDefault();
            e.stopPropagation();
            onStartEdit(rowId, fieldId, "");
            onChangeEdit(e.key);
          } else {
            onCellKeyDown(e, virtualRowIndex, cellIndex);
          }
        }}
        className="flex h-full w-full items-center truncate px-[6px] text-left text-[13px] leading-4 text-[#253044] hover:bg-[#f1f5fc] focus:ring-2 focus:ring-[#2a79ef] focus:outline-none focus:ring-inset"
      >
        {highlightedContent ?? value}
      </button>
    </div>
  );
});
