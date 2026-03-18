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

  return (
    <Link
      href={href}
      className="flex h-[92px] cursor-pointer items-center rounded-xl bg-white shadow-sm transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#2a79ef] focus-visible:outline-none"
    >
      <div className="flex h-full w-[92px] shrink-0 items-center justify-center rounded-l-xl">
        <div
          className={`flex h-[56px] w-[56px] items-center justify-center rounded-lg text-[20px] font-semibold text-white ${accentClass}`}
        >
          {initials}
        </div>
      </div>
      <div className="min-w-0 pr-4">
        <div className="truncate text-[14px] font-semibold text-[#333]">
          {base.name}
        </div>
        <div className="mt-1 text-[12px] text-[#888]">{openedLabel}</div>
      </div>
    </Link>
  );
}
