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
    <div
      className="group relative cursor-pointer rounded-[12px] bg-white shadow-sm transition hover:shadow-md"
      role="region"
      aria-label={base.name}
      style={{ height: 92, minWidth: 286, maxWidth: 572 }}
    >
      <div className="flex">
        <div
          className="flex shrink-0 items-center justify-center rounded-l-[12px]"
          style={{ width: 92, height: 92, minWidth: 92 }}
        >
          <div
            className={`relative flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-lg text-white ${accentClass}`}
            aria-hidden="true"
          >
            <span className="text-[20px] font-semibold">{initials}</span>
          </div>
        </div>
        <div className="mr-[16px] flex flex-auto flex-col justify-center text-left">
          <div className="flex items-center justify-between">
            <div className="flex flex-auto">
              <Link
                href={href}
                className="flex flex-auto items-center no-underline"
              >
                <h3 className="truncate text-[14px] font-semibold leading-[22px] text-[#333]">
                  {base.name}
                </h3>
              </Link>
            </div>
            {/* Hover actions */}
            <div
              className="absolute top-0 right-0 z-[1] mt-[16px] mr-[16px] flex items-center rounded-[12px] bg-white opacity-0 transition group-hover:opacity-100"
              style={{ minHeight: "1.75rem" }}
            />
          </div>
          <div className="mt-[4px] flex items-center">
            <div className="truncate text-[13px] leading-[22px] text-[#888]">
              {openedLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
