"use client";

import { useEffect, useRef, useState } from "react";
import { BasesSection } from "./bases-section";
import { CreateBaseButton } from "./create-base-button";
import { UpgradeBanner } from "./upgrade-banner";
import { api } from "~/trpc/react";

const FILTER_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "past7", label: "In the past 7 days" },
  { value: "past30", label: "In the past 30 days" },
  { value: "anytime", label: "Anytime" },
] as const;

type FilterValue = (typeof FILTER_OPTIONS)[number]["value"];

const FILTER_DISPLAY: Record<FilterValue, string> = {
  today: "Opened today",
  past7: "Opened in the past 7 days",
  past30: "Opened in the past 30 days",
  anytime: "Opened anytime",
};

function FilterDropdown({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        className="flex items-center rounded text-[#333] hover:text-[#111]"
        aria-label="Filter items"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
      >
        <p className="mr-[4px] text-[15px] leading-[22px] text-[#333]">
          {FILTER_DISPLAY[value]}
        </p>
        <svg
          width="16"
          height="16"
          viewBox="0 0 256 256"
          fill="none"
          stroke="currentColor"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ shapeRendering: "geometricPrecision" }}
        >
          <polyline points="208 96 128 176 48 96" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="dialog"
          className="absolute left-0 top-full z-[10000] mt-[4px] overflow-y-auto rounded-[12px] bg-white shadow-lg"
          style={{ width: 240, maxHeight: 659 }}
        >
          <ul role="menu" className="p-[12px]">
            {FILTER_OPTIONS.map((opt) => (
              <li
                key={opt.value}
                role="menuitemcheckbox"
                aria-checked={value === opt.value}
                tabIndex={-1}
                className="flex w-full cursor-pointer items-center rounded px-[8px] py-[8px] hover:bg-[#f5f5f5]"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span className="flex-auto truncate select-none">
                  <p className="text-[14px] leading-[22px] text-[#333]">
                    {opt.label}
                  </p>
                </span>
                {value === opt.value && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 256 256"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-[8px] shrink-0 text-[#333]"
                    style={{ shapeRendering: "geometricPrecision" }}
                  >
                    <polyline points="40 130 96 186 216 66" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function HomeContent() {
  const { data: bases, isLoading, isError } = api.base.list.useQuery();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [filter, setFilter] = useState<FilterValue>("anytime");

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#e2e6ed] bg-white p-10 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#e2e6ed] border-t-[#2a79ef]" />
        <p className="mt-3 text-sm text-[#6f7b8a]">Loading bases...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-[#f2cbd2] bg-[#fff6f8] p-6 text-sm text-[#a22135]">
        Could not load bases. Please refresh the page.
      </div>
    );
  }

  if (!bases || bases.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <h1 className="pb-[20px] text-[28px] font-semibold leading-[18px] text-[#333]">
          Home
        </h1>
        <div className="rounded-lg border border-dashed border-[#d4dae4] bg-white p-10 text-center">
          <p className="text-sm text-[#6f7b8a]">
            No bases yet. Create your first base to get started.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-[200px]">
              <CreateBaseButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <h1 className="pb-[20px] text-[28px] font-semibold leading-[18px] text-[#333]">
        Home
      </h1>

      {!bannerDismissed && (
        <div className="mb-[16px]">
          <UpgradeBanner onDismiss={() => setBannerDismissed(true)} />
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col">
        <div className="relative z-[5] shrink-0" style={{ paddingBottom: 10, marginBottom: -10 }}>
          <div className="relative z-[1] flex items-center justify-between pb-[18px]">
            <div className="mr-[8px] flex items-center">
              <div className="mr-[12px] flex items-center">
                <FilterDropdown value={filter} onChange={setFilter} />
              </div>
            </div>
            <div className="flex">
              <div role="radiogroup" className="flex items-center">
                <button type="button" className="inline-flex rounded-full p-[4px] text-[#888] hover:text-[#333]" aria-label="View items in a list">
                  <svg width="20" height="20" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" style={{ shapeRendering: "geometricPrecision" }}>
                    <line x1="40" y1="64" x2="216" y2="64" />
                    <line x1="40" y1="128" x2="216" y2="128" />
                    <line x1="40" y1="192" x2="216" y2="192" />
                  </svg>
                </button>
                <button type="button" className="inline-flex rounded-full bg-[#f0f0f0] p-[4px] text-[#333]" aria-label="View items in a grid">
                  <svg width="20" height="20" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" style={{ shapeRendering: "geometricPrecision" }}>
                    <rect x="40" y="40" width="72" height="72" rx="8" />
                    <rect x="144" y="40" width="72" height="72" rx="8" />
                    <rect x="40" y="144" width="72" height="72" rx="8" />
                    <rect x="144" y="144" width="72" height="72" rx="8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-auto overflow-y-auto px-[4px]" style={{ minHeight: 500 }}>
        <BasesSection bases={bases} filter={filter} />
      </div>
    </div>
  );
}
