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

function AirtableIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 200 170" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path fill="rgb(255,186,5)" d="M90.04,12.37 L24.08,39.66C20.41,41.18 20.45,46.39 24.14,47.85L90.38,74.12C96.2,76.43 102.68,76.43 108.5,74.12L174.73,47.85C178.42,46.39 178.46,41.18 174.79,39.66L108.83,12.37C102.82,9.88 96.06,9.88 90.04,12.37" />
      <path fill="rgb(57,202,255)" d="M105.31,88.46V154.08C105.31,157.2 108.46,159.33 111.36,158.18L185.17,129.54C186.85,128.87 187.96,127.24 187.96,125.43V59.81C187.96,56.69 184.81,54.55 181.91,55.7L108.1,84.35C106.42,85.02 105.31,86.65 105.31,88.46" />
      <path fill="rgb(220,4,59)" d="M88.08,91.85L66.17,102.42L63.95,103.5L17.71,125.65C14.78,127.07 11.04,124.93 11.04,121.67V60.09C11.04,58.91 11.64,57.89 12.45,57.13C12.79,56.79 13.18,56.51 13.57,56.29C14.68,55.63 16.25,55.45 17.59,55.98L87.71,83.76C91.27,85.17 91.55,90.17 88.08,91.85" />
      <path fill="rgba(0,0,0,0.25)" d="M88.08,91.85L66.17,102.42L12.45,57.13C12.79,56.79 13.18,56.51 13.57,56.29C14.68,55.63 16.25,55.45 17.59,55.98L87.71,83.76C91.27,85.17 91.55,90.17 88.08,91.85" />
    </svg>
  );
}

function CsvIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M4 1.5A1.5 1.5 0 0 0 2.5 3v10A1.5 1.5 0 0 0 4 14.5h8a1.5 1.5 0 0 0 1.5-1.5V5.621a1.5 1.5 0 0 0-.44-1.06L10.94 2.44A1.5 1.5 0 0 0 9.879 2H4ZM3.5 3a.5.5 0 0 1 .5-.5h5.5v2.5A1.5 1.5 0 0 0 11 6.5h1.5V13a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V3Zm7.5-.293V4.5a.5.5 0 0 0 .5.5h1.793L11 2.707ZM5 8.5a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0V9a.5.5 0 0 0-.5-.5Zm3 0a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0V9a.5.5 0 0 0-.5-.5Zm3 0a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0V9a.5.5 0 0 0-.5-.5Z" />
    </svg>
  );
}

function GoogleCalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M11.42 14.5L14.5 11.42H11.42V14.5Z" fill="#EA4335" />
      <path d="M14.5 4.58H11.42V11.42H14.5V4.58Z" fill="#FBBC04" />
      <path d="M11.42 11.42H4.58V14.5H11.42V11.42Z" fill="#34A853" />
      <path d="M1.5 11.42V13.47C1.5 14.04 1.96 14.5 2.53 14.5H4.58V11.42H1.5Z" fill="#188038" />
      <path d="M14.5 4.58V2.53C14.5 1.96 14.04 1.5 13.47 1.5H11.42V4.58H14.5Z" fill="#1967D2" />
      <path d="M11.42 1.5H2.53C1.96 1.5 1.5 1.96 1.5 2.53V11.42H4.58V4.58H11.42V1.5Z" fill="#4285F4" />
      <path d="M5.98 9.89C5.73 9.71 5.55 9.46 5.45 9.13L6.05 8.88C6.1 9.09 6.19 9.25 6.33 9.36C6.46 9.47 6.62 9.53 6.81 9.53C7.01 9.53 7.18 9.47 7.31 9.35C7.45 9.23 7.52 9.08 7.52 8.9C7.52 8.71 7.45 8.56 7.3 8.44C7.16 8.33 6.97 8.27 6.75 8.27H6.41V7.68H6.72C6.91 7.68 7.07 7.63 7.2 7.53C7.33 7.42 7.39 7.28 7.39 7.1C7.39 6.95 7.33 6.82 7.22 6.72C7.1 6.63 6.95 6.58 6.77 6.58C6.6 6.58 6.46 6.63 6.36 6.72C6.26 6.81 6.18 6.93 6.13 7.06L5.55 6.82C5.62 6.6 5.77 6.4 5.98 6.23C6.19 6.07 6.45 5.98 6.78 5.98C7.02 5.98 7.24 6.03 7.43 6.12C7.62 6.21 7.77 6.34 7.88 6.51C7.99 6.67 8.04 6.86 8.04 7.06C8.04 7.27 7.99 7.45 7.89 7.59C7.79 7.74 7.66 7.85 7.52 7.93V7.96C7.71 8.04 7.87 8.17 7.99 8.34C8.12 8.5 8.18 8.7 8.18 8.93C8.18 9.17 8.12 9.38 8 9.56C7.89 9.74 7.72 9.88 7.52 9.99C7.31 10.09 7.07 10.14 6.82 10.14C6.52 10.15 6.24 10.06 5.98 9.89ZM9.63 6.94L8.98 7.41L8.65 6.92L9.82 6.07H10.27V10.05H9.63V6.94Z" fill="#4285F4" />
    </svg>
  );
}

function GoogleSheetsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M12.33 15H3.67C3.4 15 3.15 14.89 2.96 14.71C2.77 14.52 2.67 14.27 2.67 14V2C2.67 1.73 2.77 1.48 2.96 1.29C3.15 1.11 3.4 1 3.67 1H10L13.33 4.33V14C13.33 14.27 13.23 14.52 13.04 14.71C12.85 14.89 12.6 15 12.33 15Z" fill="#43A047" />
      <path d="M13.33 4.33H10V1L13.33 4.33Z" fill="#C8E6C9" />
      <path d="M10 4.33L13.33 7.67V4.33H10Z" fill="#2E7D32" />
      <path d="M10.33 7.67H5V12.33H11V7.67H10.33ZM5.67 8.33H7V9H5.67V8.33ZM5.67 9.67H7V10.33H5.67V9.67ZM5.67 11H7V11.67H5.67V11ZM10.33 11.67H7.67V11H10.33V11.67ZM10.33 10.33H7.67V9.67H10.33V10.33ZM10.33 9H7.67V8.33H10.33V9Z" fill="#E8F5E9" />
    </svg>
  );
}

function ExcelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="4.5" y="2.13" width="10.5" height="12.25" rx="0.88" fill="#2FB776" />
      <path d="M4.5 11.31H15V13.5C15 13.98 14.61 14.38 14.13 14.38H5.38C4.89 14.38 4.5 13.98 4.5 13.5V11.31Z" fill="#1B5B38" />
      <rect x="9.75" y="8.25" width="5.25" height="3.06" fill="#229C5B" />
      <rect x="9.75" y="5.19" width="5.25" height="3.06" fill="#27AE68" />
      <path d="M4.5 3C4.5 2.52 4.89 2.13 5.38 2.13H9.75V5.19H4.5V3Z" fill="#1D854F" />
      <rect x="4.5" y="5.19" width="5.25" height="3.06" fill="#197B43" />
      <rect x="4.5" y="8.25" width="5.25" height="3.06" fill="#1B5B38" />
      <rect x="1" y="4.31" width="7.88" height="7.88" rx="0.88" fill="#176F3D" />
      <path d="M6.69 10.44L5.45 8.21L6.63 6.06H5.67L4.94 7.43L4.23 6.06H3.24L4.42 8.21L3.19 10.44H4.15L4.93 8.99L5.7 10.44H6.69Z" fill="white" />
    </svg>
  );
}

function SalesforceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M6.62 3.65C7.13 3.11 7.84 2.78 8.63 2.78C9.68 2.78 10.6 3.37 11.09 4.24C11.52 4.04 12 3.94 12.47 3.94C14.37 3.94 15.9 5.49 15.9 7.4C15.9 9.31 14.37 10.86 12.47 10.86C12.24 10.86 12.02 10.84 11.8 10.79C11.37 11.56 10.55 12.08 9.61 12.08C9.22 12.08 8.85 11.98 8.51 11.82C8.08 12.85 7.06 13.57 5.88 13.57C4.65 13.57 3.6 12.79 3.2 11.69C3.02 11.73 2.84 11.75 2.65 11.75C1.19 11.75 0 10.55 0 9.07C0 8.6 0.12 8.14 0.35 7.73C0.59 7.32 0.92 6.98 1.33 6.75C1.16 6.36 1.07 5.94 1.07 5.52C1.07 3.82 2.46 2.43 4.16 2.43C4.64 2.43 5.11 2.54 5.53 2.75C5.96 2.96 6.33 3.27 6.62 3.65Z" fill="#00A1E0" />
    </svg>
  );
}

function SmartsheetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M2.46 7.44c0 3.88-.05 7.33-.1 7.68-.05.34-.07.64-.05.67.1.09 2.56-.48 3.78-.87 2.07-.66 4.23-1.72 5.37-2.62.26-.2.51-.38.55-.38.04 0 .23.29.42.66.43.83 1.15 1.6 1.46 1.55.52-.07.52-.1.54-6.67l.03-6.05-.25.29c-.39.46-1.79 2.6-2.46 3.78-.7 1.21-2.41 4.68-2.99 6.05-.22.52-.41.85-.44.77-.03-.08-.19-.54-.36-1.02-0.87-2.55-2.25-4.64-3.02-4.64-.29 0-.05-.34.45-.63.46-.27.91-.31 1.31-.11.36.19.99.89 1.32 1.47.15.26.36.62.47.79l.19.33.64-1.25c1.05-2.02 2.45-3.98 4.12-5.74.43-.46.84-.9.91-1L14.5.15H2.46v7.29z" transform="scale(0.97)" />
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M1.5 3.5C1.5 3.5 3 2 5.5 2C8 2 8 3.5 8 3.5V13.5C8 13.5 8 12.5 5.5 12.5C3 12.5 1.5 13.5 1.5 13.5V3.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3.5C8 3.5 8 2 10.5 2C13 2 14.5 3.5 14.5 3.5V13.5C14.5 13.5 13 12.5 10.5 12.5C8 12.5 8 13.5 8 13.5V3.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type SourceItem = {
  label: string;
  icon: React.ComponentType;
  badge?: string;
};

const SOURCE_ITEMS: SourceItem[] = [
  { label: "Airtable base", icon: AirtableIcon },
  { label: "CSV file", icon: CsvIcon },
  { label: "Google Calendar", icon: GoogleCalendarIcon },
  { label: "Google Sheets", icon: GoogleSheetsIcon },
  { label: "Microsoft Excel", icon: ExcelIcon },
  { label: "Salesforce", icon: SalesforceIcon, badge: "Business" },
  { label: "Smartsheet", icon: SmartsheetIcon },
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
            className="flex items-center gap-1 rounded px-2"
            style={{
              height: "32px",
              fontSize: "13px",
              fontWeight: 400,
              color: GREEN_DUSTY,
              backgroundColor: addMenuOpen
                ? "rgba(64, 124, 74, 0.12)"
                : "transparent",
              whiteSpace: "nowrap",
            }}
            aria-expanded={addMenuOpen}
            aria-haspopup="true"
            aria-label="Add or import table"
          >
            <PlusIcon />
            <span>Add or import</span>
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
            <span className="flex-auto truncate">
              {isSeeding ? "Seeding..." : "Seed sample data"}
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
        {SOURCE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label} role="menuitem" tabIndex={-1}>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-black/5"
                style={{ color: FG_DEFAULT }}
                aria-label={item.label}
              >
                <span className="flex-none" style={{ color: FG_DEFAULT }}><Icon /></span>
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
          );
        })}
        <li role="menuitem" tabIndex={-1}>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-black/5"
            style={{ color: FG_DEFAULT }}
            aria-label="25 more sources"
          >
            <span className="flex-none" style={{ color: FG_DEFAULT }}><BookOpenIcon /></span>
            <span className="flex-auto truncate">25 more sources...</span>
            <ChevronRightIcon />
          </button>
        </li>
      </ul>
    </div>
  );
}
