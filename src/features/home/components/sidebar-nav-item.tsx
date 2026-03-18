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
  const className = `flex items-center justify-between rounded-md px-3 py-2 text-[15px] transition ${
    active
      ? "bg-[#f0f0f0] font-semibold text-[#333]"
      : "text-[#333] hover:bg-[#f5f5f5]"
  }`;

  const content = (
    <>
      <span className="flex items-center gap-2.5">
        <span className="flex items-center text-[#444]">{icon}</span>
        <span>{label}</span>
      </span>
      {trailing}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
