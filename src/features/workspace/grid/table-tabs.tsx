"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TableSummary } from "./types";

type TableTabsProps = Readonly<{
  tables: TableSummary[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
  onPrefetchTable?: (tableId: string) => void;
  onAddTable: () => void;
  onSeedTable: () => void;
  isSeeding: boolean;
  onBulkInsert: () => void;
  isBulkInserting: boolean;
  onRenameTable: (tableId: string, name: string) => void;
  onDuplicateTable: (tableId: string) => void;
  onDeleteTable: (tableId: string) => void;
  onClearTableData: (tableId: string) => void;
}>;

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M8 2.75a.75.75 0 0 1 .75.75v3.75h3.75a.75.75 0 0 1 0 1.5H8.75v3.75a.75.75 0 0 1-1.5 0V8.75H3.5a.75.75 0 0 1 0-1.5h3.75V3.5A.75.75 0 0 1 8 2.75Z" />
    </svg>
  );
}

const SHADOW_LOW =
  "0px 0px 1px rgba(0,0,0,0.32), 0px 0px 2px rgba(0,0,0,0.08), 0px 1px 3px rgba(0,0,0,0.08)";
const SHADOW_MENU =
  "0px 4px 12px rgba(0,0,0,0.15), 0px 0px 1px rgba(0,0,0,0.2)";

const GREEN_LIGHT3 = "rgb(230, 252, 232)";
const GREEN_DUSTY = "rgb(64, 124, 74)";
const FG_DEFAULT = "rgb(29, 31, 37)";
const FG_SUBTLE = "rgb(97, 102, 112)";
const BETA_BG = "rgb(255, 237, 213)";
const BETA_TEXT = "rgb(194, 120, 4)";
const BUSINESS_BG = "rgb(219, 234, 254)";
const BUSINESS_TEXT = "rgb(30, 64, 175)";

const SOURCE_ITEMS: Array<{
  label: string;
  icon: string;
  badge?: string;
}> = [
  { label: "Airtable base", icon: "📦" },
  { label: "CSV file", icon: "📄" },
  { label: "Google Calendar", icon: "📅" },
  { label: "Google Sheets", icon: "📊" },
  { label: "Microsoft Excel", icon: "📗" },
  { label: "Salesforce", icon: "☁️", badge: "Business" },
  { label: "Smartsheet", icon: "📋" },
];

export function TableTabs({
  tables,
  selectedTableId,
  onSelectTable,
  onPrefetchTable,
  onAddTable,
  onSeedTable,
  isSeeding,
  onBulkInsert: _onBulkInsert,
  isBulkInserting: _isBulkInserting,
  onRenameTable,
  onDuplicateTable,
  onDeleteTable,
  onClearTableData,
}: TableTabsProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [tableContextMenu, setTableContextMenu] = useState<{ tableId: string; rect: DOMRect } | null>(null);
  const [renamingTableId, setRenamingTableId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const closeMenu = () => setAddMenuOpen(false);

  return (
    <div
      className="relative z-1 flex items-end"
      style={{
        height: "32px",
        backgroundColor: GREEN_LIGHT3,
        fontFamily:
          "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
      }}
    >
      {/* Scrollable tabs area */}
      <div
        className="flex min-w-0 flex-1 items-end overflow-x-auto"
        style={{
          scrollbarWidth: "none",
          clipPath: "inset(-3px 0px 0px)",
        }}
      >
        <nav className="flex flex-none" style={{ height: "32px" }}>
          {tables.map((tableItem, idx) => {
            const isActive = selectedTableId === tableItem.id;
            const showDivider = idx > 0;
            return (
              <div
                key={tableItem.id}
                className="flex items-center"
                style={{ height: "32px" }}
              >
                {showDivider && (
                  <div
                    style={{
                      width: "1px",
                      height: "12px",
                      flexShrink: 0,
                      backgroundColor: "rgba(64, 124, 74, 0.2)",
                    }}
                  />
                )}
                <div
                  className="flex flex-none items-center"
                  style={{
                    height: "32px",
                    borderRadius: isActive ? "3px 3px 0 0" : undefined,
                    backgroundColor: isActive ? "white" : "transparent",
                    boxShadow: isActive ? SHADOW_LOW : "none",
                    position: "relative",
                    zIndex: isActive ? 2 : 1,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (renamingTableId !== tableItem.id) onSelectTable(tableItem.id);
                    }}
                    onMouseEnter={() => onPrefetchTable?.(tableItem.id)}
                    className="flex h-full items-center"
                    style={{
                      paddingLeft: "12px",
                      paddingRight: isActive ? "8px" : "12px",
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? FG_DEFAULT : GREEN_DUSTY,
                    }}
                  >
                    {renamingTableId === tableItem.id ? (
                      <input
                        type="text"
                        autoFocus
                        className="w-full rounded border border-blue-500 px-1 py-0 text-[13px] font-semibold outline-none"
                        style={{ color: FG_DEFAULT, lineHeight: "18px", minWidth: 60 }}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && renameValue.trim()) {
                            onRenameTable(tableItem.id, renameValue.trim());
                            setRenamingTableId(null);
                          }
                          if (e.key === "Escape") setRenamingTableId(null);
                        }}
                        onBlur={() => {
                          if (renameValue.trim() && renameValue.trim() !== tableItem.name) {
                            onRenameTable(tableItem.id, renameValue.trim());
                          }
                          setRenamingTableId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate">{tableItem.name}</span>
                    )}
                  </button>
                  {isActive ? (
                    <button
                      type="button"
                      className="flex items-center"
                      style={{
                        paddingRight: "12px",
                        color: FG_SUBTLE,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setTableContextMenu({ tableId: tableItem.id, rect });
                      }}
                    >
                      <ChevronDownIcon />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </nav>

        {/* All tables chevron */}
        <button
          type="button"
          className="flex flex-none items-center justify-center"
          style={{
            height: "32px",
            padding: "0 12px",
            color: GREEN_DUSTY,
          }}
          aria-label="Search all tables"
        >
          <ChevronDownIcon />
        </button>

        {/* Add or import (with dropdown) */}
        <div className="relative flex-none">
          <button
            ref={addButtonRef}
            type="button"
            onClick={() => setAddMenuOpen((o) => !o)}
            className="flex items-center justify-center rounded"
            style={{
              height: "32px",
              width: "32px",
              color: GREEN_DUSTY,
              backgroundColor: addMenuOpen
                ? "rgba(64, 124, 74, 0.12)"
                : "transparent",
            }}
            aria-expanded={addMenuOpen}
            aria-haspopup="true"
            aria-label="Add or import table"
          >
            <PlusIcon />
          </button>

          {addMenuOpen &&
            createPortal(
              <AddOrImportMenu
                onStartFromScratch={() => {
                  onAddTable();
                  closeMenu();
                }}
                onSeedTable={() => {
                  onSeedTable();
                  closeMenu();
                }}
                isSeeding={isSeeding}
                onClose={closeMenu}
                addButtonRef={addButtonRef}
              />,
              document.body,
            )}
        </div>

        {/* Table context menu */}
        {tableContextMenu &&
          createPortal(
            <TableContextMenu
              anchorRect={tableContextMenu.rect}
              tableId={tableContextMenu.tableId}
              tableName={(tables.find((t) => t.id === tableContextMenu.tableId)?.name) ?? ""}
              canDelete={tables.length > 1}
              onRename={(id, name) => {
                setRenameValue(name);
                setRenamingTableId(id);
              }}
              onDuplicate={(id) => onDuplicateTable(id)}
              onClearData={(id) => onClearTableData(id)}
              onDelete={(id) => onDeleteTable(id)}
              onClose={() => setTableContextMenu(null)}
            />,
            document.body,
          )}
      </div>

      {/* Right side: Tools */}
      <div
        className="flex flex-none items-center gap-1 pr-2"
        style={{ height: "32px" }}
      >
        <button
          type="button"
          className="flex items-center gap-1"
          style={{
            height: "32px",
            padding: "0 12px",
            fontSize: "13px",
            fontWeight: 400,
            color: GREEN_DUSTY,
          }}
        >
          <span>Tools</span>
          <ChevronDownIcon />
        </button>
      </div>
    </div>
  );
}

type AddOrImportMenuProps = Readonly<{
  onStartFromScratch: () => void;
  onSeedTable: () => void;
  isSeeding: boolean;
  onClose: () => void;
  addButtonRef: React.RefObject<HTMLButtonElement | null>;
}>;

// ── Table Context Menu Icons ──────────────────────────────────────────

function ImportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 5v6M5 8l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M11.5 2.5a1.41 1.41 0 0 1 2 2L5.5 12.5l-3 1 1-3 8-8z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <line x1="3" y1="13" x2="13" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="2" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="5" cy="5" r="1.5" fill="white" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11" cy="11" r="1.5" fill="white" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11 3H4.5A1.5 1.5 0 0 0 3 4.5V11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function GanttIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="3" y="3" width="7" height="2.5" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="5" y="6.75" width="8" height="2.5" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="4" y="10.5" width="6" height="2.5" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <line x1="8" y1="7" x2="8" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="5.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="4" y="7" width="8" height="6" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 7V5a2 2 0 1 1 4 0v2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M5 4.5v8a1.5 1.5 0 0 0 1.5 1.5h3A1.5 1.5 0 0 0 11 12.5v-8" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Table Context Menu ───────────────────────────────────────────────

type TableContextMenuProps = Readonly<{
  anchorRect: DOMRect;
  tableId: string;
  tableName: string;
  canDelete: boolean;
  onRename: (tableId: string, currentName: string) => void;
  onDuplicate: (tableId: string) => void;
  onClearData: (tableId: string) => void;
  onDelete: (tableId: string) => void;
  onClose: () => void;
}>;

function TableContextMenu({
  anchorRect,
  tableId,
  tableName,
  canDelete,
  onRename,
  onDuplicate,
  onClearData,
  onDelete,
  onClose,
}: TableContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
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

  const menuItemClass = "flex w-full cursor-pointer items-center rounded py-1.5 px-2 hover:bg-[rgb(241,243,246)]";
  const iconClass = "mr-2 flex-none text-[rgb(29,31,37)]";

  return (
    <div
      ref={menuRef}
      role="dialog"
      tabIndex={-1}
      data-popup
      className="fixed z-[9999] rounded-xl bg-white"
      style={{
        top: anchorRect.bottom + 4,
        left: anchorRect.left,
        width: 330,
        boxShadow: SHADOW_MENU,
        fontFamily:
          "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
        maxHeight: "calc(100vh - 100px)",
        overflowY: "auto",
      }}
    >
      <ul role="menu" tabIndex={-1} className="p-1.5">
        {/* Import data */}
        <li
          role="menuitem"
          tabIndex={-1}
          className={menuItemClass}
          style={{ fontSize: 13, color: FG_DEFAULT }}
        >
          <span className={iconClass}><ImportIcon /></span>
          <span className="flex-auto truncate select-none">Import data</span>
          <span className="ml-1 flex-none text-[rgb(29,31,37)]"><ChevronRightIcon /></span>
        </li>

        {/* Separator */}
        <li role="presentation" className="mx-2 my-1" style={{ height: 1, backgroundColor: "rgb(229,233,240)" }} />

        {/* Rename table */}
        <li
          role="menuitem"
          tabIndex={-1}
          className={menuItemClass}
          style={{ fontSize: 13, color: FG_DEFAULT }}
          onClick={() => { onRename(tableId, tableName); onClose(); }}
        >
          <span className={iconClass}><PencilIcon /></span>
          <span className="flex-auto truncate select-none">Rename table</span>
        </li>

        {/* Manage fields */}
        <li
          role="menuitem"
          tabIndex={-1}
          className={menuItemClass}
          style={{ fontSize: 13, color: FG_DEFAULT }}
        >
          <span className={iconClass}><SlidersIcon /></span>
          <span className="flex-auto truncate select-none">Manage fields</span>
        </li>

        {/* Duplicate table */}
        <li
          role="menuitem"
          tabIndex={-1}
          className={menuItemClass}
          style={{ fontSize: 13, color: FG_DEFAULT }}
          onClick={() => { onDuplicate(tableId); onClose(); }}
        >
          <span className={iconClass}><CopyIcon /></span>
          <span className="flex-auto truncate select-none">Duplicate table</span>
        </li>

        {/* Separator */}
        <li role="presentation" className="mx-2 my-1" style={{ height: 1, backgroundColor: "rgb(229,233,240)" }} />

        {/* Configure date dependencies */}
        <li
          role="menuitem"
          tabIndex={-1}
          className={menuItemClass}
          style={{ fontSize: 13, color: FG_DEFAULT }}
        >
          <span className={iconClass}><GanttIcon /></span>
          <span className="flex-auto truncate select-none">Configure date dependencies</span>
        </li>

        {/* Separator */}
        <li role="presentation" className="mx-2 my-1" style={{ height: 1, backgroundColor: "rgb(229,233,240)" }} />

        {/* Edit table description */}
        <li
          role="menuitem"
          tabIndex={-1}
          className={menuItemClass}
          style={{ fontSize: 13, color: FG_DEFAULT }}
        >
          <span className={iconClass}><InfoIcon /></span>
          <span className="flex-auto truncate select-none">Edit table description</span>
        </li>

        {/* Edit table permissions */}
        <li
          role="menuitem"
          tabIndex={-1}
          className={menuItemClass}
          style={{ fontSize: 13, color: FG_DEFAULT }}
        >
          <span className={iconClass}><LockIcon /></span>
          <span className="flex-auto truncate select-none">Edit table permissions</span>
        </li>

        {/* Separator */}
        <li role="presentation" className="mx-2 my-1" style={{ height: 1, backgroundColor: "rgb(229,233,240)" }} />

        {/* Clear data */}
        <li
          role="menuitem"
          tabIndex={-1}
          className={menuItemClass}
          style={{ fontSize: 13, color: FG_DEFAULT }}
          onClick={() => { onClearData(tableId); onClose(); }}
        >
          <span className={iconClass}><XIcon /></span>
          <span className="flex-auto truncate select-none">Clear data</span>
        </li>

        {/* Delete table */}
        <li
          role="menuitem"
          tabIndex={-1}
          className={`flex w-full items-center rounded py-1.5 px-2 ${canDelete ? "cursor-pointer hover:bg-[rgb(241,243,246)]" : "opacity-50 cursor-not-allowed"}`}
          style={{ fontSize: 13, color: FG_DEFAULT }}
          aria-disabled={!canDelete}
          onClick={() => { if (canDelete) { onDelete(tableId); onClose(); } }}
        >
          <span className={iconClass}><TrashIcon /></span>
          <span className="flex-auto truncate select-none">Delete table</span>
        </li>
      </ul>
    </div>
  );
}

function AddOrImportMenu({
  onStartFromScratch,
  onSeedTable,
  isSeeding,
  onClose,
  addButtonRef,
}: AddOrImportMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    const btn = addButtonRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const maxHeight = Math.min(679, window.innerHeight - 100);
      let top = rect.bottom + 4;
      if (top + maxHeight > window.innerHeight - 8) {
        top = Math.max(8, window.innerHeight - maxHeight - 8);
      }
      let left = rect.left;
      if (left + 280 > window.innerWidth - 8) {
        left = window.innerWidth - 280 - 8;
      }
      if (left < 8) left = 8;
      setPosition({ top, left });
    }
  }, [addButtonRef]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        addButtonRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, addButtonRef]);

  const handleStartFromScratch = () => {
    onClose();
    requestAnimationFrame(() => {
      onStartFromScratch();
    });
  };

  return (
    <div
      ref={menuRef}
      data-popup
      role="dialog"
      tabIndex={-1}
      className="fixed z-[9999] rounded-lg bg-white p-1"
      style={{
        top: position.top,
        left: position.left,
        width: "280px",
        minWidth: "280px",
        maxHeight: "min(679px, calc(100vh - 16px))",
        overflowY: "auto",
        maxWidth: "calc(100vw - 16px)",
        boxShadow: SHADOW_MENU,
      }}
    >
      <ul role="menu" tabIndex={-1} className="m-0 list-none p-0">
        {/* Add a blank table */}
        <li
          role="presentation"
          className="truncate px-2 pt-2 pb-0.5 text-xs"
          style={{ color: FG_SUBTLE }}
        >
          Add a blank table
        </li>
        <li role="menuitem" tabIndex={-1}>
          <button
            type="button"
            onClick={handleStartFromScratch}
            className="flex w-full items-center rounded px-2 py-1.5 text-left text-sm hover:bg-black/5"
            style={{ color: FG_DEFAULT }}
            aria-label="Start from scratch"
          >
            <span className="flex-auto truncate">Start from scratch</span>
          </button>
        </li>
        <li role="menuitem" tabIndex={-1}>
          <button
            type="button"
            onClick={onSeedTable}
            disabled={isSeeding}
            className="flex w-full items-center rounded px-2 py-1.5 text-left text-sm hover:bg-black/5 disabled:opacity-50"
            style={{ color: FG_DEFAULT }}
            aria-label="Seed sample data"
          >
            <span className="flex-none text-base mr-2">🌱</span>
            <span className="flex-auto truncate">
              {isSeeding ? "Seeding..." : "Seed sample data (8 cols, 30 rows)"}
            </span>
          </button>
        </li>

        {/* Divider */}
        <li
          role="presentation"
          className="mx-2 my-1"
          style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.08)" }}
        />

        {/* Build with Omni */}
        <li
          role="presentation"
          className="truncate px-2 pt-2 pb-0.5 text-xs"
          style={{ color: FG_SUBTLE }}
        >
          Build with Omni
        </li>
        <li role="menuitem" tabIndex={-1}>
          <button
            type="button"
            className="flex w-full items-center rounded px-2 py-1.5 text-left text-sm hover:bg-black/5"
            style={{ color: FG_DEFAULT }}
          >
            <span className="flex-auto truncate">New table</span>
          </button>
        </li>
        <li role="menuitem" tabIndex={-1}>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-black/5"
            style={{ color: FG_DEFAULT }}
          >
            <span className="flex-auto truncate">New table with web data</span>
            <span
              className="ml-1 flex-none rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: BETA_BG, color: BETA_TEXT }}
            >
              Beta
            </span>
          </button>
        </li>

        {/* Divider */}
        <li
          role="presentation"
          className="mx-2 my-1"
          style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.08)" }}
        />

        {/* Add from other sources */}
        <li
          role="presentation"
          className="truncate px-2 pt-2 pb-0.5 text-xs"
          style={{ color: FG_SUBTLE }}
        >
          Add from other sources
        </li>
        {SOURCE_ITEMS.map((item) => (
          <li key={item.label} role="menuitem" tabIndex={-1}>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-black/5"
              style={{ color: FG_DEFAULT }}
              aria-label={item.label}
            >
              <span className="flex-none text-base">{item.icon}</span>
              <span className="flex-auto truncate">{item.label}</span>
              {item.badge && (
                <span
                  className="ml-auto flex-none rounded px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: BUSINESS_BG, color: BUSINESS_TEXT }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          </li>
        ))}
        <li role="menuitem" tabIndex={-1}>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-black/5"
            style={{ color: FG_DEFAULT }}
            aria-label="26 more sources"
          >
            <span className="flex-auto truncate">26 more sources...</span>
            <ChevronRightIcon />
          </button>
        </li>
      </ul>
    </div>
  );
}
