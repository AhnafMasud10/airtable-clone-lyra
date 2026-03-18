"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { getOpenedLabel, groupBasesForHome } from "../types";

const accentColors = [
  "bg-[#4d7c5c] text-white",
  "bg-[#c8a82e] text-[#333]",
  "bg-[#a67939] text-white",
  "bg-[#5b7daa] text-white",
];

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: bases } = api.base.list.useQuery();

  // Cmd+K to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filtered = bases?.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase()),
  ) ?? [];

  const grouped = bases ? groupBasesForHome(bases) : { today: [], past7Days: [], past30Days: [] };
  const recentBases = query
    ? filtered
    : [...grouped.today, ...grouped.past7Days, ...grouped.past30Days];

  function getInitials(name: string) {
    if (name.length <= 2) return name.charAt(0).toUpperCase() + (name.charAt(1) ?? "");
    return name.split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("");
  }

  function getTimeLabel(base: typeof recentBases[number]) {
    const idx = recentBases.indexOf(base);
    if (grouped.today.some((b) => b.id === base.id)) return getOpenedLabel(0, "today");
    if (grouped.past7Days.some((b) => b.id === base.id)) return "Last opened 2 days ago";
    const past30Idx = grouped.past30Days.findIndex((b) => b.id === base.id);
    if (past30Idx >= 0) return `Last opened ${8 + past30Idx} days ago`;
    return `Result ${idx + 1}`;
  }

  function navigate(baseId: string) {
    setOpen(false);
    router.push(`/base/${baseId}`);
  }

  // Keyboard nav
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, recentBases.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0 && recentBases[selectedIndex]) {
      e.preventDefault();
      navigate(recentBases[selectedIndex].id);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full max-w-[360px] cursor-pointer items-center rounded-full bg-white px-[16px] shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
        style={{ height: 32 }}
      >
        <svg width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#888]" style={{ shapeRendering: "geometricPrecision" }}>
          <circle cx="112" cy="112" r="80" />
          <line x1="176" y1="176" x2="224" y2="224" />
        </svg>
        <p className="ml-[8px] flex-auto text-left text-[14px] leading-[22px] text-[#888]">Search...</p>
        <p className="ml-[8px] text-[14px] leading-[22px] text-[#bbb]">&#8984; K</p>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9999] bg-black/20" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Search"
        className="fixed left-1/2 top-[10px] z-[10000] overflow-hidden rounded-[12px] bg-white shadow-2xl"
        style={{ width: 640, maxWidth: "100%", transform: "translateX(-50%)", wordBreak: "break-word" }}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-[#e5e5e5] py-[12px] pr-[16px] pl-[24px]">
          <svg width="32" height="32" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#333]" style={{ shapeRendering: "geometricPrecision" }}>
            <circle cx="112" cy="112" r="80" />
            <line x1="176" y1="176" x2="224" y2="224" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="ml-[8px] w-full border-none bg-transparent p-[8px] text-[18px] font-medium text-[#333] placeholder-[#999] outline-none"
            placeholder="Search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            style={{ height: 48 }}
          />
        </div>

        {/* Results */}
        <div className="flex flex-col overflow-auto rounded-b-[12px]" style={{ maxHeight: 560 }}>
          <p className="mt-[4px] px-[20px] pt-[16px] pb-[12px] text-[14px] leading-[22px] text-[#888]">
            {query ? "Results" : "Recently opened"}
          </p>

          <div className="pl-[12px]">
            {recentBases.length === 0 && (
              <p className="px-[12px] pb-[16px] text-[14px] text-[#888]">No results found</p>
            )}
            {recentBases.map((base, index) => (
              <a
                key={base.id}
                href={`/base/${base.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(base.id);
                }}
                className="block no-underline"
              >
                <div
                  className={`flex items-center rounded py-[12px] pl-[12px] pr-[16px] ${
                    index === selectedIndex ? "bg-[#f0f0f0]" : "hover:bg-[#f5f5f5]"
                  }`}
                >
                  <div className="flex w-2/3 items-center truncate">
                    <div className="shrink-0">
                      <div
                        className={`flex h-[40px] w-[40px] items-center justify-center rounded-md ${accentColors[index % accentColors.length]}`}
                        aria-hidden="true"
                      >
                        <span className="text-[14px] font-semibold">{getInitials(base.name)}</span>
                      </div>
                    </div>
                    <div className="ml-[8px] flex w-full flex-col justify-center">
                      <div className="flex items-center" style={{ maxWidth: 300 }}>
                        <span className="truncate text-[14px] font-semibold leading-[22px] text-[#333]">
                          {base.name}
                        </span>
                        <span className="ml-[4px] text-[14px] leading-[22px] text-[#bbb]">
                          &bull; Base
                        </span>
                      </div>
                      <p className="truncate text-[13px] leading-[22px] text-[#bbb]">
                        My First Workspace
                      </p>
                    </div>
                  </div>
                  <p className="ml-[4px] w-1/3 truncate text-right text-[13px] leading-[22px] text-[#aaa]">
                    {getTimeLabel(base)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center border-t border-[#e5e5e5] px-[20px] py-[16px]">
          <p className="text-[14px] leading-[22px] text-[#bbb]">
            Press{" "}
            <span className="mx-[6px]">
              <kbd className="inline-block rounded-[3px] bg-[#f5f5f5] px-[3px] text-center text-[11px] uppercase leading-[16px] text-[#888]" style={{ minWidth: 14, height: 16 }}>&#8984;</kbd>
              <kbd className="ml-[2px] inline-block rounded-[3px] bg-[#f5f5f5] px-[3px] text-center text-[11px] uppercase leading-[16px] text-[#888]" style={{ minWidth: 14, height: 16 }}>K</kbd>
            </span>
            {" "}any time to search
          </p>
        </div>
      </div>
    </>
  );
}
