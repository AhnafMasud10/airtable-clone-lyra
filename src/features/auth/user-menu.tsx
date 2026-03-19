"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOutAction } from "~/app/actions";

type UserMenuProps = Readonly<{
  user: { name?: string | null; email?: string | null; image?: string | null };
}>;

const menuItemClass =
  "flex w-full cursor-pointer items-center rounded px-3 py-2 text-[14px] text-[#333] hover:bg-[#f5f5f5] focus-visible:bg-[#f5f5f5] focus-visible:outline-none";

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0" aria-hidden>
      <circle cx="8" cy="5" r="2.5" />
      <path d="M3 14c0-2.5 2.5-4 5-4s5 1.5 5 4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0" aria-hidden>
      <circle cx="6" cy="4" r="2" />
      <circle cx="10" cy="4" r="2" />
      <path d="M2 12c0-2 1.5-3 4-3s4 1 4 3M10 12c0-2 1.5-3 4-3s4 1 4 3" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0" aria-hidden>
      <path d="M8 2a4 4 0 0 1 4 4v2.5l1 2v.5H3v-.5l1-2V6a4 4 0 0 1 4-4z" />
      <path d="M6 12a2 2 0 0 0 4 0" />
    </svg>
  );
}

function TranslateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0" aria-hidden>
      <path d="M4 4h6l-2 8M6 12l2-8M10 4h2l2 4 2-4h2" />
      <path d="M2 2h12v12H2z" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0" aria-hidden>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4v2M8 10v2M4 8h2M10 8h2M5.5 5.5l1.5 1.5M9 9l1.5 1.5M5.5 10.5l1.5-1.5M9 7L7.5 5.5" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0" aria-hidden>
      <rect x="1" y="3" width="14" height="10" rx="1" />
      <path d="M1 4l7 5 7-5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0" aria-hidden>
      <path d="M8 1l2 5 5 .5-4 3.5 1.5 5L8 11l-4.5 3.5 1.5-5-4-3.5 5-.5L8 1z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0" aria-hidden>
      <path d="M6 9l2-2M8 7l2 2M5 6l1-1a3 3 0 1 1 4 4l-1 1M11 10l-1 1a3 3 0 1 1-4-4l1-1" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0" aria-hidden>
      <path d="M6 12l4-4 2 2-4 4-2-2z" />
      <path d="M14 6l-2-2-1 1 2 2 1-1zM8 2L6 4l2 2 2-2-2-2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0" aria-hidden>
      <path d="M3 4h10M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M6 7v5M8 7v5M10 7v5M4 4l1 10a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l1-10" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0" aria-hidden>
      <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto shrink-0 -rotate-90" aria-hidden>
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const initial = user.name?.[0] ?? user.email?.[0] ?? "?";

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
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
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white shadow-sm hover:bg-[#f5f5f5] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
        title={user.email ?? undefined}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- external avatar URL
          <img
            src={user.image}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="text-[13px] font-semibold text-[#7c4dff]">
            {initial.toUpperCase()}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full z-10000 mt-2 w-[280px] overflow-hidden rounded border border-[#e5e5e5] bg-white py-3 shadow-lg"
          role="menu"
        >
          <div className="border-b border-[#e5e5e5] px-4 pb-3 pt-1">
            <p className="block font-semibold text-[#333]">
              {user.name ?? "User"}
            </p>
            <p className="text-[14px] text-[#666]">{user.email ?? ""}</p>
          </div>

          <div className="px-2 pt-2">
            <Link href="/account" className={menuItemClass}>
              <UserIcon />
              <span>Account</span>
            </Link>
            <button type="button" className={menuItemClass}>
              <UsersIcon />
              <span className="flex flex-1 items-center">
                Manage groups
                <span className="ml-auto rounded-full bg-[#e8f4ff] px-2 py-0.5 text-[11px] font-medium text-[#166ee1]">
                  Business
                </span>
              </span>
            </button>
            <button type="button" className={menuItemClass}>
              <BellIcon />
              <span className="flex-1">Notification preferences</span>
              <ChevronRightIcon />
            </button>
            <button type="button" className={menuItemClass}>
              <TranslateIcon />
              <span className="flex-1">Language preferences</span>
              <ChevronRightIcon />
            </button>
            <button type="button" className={menuItemClass}>
              <PaletteIcon />
              <span className="flex flex-1 items-center">
                Appearance
                <span className="ml-auto rounded-full bg-[#fff4e6] px-2 py-0.5 text-[11px] font-medium text-[#c76a00]">
                  Beta
                </span>
              </span>
              <ChevronRightIcon />
            </button>
          </div>

          <div className="my-2 h-px bg-[#e5e5e5]" />

          <div className="px-2">
            <button type="button" className={menuItemClass}>
              <EnvelopeIcon />
              <span>Contact sales</span>
            </button>
            <Link href="/pricing" className={menuItemClass}>
              <StarIcon />
              <span>Upgrade</span>
            </Link>
            <Link href="/account/credits" className={menuItemClass}>
              <EnvelopeIcon />
              <span>Tell a friend</span>
            </Link>
          </div>

          <div className="my-2 h-px bg-[#e5e5e5]" />

          <div className="px-2">
            <button type="button" className={menuItemClass}>
              <LinkIcon />
              <span>Integrations</span>
            </button>
            <Link href="/create" className={menuItemClass}>
              <WrenchIcon />
              <span>Builder hub</span>
            </Link>
          </div>

          <div className="my-2 h-px bg-[#e5e5e5]" />

          <div className="px-2">
            <button type="button" className={menuItemClass}>
              <TrashIcon />
              <span>Trash</span>
            </button>
            <form action={signOutAction}>
              <button type="submit" className={menuItemClass}>
                <SignOutIcon />
                <span>Log out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
