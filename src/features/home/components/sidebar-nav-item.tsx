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
  const className = `flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition ${
    active
      ? "bg-[#eef3ff] font-medium text-[#1f57d2]"
      : "text-[#3f4b59] hover:bg-[#f6f7f9]"
  }`;

  const content = (
    <>
      <span className="flex items-center gap-2">
        <span className="text-[13px] text-[#7d8998]">{icon}</span>
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
