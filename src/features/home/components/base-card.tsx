import Link from "next/link";
import type { HomeBase } from "../types";

type BaseCardProps = Readonly<{
  base: HomeBase;
  openedLabel: string;
  accentClass: string;
}>;

export function BaseCard({ base, openedLabel, accentClass }: BaseCardProps) {
  const href = `/base/${base.id}`;
  const initial = base.name.charAt(0).toUpperCase() || "B";

  return (
    <Link
      href={href}
      className="flex min-h-[66px] rounded-lg border border-[#e2e6ed] bg-white p-3 transition hover:border-[#c9d6eb] hover:shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-visible:ring-2 focus-visible:ring-[#2a79ef] focus-visible:outline-none"
    >
      <div
        className={`mr-3 flex h-10 w-10 items-center justify-center rounded-md text-[28px] leading-none font-semibold text-white ${accentClass}`}
      >
        {initial}
      </div>
      <div className="min-w-0">
        <div className="truncate pt-0.5 text-[18px] leading-5 font-medium text-[#1f2328]">
          {base.name}
        </div>
        <div className="mt-0.5 text-[12px] text-[#748091]">{openedLabel}</div>
      </div>
    </Link>
  );
}
