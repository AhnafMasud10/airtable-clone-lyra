"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GridField } from "./types";

const noop = (): void => undefined;

function IconPencil() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
    </svg>
  );
}

function IconAiAgent() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2a3 3 0 0 0-3 3v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V5a3 3 0 0 0-3-3Zm2 4a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a2 2 0 1 1 4 0v1ZM4 9a1 1 0 0 0-1 1v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3a1 1 0 0 0-1-1H4Z" />
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

function IconInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1.5a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 8 1.5ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-2.75a1 1 0 0 0-.956.703.75.75 0 1 1-1.432-.452 2.5 2.5 0 1 1 3.127 3.153.75.75 0 0 1-.739.596.75.75 0 0 1-.75-.75V8a.75.75 0 0 1 .75-.75 1 1 0 1 0 0-2ZM7.25 11a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function IconSortAscending() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z" />
    </svg>
  );
}

function IconSortDescending() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.5 13.5a.5.5 0 0 1-1 0V4.707L1.354 5.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L3.5 4.707V13.5zm3.5-1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 9a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z" />
    </svg>
  );
}

function IconFunnel() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z" />
    </svg>
  );
}

function IconGroup() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.883 5.883 0 0 0-2.23-.468A5.493 5.493 0 0 0 4 9.5c0 1.093.36 2.1.936 2.928a6 6 0 0 0 1.12 1.168A.75.75 0 0 1 6 13v.5a.5.5 0 0 1-.5.5 4.5 4.5 0 0 1-4.5-4.5 4.5 4.5 0 0 1 4.5-4.5.5.5 0 0 1 .5.5v.5a.75.75 0 0 1-.504.745A6 6 0 0 0 6 9.936Z" />
    </svg>
  );
}

function IconFaders() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm7 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-7 1a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm7 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  );
}

function IconEyeSlash() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
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

function MenuDivider() {
  return (
    <li role="presentation" className="my-2 h-px bg-[#e0e5ed]" aria-hidden />
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  variant = "default",
  disabled = false,
  dataTestId,
}: Readonly<{
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
  dataTestId?: string;
}>) {
  return (
    <li role="menuitem" tabIndex={-1} data-tutorial-selector-id={dataTestId}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex w-full items-center rounded py-2 px-3 text-[13px] transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
        style={{
          color: variant === "danger" ? "#c33c3c" : "#1d1f25",
        }}
      >
        <span className="mr-2 flex-none text-[#4f5d70] [&_svg]:size-4">
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      </button>
    </li>
  );
}

export type ColumnContextMenuProps = Readonly<{
  x: number;
  y: number;
  field: GridField;
  fieldIndex: number;
  isPrimary: boolean;
  onEditField: (fieldId: string) => void;
  onDuplicateField: (fieldId: string) => void;
  onInsertLeft: (fieldIndex: number) => void;
  onInsertRight: (fieldIndex: number) => void;
  onCopyFieldUrl: (fieldId: string) => void;
  onEditFieldDescription: (fieldId: string) => void;
  onSortAscending: (fieldId: string) => void;
  onSortDescending: (fieldId: string) => void;
  onFilterByField: (fieldId: string) => void;
  onGroupByField: (fieldId: string) => void;
  onHideField: (fieldId: string) => void;
  onDeleteField: (fieldId: string) => void;
  onClose: () => void;
}>;

export function ColumnContextMenu({
  x,
  y,
  field,
  fieldIndex,
  isPrimary: _isPrimary,
  onEditField,
  onDuplicateField,
  onInsertLeft,
  onInsertRight,
  onCopyFieldUrl,
  onEditFieldDescription,
  onSortAscending,
  onSortDescending,
  onFilterByField,
  onGroupByField,
  onHideField,
  onDeleteField,
  onClose,
}: ColumnContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
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

  const menu = (
    <div
      ref={menuRef}
      role="dialog"
      tabIndex={-1}
      data-popup
      className="overflow-y-auto rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.12)]"
      style={{
        position: "fixed",
        left: position.left,
        top: position.top,
        width: 320,
        maxHeight: 665,
        maxWidth: 573,
        zIndex: 10004,
        fontFamily:
          "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <ul role="menu" tabIndex={-1} className="p-3">
        <MenuItem
          icon={<IconPencil />}
          label="Edit field"
          onClick={() => onEditField(field.id)}
          dataTestId="columnMenuItem-changeType"
        />
        <MenuDivider />
        <MenuItem
          icon={<IconCopy />}
          label="Duplicate field"
          onClick={() => onDuplicateField(field.id)}
          dataTestId="columnMenuItem-duplicate"
        />
        <MenuItem
          icon={<IconArrowLeft />}
          label="Insert left"
          onClick={() => onInsertLeft(fieldIndex)}
          disabled={fieldIndex === 0}
          dataTestId="columnMenuItem-insertLeft"
        />
        <MenuItem
          icon={<IconArrowRight />}
          label="Insert right"
          onClick={() => onInsertRight(fieldIndex)}
          dataTestId="columnMenuItem-insertRight"
        />
        <MenuDivider />
        <MenuItem
          icon={<IconAiAgent />}
          label="Summarize field"
          onClick={noop}
          dataTestId="columnMenuItem-summarizeText"
        />
        <MenuItem
          icon={<IconAiAgent />}
          label="Write headline for field"
          onClick={noop}
          dataTestId="columnMenuItem-addHeadlineField"
        />
        <MenuDivider />
        <MenuItem
          icon={<IconLink />}
          label="Copy field URL"
          onClick={() => onCopyFieldUrl(field.id)}
          dataTestId="columnMenuItem-copyUrl"
        />
        <MenuItem
          icon={<IconInfo />}
          label="Edit field description"
          onClick={() => onEditFieldDescription(field.id)}
          dataTestId="columnMenuItem-editDescription"
        />
        <MenuItem
          icon={<IconLock />}
          label="Edit field permissions"
          onClick={noop}
          dataTestId="columnMenuItem-editPermissions"
        />
        <MenuDivider />
        <MenuItem
          icon={<IconSortAscending />}
          label={
            <span>
              Sort <span className="font-medium">A → Z</span>
            </span>
          }
          onClick={() => onSortAscending(field.id)}
          dataTestId="columnMenuItem-sortAscending"
        />
        <MenuItem
          icon={<IconSortDescending />}
          label={
            <span>
              Sort <span className="font-medium">Z → A</span>
            </span>
          }
          onClick={() => onSortDescending(field.id)}
          dataTestId="columnMenuItem-sortDescending"
        />
        <MenuDivider />
        <MenuItem
          icon={<IconFunnel />}
          label="Filter by this field"
          onClick={() => onFilterByField(field.id)}
          dataTestId="columnMenuItem-addFilter"
        />
        <MenuItem
          icon={<IconGroup />}
          label="Group by this field"
          onClick={() => onGroupByField(field.id)}
          dataTestId="columnMenuItem-groupBy"
        />
        <MenuItem
          icon={<IconFaders />}
          label="Show dependencies"
          onClick={noop}
          dataTestId="columnMenuItem-showDependencies"
        />
        <MenuDivider />
        <MenuItem
          icon={<IconEyeSlash />}
          label="Hide field"
          onClick={() => onHideField(field.id)}
          dataTestId="columnMenuItem-hide"
        />
        <MenuItem
          icon={<IconTrash />}
          label="Delete field"
          onClick={() => onDeleteField(field.id)}
          variant="danger"
          dataTestId="columnMenuItem-delete"
        />
      </ul>
    </div>
  );

  return createPortal(menu, document.body);
}
