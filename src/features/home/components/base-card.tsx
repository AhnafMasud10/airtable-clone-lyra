import Link from "next/link";
import type { HomeBase } from "../types";

type BaseCardProps = Readonly<{
  base: HomeBase;
  openedLabel: string;
  accentClass: string;
}>;

export function BaseCard({ base, openedLabel, accentClass }: BaseCardProps) {
  const href = `/base/${base.id}`;
  const initials =
    base.name.length <= 2
      ? base.name.charAt(0).toUpperCase() + (base.name.charAt(1) ?? "")
      : base.name
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w.charAt(0).toUpperCase())
          .join("");

  const isOpenData = openedLabel === "Open data";

  return (
    <div className="group relative flex h-[92px] cursor-pointer items-center rounded-xl bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={href}
        className="flex h-full flex-1 items-center rounded-xl focus-visible:ring-2 focus-visible:ring-[#2a79ef] focus-visible:outline-none"
      >
        <div className="flex h-full w-[92px] shrink-0 items-center justify-center rounded-l-xl">
          <div
            className={`flex h-[56px] w-[56px] items-center justify-center rounded-lg text-[20px] font-semibold text-white ${accentClass}`}
          >
            {initials}
          </div>
        </div>
        <div className="min-w-0 flex-1 pr-4">
          <div className="truncate text-[14px] font-semibold text-[#333]">
            {base.name}
          </div>
          <div className="mt-1 flex items-center text-[12px] text-[#888]">
            {isOpenData ? (
              <span className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ marginLeft: -2 }}>
                  <path d="M3.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-9zM2 2.5A1.5 1.5 0 0 1 3.5 1h9A1.5 1.5 0 0 1 14 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5v-11z" />
                  <path d="M5 5h6v1H5V5zm0 2h6v1H5V7zm0 2h4v1H5V9z" />
                </svg>
                Open data
              </span>
            ) : (
              openedLabel
            )}
          </div>
        </div>
      </Link>

      {/* Action buttons - visible on hover */}
      <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-lg bg-white opacity-0 shadow-sm transition group-hover:opacity-100">
        <button
          type="button"
          className="flex h-7 cursor-pointer items-center justify-center rounded-lg bg-white px-1.5 shadow-sm transition hover:shadow"
          aria-label="Click to add to starred"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-[#666]">
            <path d="M8 1.63l1.76 3.57.39.8.88.13 3.94.57-2.85 2.78-.64.62.15.88.67 3.93-3.52-1.85L8 12.7l-.78.41-3.52 1.85.67-3.93.15-.88-.64-.62L1.03 6.7l3.94-.57.88-.13.39-.8L8 1.63z" />
          </svg>
        </button>
        <button
          type="button"
          className="flex h-7 cursor-pointer items-center justify-center rounded-lg bg-white px-1.5 shadow-sm transition hover:shadow"
          aria-label="More actions"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-[#666]">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
