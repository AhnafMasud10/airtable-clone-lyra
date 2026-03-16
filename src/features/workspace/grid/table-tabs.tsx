"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TableSummary } from "./types";

type TableTabsProps = Readonly<{
  tables: TableSummary[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
  onAddTable: () => void;
  onBulkInsert: () => void;
  isBulkInserting: boolean;
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
const LIGHT_BASE = "rgb(236, 239, 244)";
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
  onAddTable,
  onBulkInsert,
  isBulkInserting,
}: TableTabsProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

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
          paddingLeft: "2px",
          clipPath: "inset(-3px 0px 0px)",
        }}
      >
        <nav className="flex flex-none" style={{ height: "32px" }}>
          {tables.map((tableItem) => {
            const isActive = selectedTableId === tableItem.id;
            return (
              <div
                key={tableItem.id}
                className="flex"
                style={{ height: "32px" }}
              >
                <div
                  className="flex flex-none items-center"
                  style={{
                    borderRadius: isActive ? "3px 3px 0 0" : "0 3px 0 0",
                    backgroundColor: isActive ? "white" : LIGHT_BASE,
                    boxShadow: isActive ? SHADOW_LOW : "none",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onSelectTable(tableItem.id)}
                    className="flex h-full items-center"
                    style={{
                      paddingLeft: "12px",
                      paddingRight: isActive ? "8px" : "12px",
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? FG_DEFAULT : GREEN_DUSTY,
                    }}
                  >
                    <span className="truncate">{tableItem.name}</span>
                  </button>
                  {isActive ? (
                    <button
                      type="button"
                      className="flex items-center"
                      style={{
                        paddingRight: "12px",
                        color: FG_SUBTLE,
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
            className="flex items-center gap-1 rounded px-1.5"
            style={{
              height: "32px",
              fontSize: "13px",
              fontWeight: 400,
              color: GREEN_DUSTY,
              backgroundColor: addMenuOpen ? "rgba(64, 124, 74, 0.12)" : "transparent",
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
                onClose={closeMenu}
                addButtonRef={addButtonRef}
              />,
              document.body,
            )}
        </div>
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
  onClose: () => void;
  addButtonRef: React.RefObject<HTMLButtonElement | null>;
}>;

function AddOrImportMenu({
  onStartFromScratch,
  onClose,
  addButtonRef,
}: AddOrImportMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const btn = addButtonRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
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

  return (
    <div
      ref={menuRef}
      role="dialog"
      tabIndex={-1}
      className="fixed z-[9999] rounded-lg bg-white p-1"
      style={{
        top: position.top,
        left: position.left,
        width: "280px",
        minWidth: "280px",
        maxHeight: "min(679px, calc(100vh - 100px))",
        overflowY: "auto",
        boxShadow: SHADOW_MENU,
      }}
    >
      <ul role="menu" tabIndex={-1} className="list-none p-0 m-0">
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
            onClick={onStartFromScratch}
            className="flex w-full items-center rounded px-2 py-1.5 text-left text-sm hover:bg-black/5"
            style={{ color: FG_DEFAULT }}
            aria-label="Start from scratch"
          >
            <span className="truncate flex-auto">Start from scratch</span>
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
            <span className="truncate flex-auto">New table</span>
          </button>
        </li>
        <li role="menuitem" tabIndex={-1}>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-black/5"
            style={{ color: FG_DEFAULT }}
          >
            <span className="truncate flex-auto">New table with web data</span>
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
              <span className="truncate flex-auto">{item.label}</span>
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
            <span className="truncate flex-auto">26 more sources...</span>
            <ChevronRightIcon />
          </button>
        </li>
      </ul>
    </div>
  );
}
