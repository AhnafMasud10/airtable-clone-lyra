import Link from "next/link";
import type { ReactNode } from "react";

type SidebarNavItemProps = Readonly<{
  label: string;
  href?: string;
  active?: boolean;
  trailing?: ReactNode;
  icon?: ReactNode;
}>;

export function SidebarNavItem({
  label,
  href,
  active = false,
  trailing,
  icon,
}: SidebarNavItemProps) {
  const wrapperClass = `flex items-center justify-between rounded mb-[4px] hover:bg-[#f5f5f5] ${
    active ? "bg-[#f0f0f0]" : ""
  }`;

  if (href) {
    return (
      <div className={wrapperClass}>
        <Link href={href} className="flex flex-1 items-center no-underline px-[12px]">
          <span className="flex shrink-0 items-center text-[#333]">{icon}</span>
          <h4 className="truncate py-[8px] pl-[8px] text-[16px] font-medium leading-[22px] text-[#333]">
            {label}
          </h4>
        </Link>
        {trailing}
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <span className="flex flex-1 items-center px-[12px]">
        <span className="flex shrink-0 items-center text-[#333]">{icon}</span>
        <h4 className="truncate py-[8px] pl-[8px] text-[16px] font-medium leading-[22px] text-[#333]">
          {label}
        </h4>
      </span>
      {trailing}
    </div>
  );
}
