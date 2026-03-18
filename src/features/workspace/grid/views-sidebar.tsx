"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { ViewItem } from "./types";

type ViewsSidebarProps = Readonly<{
  views: ViewItem[];
  selectedViewId: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectView: (view: ViewItem) => void;
  onCreateView: (type: string, name: string) => void;
  onRenameView: (viewId: string, name: string) => void;
  onDuplicateView: (view: ViewItem) => void;
  onDeleteView: (viewId: string) => void;
}>;

// ── Icons ────────────────────────────────────────────────────────────

function GridFeatureIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="2" y="2" width="12" height="12" rx="1.5" fill="none" stroke="rgb(22, 110, 225)" strokeWidth="1.2" />
      <line x1="2" y1="6" x2="14" y2="6" stroke="rgb(22, 110, 225)" strokeWidth="1.2" />
      <line x1="6" y1="6" x2="6" y2="14" stroke="rgb(22, 110, 225)" strokeWidth="1.2" />
    </svg>
  );
}

function CalendarFeatureIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="2" y="3" width="12" height="11" rx="1.5" fill="none" stroke="rgb(213, 68, 1)" strokeWidth="1.2" />
      <line x1="2" y1="7" x2="14" y2="7" stroke="rgb(213, 68, 1)" strokeWidth="1.2" />
      <line x1="5" y1="2" x2="5" y2="4" stroke="rgb(213, 68, 1)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11" y1="2" x2="11" y2="4" stroke="rgb(213, 68, 1)" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="4" y="9" width="2" height="1.5" rx="0.3" fill="rgb(213, 68, 1)" />
    </svg>
  );
}

function GalleryFeatureIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="2" y="2" width="5" height="5" rx="1" fill="none" stroke="rgb(124, 55, 239)" strokeWidth="1.2" />
      <rect x="9" y="2" width="5" height="5" rx="1" fill="none" stroke="rgb(124, 55, 239)" strokeWidth="1.2" />
      <rect x="2" y="9" width="5" height="5" rx="1" fill="none" stroke="rgb(124, 55, 239)" strokeWidth="1.2" />
      <rect x="9" y="9" width="5" height="5" rx="1" fill="none" stroke="rgb(124, 55, 239)" strokeWidth="1.2" />
    </svg>
  );
}

function KanbanFeatureIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="2" y="2" width="3.5" height="12" rx="0.8" fill="none" stroke="rgb(4, 138, 14)" strokeWidth="1.2" />
      <rect x="6.25" y="2" width="3.5" height="8" rx="0.8" fill="none" stroke="rgb(4, 138, 14)" strokeWidth="1.2" />
      <rect x="10.5" y="2" width="3.5" height="10" rx="0.8" fill="none" stroke="rgb(4, 138, 14)" strokeWidth="1.2" />
    </svg>
  );
}

function FormFeatureIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="2" y="2" width="12" height="12" rx="1.5" fill="none" stroke="rgb(221, 4, 168)" strokeWidth="1.2" />
      <line x1="5" y1="5.5" x2="11" y2="5.5" stroke="rgb(221, 4, 168)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="8" x2="11" y2="8" stroke="rgb(221, 4, 168)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="10.5" x2="9" y2="10.5" stroke="rgb(221, 4, 168)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function TimelineFeatureIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M2 4h12v8H2z" fill="none" stroke="rgb(220, 4, 59)" strokeWidth="1.2" />
      <path d="M2 8h12M6 4v8M10 4v8" stroke="rgb(220, 4, 59)" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

function ListFeatureIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="2" y="2" width="12" height="12" rx="1.5" fill="none" stroke="rgb(13, 82, 172)" strokeWidth="1.2" />
      <line x1="5" y1="5.5" x2="11" y2="5.5" stroke="rgb(13, 82, 172)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="8" x2="11" y2="8" stroke="rgb(13, 82, 172)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="10.5" x2="11" y2="10.5" stroke="rgb(13, 82, 172)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="3.5" cy="5.5" r="0.6" fill="rgb(13, 82, 172)" />
      <circle cx="3.5" cy="8" r="0.6" fill="rgb(13, 82, 172)" />
      <circle cx="3.5" cy="10.5" r="0.6" fill="rgb(13, 82, 172)" />
    </svg>
  );
}

function GanttFeatureIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="3" y="3" width="7" height="2.5" rx="0.8" fill="none" stroke="rgb(13, 127, 120)" strokeWidth="1.2" />
      <rect x="5" y="6.75" width="8" height="2.5" rx="0.8" fill="none" stroke="rgb(13, 127, 120)" strokeWidth="1.2" />
      <rect x="4" y="10.5" width="6" height="2.5" rx="0.8" fill="none" stroke="rgb(13, 127, 120)" strokeWidth="1.2" />
    </svg>
  );
}

function UsersThreeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <circle cx="8" cy="5" r="2" />
      <path d="M4.5 13c0-2 1.6-3.5 3.5-3.5s3.5 1.5 3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="3.5" cy="6.5" r="1.5" />
      <path d="M1 12.5c0-1.5 1.1-2.5 2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="12.5" cy="6.5" r="1.5" />
      <path d="M15 12.5c0-1.5-1.1-2.5-2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <circle cx="8" cy="5" r="2.5" />
      <path d="M4 14c0-2.2 1.8-4 4-4s4 1.8 4 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="4" y="7" width="8" height="6" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 7V5a2 2 0 1 1 4 0v2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ── View type options ────────────────────────────────────────────────

const VIEW_TYPE_OPTIONS: { id: string; label: string; type: string; icon: React.ReactNode }[] = [
  { id: "grid", label: "Grid", type: "GRID", icon: <GridFeatureIcon /> },
  { id: "calendar", label: "Calendar", type: "CALENDAR", icon: <CalendarFeatureIcon /> },
  { id: "gallery", label: "Gallery", type: "GALLERY", icon: <GalleryFeatureIcon /> },
  { id: "kanban", label: "Kanban", type: "KANBAN", icon: <KanbanFeatureIcon /> },
  { id: "timeline", label: "Timeline", type: "GRID", icon: <TimelineFeatureIcon /> },
  { id: "list", label: "List", type: "GRID", icon: <ListFeatureIcon /> },
  { id: "gantt", label: "Gantt", type: "GRID", icon: <GanttFeatureIcon /> },
];

const FORM_OPTION = { id: "form", label: "Form", type: "FORM", icon: <FormFeatureIcon /> };

const ALL_OPTIONS = [...VIEW_TYPE_OPTIONS, FORM_OPTION];

// ── Permission descriptions ──────────────────────────────────────────

const PERMISSION_OPTIONS = [
  { id: "collaborative", label: "Collaborative", icon: <UsersThreeIcon />, description: "All collaborators can edit the configuration" },
  { id: "personal", label: "Personal", icon: <UserIcon />, description: "Only you can edit the configuration" },
  { id: "locked", label: "Locked", icon: <LockIcon />, description: "No one can edit the configuration" },
] as const;

// ── Shared icons ─────────────────────────────────────────────────────

function viewIcon(type: string) {
  return type === "TIMELINE" ? <TimelineFeatureIcon /> : <GridFeatureIcon />;
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M8 3a.5.5 0 0 1 .5.5V7.5H12a.5.5 0 0 1 0 1H8.5v4a.5.5 0 0 1-1 0V8.5H4a.5.5 0 0 1 0-1h3.5V3.5A.5.5 0 0 1 8 3Z" />
    </svg>
  );
}

function MagnifyingGlassIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M11.27 10.21a6 6 0 1 0-1.06 1.06l3.26 3.26a.75.75 0 1 0 1.06-1.06l-3.26-3.26ZM7 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6.32-2.9-.9-.37a5.17 5.17 0 0 0-.3-.73l.37-.9a.5.5 0 0 0-.1-.54l-.85-.85a.5.5 0 0 0-.54-.1l-.9.37a5.17 5.17 0 0 0-.73-.3l-.37-.9A.5.5 0 0 0 9.52 3h-1.2a.5.5 0 0 0-.48.36l-.37.9a5.17 5.17 0 0 0-.73.3l-.9-.37a.5.5 0 0 0-.54.1l-.85.85a.5.5 0 0 0-.1.54l.37.9c-.12.23-.22.48-.3.73l-.9.37A.5.5 0 0 0 3 8.38v1.2a.5.5 0 0 0 .36.48l.9.37c.08.25.18.5.3.73l-.37.9a.5.5 0 0 0 .1.54l.85.85a.5.5 0 0 0 .54.1l.9-.37c.23.12.48.22.73.3l.37.9a.5.5 0 0 0 .48.36h1.2a.5.5 0 0 0 .48-.36l.37-.9c.25-.08.5-.18.73-.3l.9.37a.5.5 0 0 0 .54-.1l.85-.85a.5.5 0 0 0 .1-.54l-.37-.9c.12-.23.22-.48.3-.73l.9-.37A.5.5 0 0 0 13 9.52v-1.2a.5.5 0 0 0-.36-.48l-.32.16Z" />
    </svg>
  );
}

function OverflowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none text-[rgb(97,102,112)]" style={{ shapeRendering: "geometricPrecision" }}>
      <circle cx="4" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="12" cy="8" r="1.25" fill="currentColor" />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <circle cx="6" cy="4" r="1" />
      <circle cx="10" cy="4" r="1" />
      <circle cx="6" cy="8" r="1" />
      <circle cx="10" cy="8" r="1" />
      <circle cx="6" cy="12" r="1" />
      <circle cx="10" cy="12" r="1" />
    </svg>
  );
}

// ── Shared portal styles ─────────────────────────────────────────────

const FONT_FAMILY =
  "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif";

const POPOVER_SHADOW = "0 0 0 1px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)";

// ── useClickOutside hook ─────────────────────────────────────────────

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
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
  }, [ref, onClose]);
}

// ── Step 2: Configure View Dialog ────────────────────────────────────

function ConfigureViewDialog({
  anchorRect,
  defaultName,
  viewType: _viewType,
  onConfirm,
  onCancel,
}: {
  anchorRect: DOMRect;
  defaultName: string;
  viewType: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}) {
  const [viewName, setViewName] = useState(defaultName);
  const [permission, setPermission] = useState<"collaborative" | "personal" | "locked">("collaborative");
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside(dialogRef, onCancel);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  const selectedDescription = PERMISSION_OPTIONS.find((p) => p.id === permission)?.description ?? "";

  return createPortal(
    <div
      ref={dialogRef}
      style={{
        position: "fixed",
        top: anchorRect.bottom + 4,
        left: anchorRect.left,
        width: 400,
        zIndex: 50,
        borderRadius: 8,
        backgroundColor: "white",
        boxShadow: POPOVER_SHADOW,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div className="p-4">
        {/* Name input */}
        <div className="flex w-full flex-col pt-1">
          <input
            ref={inputRef}
            aria-label="Update view name"
            type="text"
            maxLength={256}
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && viewName.trim()) {
                onConfirm(viewName.trim());
              }
            }}
            className="w-full rounded-lg border border-black/15 px-3 py-2 text-[15px] font-semibold text-[rgb(29,31,37)] outline-none focus:border-[rgb(22,110,225)] focus:ring-1 focus:ring-[rgb(22,110,225)]"
            style={{ lineHeight: "1.5" }}
          />
          <div className="my-1 pl-1" style={{ minHeight: 18 }} />
        </div>

        {/* Who can edit */}
        <div className="pb-1 text-[15px] font-semibold text-[rgb(29,31,37)]">Who can edit</div>

        <div className="pb-1">
          {/* Radio group */}
          <div className="flex items-center" role="radiogroup">
            {PERMISSION_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={permission === opt.id}
                className="mr-4 flex cursor-pointer items-center"
                onClick={() => setPermission(opt.id)}
              >
                {/* Radio circle */}
                <span
                  className="flex flex-none items-center justify-center rounded-full border-2"
                  style={{
                    width: 16,
                    height: 16,
                    borderColor: permission === opt.id ? "rgb(22, 110, 225)" : "rgb(174, 178, 186)",
                    backgroundColor: "white",
                  }}
                >
                  {permission === opt.id && (
                    <span
                      className="rounded-full"
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor: "rgb(22, 110, 225)",
                      }}
                    />
                  )}
                </span>
                <span className="mx-1 flex-none">{opt.icon}</span>
                <span className="mr-1 text-[13px] text-[rgb(29,31,37)]">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="mt-2 text-[12px] text-[rgb(97,102,112)]">{selectedDescription}</div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="mr-2 rounded-lg px-3 py-1.5 text-[13px] font-medium text-[rgb(29,31,37)] hover:bg-[rgb(241,243,246)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!viewName.trim()}
            onClick={() => onConfirm(viewName.trim())}
            className="rounded-lg px-4 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "rgb(22, 110, 225)" }}
          >
            Create new view
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Step 1: View Type Picker Menu ────────────────────────────────────

function CreateViewMenu({
  anchorRect,
  onSelect,
  onClose,
}: {
  anchorRect: DOMRect;
  onSelect: (typeId: string, type: string) => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, onClose);

  return createPortal(
    <div
      ref={menuRef}
      className="overflow-y-auto"
      style={{
        position: "fixed",
        top: anchorRect.bottom + 4,
        left: anchorRect.left,
        width: 240,
        zIndex: 50,
        maxHeight: 630,
        borderRadius: 8,
        backgroundColor: "white",
        boxShadow: POPOVER_SHADOW,
        fontFamily: FONT_FAMILY,
      }}
    >
      <ul role="menu" aria-label="Create new..." className="p-1.5">
        {VIEW_TYPE_OPTIONS.map((opt) => (
          <li
            key={opt.id}
            role="menuitem"
            tabIndex={-1}
            className="flex w-full cursor-pointer items-center rounded px-2 py-1.5 hover:bg-[rgb(241,243,246)]"
            style={{ fontSize: 13, color: "rgb(29, 31, 37)" }}
            onClick={() => onSelect(opt.id, opt.type)}
          >
            <span className="mr-2 flex-none">{opt.icon}</span>
            <span className="flex-auto truncate select-none">{opt.label}</span>
          </li>
        ))}

        <li role="presentation" className="mx-1 my-1" style={{ height: 1, backgroundColor: "rgb(229, 233, 240)" }} />

        <li
          role="menuitem"
          tabIndex={-1}
          className="flex w-full cursor-pointer items-center rounded px-2 py-1.5 hover:bg-[rgb(241,243,246)]"
          style={{ fontSize: 13, color: "rgb(29, 31, 37)" }}
          onClick={() => onSelect(FORM_OPTION.id, FORM_OPTION.type)}
        >
          <span className="mr-2 flex-none">{FORM_OPTION.icon}</span>
          <span className="flex-auto truncate select-none">{FORM_OPTION.label}</span>
        </li>
      </ul>
    </div>,
    document.body,
  );
}

// ── Context menu icons ───────────────────────────────────────────────

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 10.67l-3.52 1.68.67-3.93L2.3 5.64l3.94-.57L8 1.5z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
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

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none" style={{ shapeRendering: "geometricPrecision" }}>
      <rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11 3H4.5A1.5 1.5 0 0 0 3 4.5V11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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

// ── View Context Menu ────────────────────────────────────────────────

function ViewContextMenu({
  anchorRect,
  view,
  canDelete,
  onRename,
  onDuplicate,
  onDelete,
  onClose,
}: {
  anchorRect: DOMRect;
  view: ViewItem;
  canDelete: boolean;
  onRename: (view: ViewItem) => void;
  onDuplicate: (view: ViewItem) => void;
  onDelete: (viewId: string) => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, onClose);

  return createPortal(
    <div
      ref={menuRef}
      role="dialog"
      tabIndex={-1}
      style={{
        position: "fixed",
        top: anchorRect.bottom + 4,
        left: anchorRect.left,
        width: 280,
        zIndex: 50,
        borderRadius: 12,
        backgroundColor: "white",
        boxShadow: POPOVER_SHADOW,
        fontFamily: FONT_FAMILY,
        overflow: "hidden",
      }}
    >
      <ul role="menu" tabIndex={-1} className="p-1.5">
        {/* Add to favorites */}
        <li
          role="menuitem"
          tabIndex={-1}
          className="flex w-full cursor-pointer items-center rounded py-1.5 px-2 hover:bg-[rgb(241,243,246)]"
          style={{ fontSize: 13, color: "rgb(29, 31, 37)" }}
          onClick={() => {
            onClose();
          }}
        >
          <span className="mr-2 flex-none text-[rgb(29,31,37)]"><StarIcon /></span>
          <span className="flex-auto truncate select-none">Add to &apos;My favorites&apos;</span>
        </li>

        {/* Separator */}
        <li role="presentation" className="mx-2 my-1" style={{ height: 1, backgroundColor: "rgb(229, 233, 240)" }} />

        {/* Rename */}
        <li
          role="menuitem"
          tabIndex={-1}
          className="flex w-full cursor-pointer items-center rounded py-1.5 px-2 hover:bg-[rgb(241,243,246)]"
          style={{ fontSize: 13, color: "rgb(29, 31, 37)" }}
          onClick={() => {
            onRename(view);
            onClose();
          }}
        >
          <span className="mr-2 flex-none text-[rgb(29,31,37)]"><PencilIcon /></span>
          <span className="flex-auto truncate select-none">Rename view</span>
        </li>

        {/* Duplicate */}
        <li
          role="menuitem"
          tabIndex={-1}
          className="flex w-full cursor-pointer items-center rounded py-1.5 px-2 hover:bg-[rgb(241,243,246)]"
          style={{ fontSize: 13, color: "rgb(29, 31, 37)" }}
          onClick={() => {
            onDuplicate(view);
            onClose();
          }}
        >
          <span className="mr-2 flex-none text-[rgb(29,31,37)]"><CopyIcon /></span>
          <span className="flex-auto truncate select-none">Duplicate view</span>
        </li>

        {/* Delete */}
        <li
          role="menuitem"
          tabIndex={-1}
          className={`flex w-full items-center rounded py-1.5 px-2 ${canDelete ? "cursor-pointer hover:bg-[rgb(241,243,246)]" : "opacity-50 cursor-not-allowed"}`}
          style={{ fontSize: 13, color: canDelete ? "rgb(200, 50, 50)" : "rgb(200, 130, 130)" }}
          aria-disabled={!canDelete}
          onClick={() => {
            if (!canDelete) return;
            onDelete(view.id);
            onClose();
          }}
        >
          <span className="mr-2 flex-none"><TrashIcon /></span>
          <span className="flex-auto truncate select-none">Delete view</span>
        </li>
      </ul>
    </div>,
    document.body,
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 280;

export function ViewsSidebar({
  views,
  selectedViewId,
  isCollapsed,
  onToggleCollapse: _onToggleCollapse,
  onSelectView,
  onCreateView,
  onRenameView,
  onDuplicateView,
  onDeleteView,
}: ViewsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [configState, setConfigState] = useState<{ typeId: string; type: string } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [contextMenu, setContextMenu] = useState<{ view: ViewItem; rect: DOMRect } | null>(null);
  const [renamingViewId, setRenamingViewId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const filteredViews = searchQuery
    ? views.filter((v) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : views;

  const generateDefaultName = useCallback(
    (typeId: string) => {
      const option = ALL_OPTIONS.find((o) => o.id === typeId);
      const label = option?.label ?? "View";
      const existingCount = views.filter((v) =>
        v.name.toLowerCase().startsWith(label.toLowerCase()),
      ).length;
      return existingCount > 0 ? `${label} ${existingCount + 1}` : label;
    },
    [views],
  );

  const handleTypeSelect = useCallback(
    (typeId: string, type: string) => {
      setMenuOpen(false);
      setConfigState({ typeId, type });
    },
    [],
  );

  const handleConfirmCreate = useCallback(
    (name: string) => {
      if (!configState) return;
      onCreateView(configState.type, name);
      setConfigState(null);
    },
    [configState, onCreateView],
  );

  const handleCancel = useCallback(() => {
    setConfigState(null);
  }, []);

  return (
    <nav
      className={`relative z-10 shrink-0 overflow-hidden bg-white ${isCollapsed ? "" : "border-r border-black/10"}`}
      style={{
        width: isCollapsed ? 0 : SIDEBAR_WIDTH,
        minWidth: isCollapsed ? 0 : SIDEBAR_WIDTH,
        transition: "width 200ms ease-in-out, min-width 200ms ease-in-out",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        className="flex h-full flex-col"
        style={{ width: SIDEBAR_WIDTH, padding: "8px 8px 8px 12px" }}
      >
        {/* Create new... button */}
        <div className="shrink-0 pb-2">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex w-full items-center rounded-lg bg-transparent px-3 text-left hover:bg-[rgb(229,233,240)]"
            style={{
              height: 32,
              fontSize: 13,
              color: "rgb(29, 31, 37)",
              justifyContent: "flex-start",
            }}
          >
            <span className="mr-2">
              <PlusIcon />
            </span>
            <span className="truncate select-none">Create new...</span>
          </button>

          {/* Step 1: Type picker */}
          {menuOpen && buttonRef.current && (
            <CreateViewMenu
              anchorRect={buttonRef.current.getBoundingClientRect()}
              onSelect={handleTypeSelect}
              onClose={() => setMenuOpen(false)}
            />
          )}

          {/* Step 2: Configure view dialog */}
          {configState && buttonRef.current && (
            <ConfigureViewDialog
              anchorRect={buttonRef.current.getBoundingClientRect()}
              defaultName={generateDefaultName(configState.typeId)}
              viewType={configState.type}
              onConfirm={handleConfirmCreate}
              onCancel={handleCancel}
            />
          )}

          {/* Search input */}
          <div className="relative mt-1">
            <div className="relative flex w-full items-center">
              <input
                type="text"
                className="h-7 w-full rounded bg-white pl-7 pr-8 text-[13px] outline-none focus:ring-1 focus:ring-[rgb(22,110,225)]"
                placeholder="Find a view"
                aria-label="Find a view"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-2 text-[rgb(97,102,112)]">
                <MagnifyingGlassIcon />
              </span>
              <span className="absolute right-1 flex items-center text-[rgb(97,102,112)]">
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded hover:bg-[rgb(229,233,240)]"
                >
                  <CogIcon />
                </button>
              </span>
            </div>
          </div>
        </div>

        {/* View list */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <ul>
            {filteredViews.map((view) => {
              const isActive = selectedViewId === view.id;
              const isRenaming = renamingViewId === view.id;
              return (
                <li key={view.id}>
                  <button
                    type="button"
                    className="group flex w-full cursor-pointer flex-col justify-center rounded px-3 py-2 text-left"
                    style={{
                      backgroundColor: isActive
                        ? "rgb(229, 233, 240)"
                        : undefined,
                    }}
                    onClick={() => {
                      if (!isRenaming) onSelectView(view);
                    }}
                  >
                    <div className="flex items-center">
                      <div className="flex flex-1 items-center min-w-0">
                        <span className="mr-2 flex shrink-0 items-center">
                          {viewIcon(view.type)}
                        </span>
                        {isRenaming ? (
                          <input
                            type="text"
                            autoFocus
                            className="w-full rounded border border-[rgb(22,110,225)] px-1 py-0 text-[13px] font-semibold text-[rgb(29,31,37)] outline-none"
                            style={{ lineHeight: "18px" }}
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && renameValue.trim()) {
                                onRenameView(view.id, renameValue.trim());
                                setRenamingViewId(null);
                              }
                              if (e.key === "Escape") {
                                setRenamingViewId(null);
                              }
                            }}
                            onBlur={() => {
                              if (renameValue.trim() && renameValue.trim() !== view.name) {
                                onRenameView(view.id, renameValue.trim());
                              }
                              setRenamingViewId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className="truncate"
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              lineHeight: "18px",
                              color: "rgb(29, 31, 37)",
                            }}
                          >
                            {view.name}
                          </span>
                        )}
                      </div>
                      <span className={`flex items-center gap-0.5 ${isActive ? "visible" : "invisible group-hover:visible"}`}>
                        <span
                          className="flex items-center justify-center rounded hover:bg-black/10 cursor-pointer"
                          style={{ width: 20, height: 20 }}
                          aria-label="View options"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setContextMenu({ view, rect });
                          }}
                        >
                          <OverflowIcon />
                        </span>
                        <span className="flex items-center text-[rgb(174,178,186)]">
                          <DragHandleIcon />
                        </span>
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* View context menu */}
        {contextMenu && (
          <ViewContextMenu
            anchorRect={contextMenu.rect}
            view={contextMenu.view}
            canDelete={views.length > 1}
            onRename={(v) => {
              setRenameValue(v.name);
              setRenamingViewId(v.id);
            }}
            onDuplicate={(v) => onDuplicateView(v)}
            onDelete={(id) => onDeleteView(id)}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 top-0 cursor-col-resize bg-transparent hover:bg-[rgb(22,110,225)]"
        style={{ width: 3 }}
      />
    </nav>
  );
}
