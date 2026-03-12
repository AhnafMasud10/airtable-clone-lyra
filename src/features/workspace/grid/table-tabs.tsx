"use client";

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

const GREEN_LIGHT3 = "rgb(230, 252, 232)";
const GREEN_DUSTY = "rgb(64, 124, 74)";

export function TableTabs({
  tables,
  selectedTableId,
  onSelectTable,
  onAddTable,
  onBulkInsert,
  isBulkInserting,
}: TableTabsProps) {
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
                    backgroundColor: isActive ? "white" : "transparent",
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
                      color: isActive ? "rgb(29, 31, 37)" : GREEN_DUSTY,
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
                        color: "rgb(97, 102, 112)",
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
        >
          <ChevronDownIcon />
        </button>

        {/* Add or import */}
        <button
          type="button"
          onClick={onAddTable}
          className="flex flex-none items-center gap-1"
          style={{
            height: "32px",
            padding: "0 12px",
            fontSize: "13px",
            fontWeight: 400,
            color: GREEN_DUSTY,
            borderRadius: "3px",
          }}
        >
          <PlusIcon />
          <span>Add or import</span>
        </button>
      </div>

      {/* Right side */}
      <div
        className="flex flex-none items-center gap-1 pr-2"
        style={{ height: "32px" }}
      >
        <button
          type="button"
          disabled={!selectedTableId || isBulkInserting}
          onClick={onBulkInsert}
          className="flex items-center disabled:opacity-50"
          style={{
            height: "28px",
            padding: "0 8px",
            fontSize: "11px",
            fontWeight: 400,
            color: GREEN_DUSTY,
            borderRadius: "3px",
          }}
        >
          {isBulkInserting ? "Adding..." : "+ 100k rows"}
        </button>
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
