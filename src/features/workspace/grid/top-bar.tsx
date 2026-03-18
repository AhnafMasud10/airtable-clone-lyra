"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

type TopBarProps = Readonly<{
  baseName: string;
  onRenameBase: (name: string) => void;
}>;

function AirtableLogoIcon() {
  return (
    <svg
      width="24"
      height="20.4"
      viewBox="0 0 200 170"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <g>
        <path
          fill="hsla(0, 0%, 100%, 0.95)"
          d="M90.0389,12.3675 L24.0799,39.6605 C20.4119,41.1785 20.4499,46.3885 24.1409,47.8515 L90.3759,74.1175 C96.1959,76.4255 102.6769,76.4255 108.4959,74.1175 L174.7319,47.8515 C178.4219,46.3885 178.4609,41.1785 174.7919,39.6605 L108.8339,12.3675 C102.8159,9.8775 96.0559,9.8775 90.0389,12.3675"
        />
        <path
          fill="hsla(0, 0%, 100%, 0.95)"
          d="M105.3122,88.4608 L105.3122,154.0768 C105.3122,157.1978 108.4592,159.3348 111.3602,158.1848 L185.1662,129.5368 C186.8512,128.8688 187.9562,127.2408 187.9562,125.4288 L187.9562,59.8128 C187.9562,56.6918 184.8092,54.5548 181.9082,55.7048 L108.1022,84.3528 C106.4182,85.0208 105.3122,86.6488 105.3122,88.4608"
        />
        <path
          fill="hsla(0, 0%, 100%, 0.95)"
          d="M88.0781,91.8464 L66.1741,102.4224 L63.9501,103.4974 L17.7121,125.6524 C14.7811,127.0664 11.0401,124.9304 11.0401,121.6744 L11.0401,60.0884 C11.0401,58.9104 11.6441,57.8934 12.4541,57.1274 C12.7921,56.7884 13.1751,56.5094 13.5731,56.2884 C14.6781,55.6254 16.2541,55.4484 17.5941,55.9784 L87.7101,83.7594 C91.2741,85.1734 91.5541,90.1674 88.0781,91.8464"
        />
      </g>
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision", marginLeft: "4px" }}
    >
      <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function ClockCounterClockwiseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M2.5 1.75a.75.75 0 0 0-1.5 0v4a.75.75 0 0 0 .75.75h4a.75.75 0 0 0 0-1.5H3.37A5.5 5.5 0 1 1 2.5 8a.75.75 0 0 0-1.5 0 7 7 0 1 0 1.404-4.2L2.5 3.5V1.75Z" />
      <path d="M8.25 4.5a.75.75 0 0 0-1.5 0V8a.75.75 0 0 0 .3.6l2.5 1.875a.75.75 0 0 0 .9-1.2L8.25 7.65V4.5Z" />
    </svg>
  );
}

function SidebarPlayIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9ZM3.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5H6V3H3.5ZM7 3v10h5.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5H7Z" />
      <path d="M9.25 6.53a.5.5 0 0 1 .5 0l1.5.87a.5.5 0 0 1 0 .866l-1.5.866a.5.5 0 0 1-.75-.433V6.964a.5.5 0 0 1 .25-.433Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25Z" />
      <path d="M8.225 12.725a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 1 1-2.83-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25Z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: "Data", active: true },
  { label: "Automations", active: false },
  { label: "Interfaces", active: false },
  { label: "Forms", active: false },
] as const;

const SHADOW_LOW =
  "0px 0px 1px rgba(0,0,0,0.32), 0px 0px 2px rgba(0,0,0,0.08), 0px 1px 3px rgba(0,0,0,0.08)";
const SHADOW_LOW_HOVER =
  "0px 0px 1px rgba(0,0,0,0.32), 0px 0px 3px rgba(0,0,0,0.11), 0px 1px 4px rgba(0,0,0,0.12)";

const FONT_BODY =
  "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";
const FONT_HEADING =
  "'Inter Display', -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";

const FG_DEFAULT = "rgb(29, 31, 37)";
const FG_SUBTLE = "rgb(97, 102, 112)";
const GREEN_DUSTY = "rgb(64, 124, 74)";
const BORDER_DEFAULT = "rgba(0, 0, 0, 0.1)";
const DARKEN1 = "rgba(0, 0, 0, 0.05)";

export function TopBar({ baseName, onRenameBase }: TopBarProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const nameButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <header
      className="relative shrink-0"
      style={{
        backgroundColor: "white",
        borderBottom: `1px solid ${BORDER_DEFAULT}`,
        fontFamily: FONT_BODY,
        fontSize: "13px",
        lineHeight: "18px",
        color: FG_DEFAULT,
        fontWeight: 400,
        boxSizing: "border-box",
      }}
    >
      {/* 3-column grid: left / center / right */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          height: "100%",
          minWidth: "600px",
          gap: "8px",
        }}
      >
        {/* Left: icon + base name */}
        <div
          className="flex items-center overflow-hidden"
          style={{ paddingLeft: "16px" }}
        >
          <div
            className="flex w-full flex-none items-center justify-start"
            style={{ gap: "8px" }}
          >
            {/* Base icon */}
            <div
              className="flex shrink-0 items-center justify-center"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: `1px solid ${BORDER_DEFAULT}`,
                backgroundColor: GREEN_DUSTY,
              }}
            >
              <div style={{ position: "relative", top: "2px" }}>
                <AirtableLogoIcon />
              </div>
            </div>

            {/* Base name + chevron */}
            <div
              className="flex min-w-0 items-center"
              style={{ maxWidth: "480px" }}
            >
              <button
                ref={nameButtonRef}
                type="button"
                className="flex items-center rounded"
                style={{
                  minWidth: 0,
                  flex: "0 1 auto",
                  lineHeight: "18px",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
                onClick={() => setPopupOpen((o) => !o)}
              >
                <div
                  className="truncate"
                  style={{
                    fontFamily: FONT_HEADING,
                    fontSize: "17px",
                    fontWeight: 800,
                    lineHeight: "24px",
                    minWidth: 0,
                    flex: "0 1 auto",
                    color: FG_DEFAULT,
                  }}
                >
                  {baseName}
                </div>
                <ChevronDownIcon />
              </button>

              {popupOpen &&
                nameButtonRef.current &&
                createPortal(
                  <BaseSettingsPopup
                    baseName={baseName}
                    anchorRect={nameButtonRef.current.getBoundingClientRect()}
                    onRename={(name) => {
                      onRenameBase(name);
                    }}
                    onClose={() => setPopupOpen(false)}
                  />,
                  document.body,
                )}
            </div>
          </div>
        </div>

        {/* Center: nav items */}
        <ul
          className="relative flex items-stretch justify-center"
          style={{
            gap: "16px",
            padding: "0 8px",
            margin: 0,
            listStyle: "none",
            backgroundColor: "white",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className="relative flex items-center"
                style={{
                  height: "100%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <p
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "13px",
                    lineHeight: "24px",
                    fontWeight: 600,
                    padding: "16px 0",
                    margin: 0,
                    color: item.active ? FG_DEFAULT : FG_SUBTLE,
                  }}
                >
                  {item.label}
                </p>
                {item.active ? (
                  <div
                    className="absolute right-0 left-0"
                    style={{
                      bottom: "-1px",
                      height: "2px",
                      backgroundColor: GREEN_DUSTY,
                    }}
                  />
                ) : null}
              </button>
            </li>
          ))}
        </ul>

        {/* Right: actions */}
        <div
          className="flex items-center justify-end"
          style={{ paddingRight: "16px" }}
        >
          <div className="inline-flex items-center" style={{ gap: "8px" }}>
            <div className="flex flex-none items-center" style={{ gap: "8px" }}>
              {/* History (ClockCounterClockwise) */}
              <button
                type="button"
                className="flex items-center justify-center rounded-full"
                style={{
                  width: "28px",
                  height: "28px",
                  color: FG_SUBTLE,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <ClockCounterClockwiseIcon />
              </button>

              {/* Trial pill */}
              <button
                type="button"
                className="flex items-baseline justify-center"
                style={{
                  borderRadius: "100px",
                  padding: "0 12px",
                  margin: "0 8px",
                  fontSize: "13px",
                  lineHeight: "18px",
                  fontWeight: 400,
                  color: FG_DEFAULT,
                  backgroundColor: DARKEN1,
                  whiteSpace: "nowrap",
                  border: "none",
                  cursor: "pointer",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Trial: 12 days left
              </button>

              {/* Launch (icon only) */}
              <button
                type="button"
                className="inline-flex items-center justify-center"
                style={{
                  borderRadius: "6px",
                  padding: "0 8px",
                  fontSize: "13px",
                  color: FG_DEFAULT,
                  backgroundColor: "white",
                  boxShadow: SHADOW_LOW,
                  border: "none",
                  cursor: "pointer",
                  height: "28px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = SHADOW_LOW_HOVER;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = SHADOW_LOW;
                }}
              >
                <SidebarPlayIcon />
              </button>

              {/* Copy link */}
              <button
                type="button"
                className="flex items-center justify-center"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  color: FG_DEFAULT,
                  backgroundColor: "white",
                  boxShadow: SHADOW_LOW,
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = SHADOW_LOW_HOVER;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = SHADOW_LOW;
                }}
              >
                <LinkIcon />
              </button>

              {/* Share — green bg, "Share" text */}
              <button
                type="button"
                data-tutorial-selector-id="applicationShareButton"
                aria-label="Share"
                className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
                style={{
                  height: "28px",
                  borderRadius: "6px",
                  padding: "0 8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  lineHeight: "24px",
                  color: "white",
                  backgroundColor: GREEN_DUSTY,
                  boxShadow: SHADOW_LOW,
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = SHADOW_LOW_HOVER;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = SHADOW_LOW;
                }}
              >
                <span className="truncate">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Icons for popup ──────────────────────────────────────────────────

function StarOutlineIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path
        d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 10.67l-3.52 1.68.67-3.93L2.3 5.64l3.94-.57L8 1.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OverflowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <circle cx="4" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="12" cy="8" r="1.25" fill="currentColor" />
    </svg>
  );
}

function PopupChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{
        shapeRendering: "geometricPrecision",
        transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
        transition: "transform 150ms ease",
      }}
    >
      <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

// ── Base Settings Popup ──────────────────────────────────────────────

const POPUP_SHADOW = "0 0 0 1px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)";

function BaseSettingsPopup({
  baseName,
  anchorRect,
  onRename,
  onClose,
}: {
  baseName: string;
  anchorRect: DOMRect;
  onRename: (name: string) => void;
  onClose: () => void;
}) {
  const [nameValue, setNameValue] = useState(baseName);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameValue(baseName);
  }, [baseName]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
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

  const commitRename = useCallback(() => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== baseName) {
      onRename(trimmed);
    }
  }, [nameValue, baseName, onRename]);

  return (
    <div
      ref={popupRef}
      role="menu"
      tabIndex={-1}
      data-popup
      aria-label="Base settings menu"
      style={{
        position: "fixed",
        top: anchorRect.bottom + 8,
        left: anchorRect.left,
        width: 400,
        zIndex: 50,
        borderRadius: 12,
        backgroundColor: "white",
        boxShadow: POPUP_SHADOW,
        fontFamily: FONT_BODY,
        maxHeight: "calc(100vh - 100px)",
        overflowY: "auto",
        padding: "12px",
      }}
    >
      {/* Name input row */}
      <div
        className="flex w-full items-center pb-3"
        style={{ borderBottom: `1px solid ${BORDER_DEFAULT}` }}
      >
        <input
          ref={inputRef}
          aria-label="rename base"
          type="text"
          maxLength={255}
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitRename();
              inputRef.current?.blur();
            }
          }}
          onBlur={commitRename}
          className="flex-auto truncate rounded border-none p-1 outline-none"
          style={{
            fontFamily: FONT_HEADING,
            fontSize: "17px",
            fontWeight: 800,
            lineHeight: "24px",
            color: FG_DEFAULT,
            backgroundColor: "transparent",
          }}
        />
        <div className="ml-2 flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="flex items-center justify-center rounded p-1 hover:bg-black/5"
            style={{ color: FG_SUBTLE }}
            aria-label="Add to starred on the home screen"
          >
            <StarOutlineIcon />
          </button>
          <button
            type="button"
            className="flex items-center justify-center rounded p-1 hover:bg-black/5"
            style={{ color: FG_SUBTLE }}
            aria-label="Open overflow menu"
          >
            <OverflowIcon />
          </button>
        </div>
      </div>

      {/* Appearance section */}
      <div
        className="pt-3 pb-3"
        style={{ borderBottom: `1px solid ${BORDER_DEFAULT}` }}
      >
        <button
          type="button"
          className="flex w-full cursor-pointer items-center"
          style={{ background: "none", border: "none", padding: "4px" }}
          onClick={() => setAppearanceOpen((o) => !o)}
        >
          <PopupChevronIcon expanded={appearanceOpen} />
          <span
            className="ml-1"
            style={{
              fontFamily: FONT_HEADING,
              fontSize: "13px",
              fontWeight: 700,
              color: FG_DEFAULT,
            }}
          >
            Appearance
          </span>
        </button>
        <div
          style={{
            height: appearanceOpen ? "auto" : 0,
            overflow: "hidden",
            transition: "height 150ms ease",
          }}
        >
          {appearanceOpen && (
            <div className="px-1 pt-2 text-[13px]" style={{ color: FG_SUBTLE }}>
              Customize your base icon and color.
            </div>
          )}
        </div>
      </div>

      {/* Base guide section */}
      <div className="pt-3">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center"
          style={{ background: "none", border: "none", padding: "4px" }}
          onClick={() => setGuideOpen((o) => !o)}
        >
          <PopupChevronIcon expanded={guideOpen} />
          <span
            className="ml-1"
            style={{
              fontFamily: FONT_HEADING,
              fontSize: "13px",
              fontWeight: 700,
              color: FG_DEFAULT,
            }}
          >
            Base guide
          </span>
        </button>
        <div
          style={{
            height: guideOpen ? "auto" : 0,
            overflow: "hidden",
            transition: "height 150ms ease",
          }}
        >
          {guideOpen && (
            <div className="mt-2 -ml-1">
              <div
                className="w-full cursor-pointer rounded-lg px-3 py-2 text-[13px] hover:bg-black/5"
                style={{
                  color: FG_SUBTLE,
                  lineHeight: "20px",
                }}
              >
                <p style={{ margin: 0 }}>
                  Teammates will see this when they first open the base – add a
                  description, goals, links, things like that.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
