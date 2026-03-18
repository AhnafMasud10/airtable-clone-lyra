"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

function IconArrowUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2a.5.5 0 0 1 .5.5v9.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 1 1 .708-.708L7.5 12.293V2.5A.5.5 0 0 1 8 2Z" />
    </svg>
  );
}

function IconArrowDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 14a.5.5 0 0 1-.5-.5V3.707L4.354 6.854a.5.5 0 1 1-.708-.708l4-4a.5.5 0 0 1 .708 0l4 4a.5.5 0 0 1-.708.708L8.5 3.707V13.5a.5.5 0 0 1-.5.5Z" />
    </svg>
  );
}

function IconDuplicate() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z" />
    </svg>
  );
}

function IconTemplate() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4ZM2 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Zm2-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H4Z" />
    </svg>
  );
}

function IconExpand() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2.5 3.5a1 1 0 0 1 1-1H6a.5.5 0 0 1 0 1H3.5V6a.5.5 0 0 1-1 0V3.5Zm7 0A.5.5 0 0 1 10 3h2.5a1 1 0 0 1 1 1V6.5a.5.5 0 0 1-1 0V4H10a.5.5 0 0 1-.5-.5ZM3 9.5a.5.5 0 0 1 .5.5v2h2a.5.5 0 0 1 0 1H3.5a1 1 0 0 1-1-1V10a.5.5 0 0 1 .5-.5Zm9.5 0a.5.5 0 0 1 .5.5v2.5a1 1 0 0 1-1 1H10a.5.5 0 0 1 0-1h2V10a.5.5 0 0 1 .5-.5Z" />
    </svg>
  );
}

function IconAgent() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="5" cy="6" r="1.5" />
      <circle cx="11" cy="6" r="1.5" />
      <path d="M8 10c-1.5 0-2.5.5-3 1.5h6c-.5-1-1.5-1.5-3-1.5Z" />
    </svg>
  );
}

function IconComment() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H4.707l-1.853 1.853A.5.5 0 0 1 2 13.5V3.5Zm1.5-.5a.5.5 0 0 0-.5.5v9.293l1.146-1.147A.5.5 0 0 1 4 11.5h8a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5H4Z" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
      <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
    </svg>
  );
}

function IconEnvelope() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118Z" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function IconOmni() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
        <g key={angle} transform={`rotate(${angle}, 10, 10)`}>
          <rect
            x="9"
            y="1.5"
            width="2"
            height="2"
            rx="0.5"
            fill="currentColor"
            opacity={0.15 + (angle / 30) * 0.07}
          />
        </g>
      ))}
      <rect x="4" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="14" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function IconRobot() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M9 11V8a3 3 0 0 1 6 0v3" />
      <circle cx="9" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 3v2" />
    </svg>
  );
}

type RowContextMenuProps = Readonly<{
  x: number;
  y: number;
  selectedRowIds: string[];
  anchorRowId: string;
  onInsertAbove: (recordId: string) => void;
  onInsertBelow: (recordId: string) => void;
  onDuplicate: (recordId: string) => void;
  onDelete: () => void;
  onCopyRecordUrl: (recordId: string) => void;
  onClose: () => void;
}>;

function MenuItem({
  icon,
  label,
  onClick,
  variant = "default",
  showChevron = false,
  disabled = false,
  highlighted = false,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  showChevron?: boolean;
  disabled?: boolean;
  highlighted?: boolean;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[rgb(247,249,251)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent ${highlighted ? "bg-[rgb(247,249,251)]" : ""}`}
      style={{
        color: variant === "danger" ? "rgb(195,60,60)" : "rgb(29,31,37)",
      }}
    >
      <span className="flex-none text-[rgb(97,102,112)] [&_svg]:size-4">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {showChevron && (
        <span className="flex-none text-[rgb(150,155,165)]">
          <IconChevronRight />
        </span>
      )}
    </button>
  );
}

export function RowContextMenu({
  x,
  y,
  selectedRowIds,
  anchorRowId,
  onInsertAbove,
  onInsertBelow,
  onDuplicate,
  onDelete,
  onCopyRecordUrl,
  onClose,
}: RowContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const isAnchorOptimistic = anchorRowId.startsWith("optimistic-row-");
  const [position, setPosition] = useState({ left: x, top: y });

  useEffect(() => {
    setPosition({ left: x, top: y });
  }, [x, y]);

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const padding = 8;
    const rect = el.getBoundingClientRect();
    let left = rect.left;
    let top = rect.top;
    if (rect.right > window.innerWidth - padding) {
      left = window.innerWidth - rect.width - padding;
    }
    if (rect.bottom > window.innerHeight - padding) {
      top = Math.max(padding, window.innerHeight - rect.height - padding);
    }
    if (rect.left < padding) left = padding;
    if (rect.top < padding) top = padding;
    setPosition({ left, top });
  }, [x, y]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const isMultiSelect = selectedRowIds.length > 1;

  const menu = (
    <div
      ref={menuRef}
      data-popup
      className="rounded-lg bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[rgb(214,218,226)] py-1 min-w-[220px] max-h-[calc(100vh-16px)] overflow-y-auto overflow-x-auto max-w-[calc(100vw-16px)]"
      style={{
        position: "fixed",
        left: position.left,
        top: position.top,
        zIndex: 9999,
        fontFamily:
          "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {isMultiSelect ? (
        <>
          <MenuItem
            icon={<IconOmni />}
            label={`Ask Omni about ${selectedRowIds.length} records`}
            onClick={() => {}}
            highlighted
          />
          <div className="my-1 h-px bg-[rgb(229,233,240)]" />
          <MenuItem
            icon={<IconRobot />}
            label="Run field agent"
            onClick={() => {}}
            showChevron
          />
          <div className="my-1 h-px bg-[rgb(229,233,240)]" />
          <MenuItem
            icon={<IconEnvelope />}
            label="Send all selected records"
            onClick={() => {}}
          />
          <div className="my-1 h-px bg-[rgb(229,233,240)]" />
          <MenuItem
            icon={<IconTrash />}
            label="Delete all selected records"
            onClick={onDelete}
            variant="danger"
          />
        </>
      ) : (
        <>
          <MenuItem
            icon={<IconArrowDown />}
            label="Insert record above"
            onClick={() => onInsertAbove(anchorRowId)}
            disabled={isAnchorOptimistic}
          />
          <MenuItem
            icon={<IconArrowUp />}
            label="Insert record below"
            onClick={() => onInsertBelow(anchorRowId)}
            disabled={isAnchorOptimistic}
          />
          <div className="my-1 h-px bg-[rgb(229,233,240)]" />
          <MenuItem
            icon={<IconDuplicate />}
            label="Duplicate record"
            onClick={() => onDuplicate(anchorRowId)}
          />
          <MenuItem
            icon={<IconTemplate />}
            label="Apply template"
            onClick={() => {}}
          />
          <MenuItem
            icon={<IconExpand />}
            label="Expand record"
            onClick={() => {}}
          />
          <MenuItem
            icon={<IconAgent />}
            label="Run field agent"
            onClick={() => {}}
            showChevron
          />
          <div className="my-1 h-px bg-[rgb(229,233,240)]" />
          <MenuItem
            icon={<IconComment />}
            label="Add comment"
            onClick={() => {}}
          />
          <MenuItem
            icon={<IconLink />}
            label="Copy record URL"
            onClick={() => onCopyRecordUrl(anchorRowId)}
          />
          <MenuItem
            icon={<IconEnvelope />}
            label="Send record"
            onClick={() => {}}
          />
          <div className="my-1 h-px bg-[rgb(229,233,240)]" />
          <MenuItem
            icon={<IconTrash />}
            label="Delete record"
            onClick={onDelete}
            variant="danger"
          />
        </>
      )}
    </div>
  );

  return createPortal(menu, document.body);
}
