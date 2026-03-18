"use client";

import { BasesSection } from "./bases-section";
import { CreateBaseButton } from "./create-base-button";
import { UpgradeBanner } from "./upgrade-banner";
import { api } from "~/trpc/react";

export function HomeContent() {
  const { data: bases, isLoading, isError } = api.base.list.useQuery();

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
      <div className="rounded-lg border border-dashed border-[#d4dae4] bg-white p-10 text-center">
        <h2 className="text-xl font-semibold text-[#1f2328]">Home</h2>
        <p className="mt-2 text-sm text-[#6f7b8a]">
          No bases yet. Create your first base to get started.
        </p>
        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-[200px]">
            <CreateBaseButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-[28px] font-bold tracking-tight text-[#333]">
        Home
      </h1>
      <div className="mt-5">
        <UpgradeBanner />
      </div>

      {/* Filter bar */}
      <div className="mt-6 flex items-center justify-between pb-2">
        <button type="button" className="flex items-center gap-1.5 text-[15px] text-[#555] hover:text-[#333]">
          Opened anytime
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-0.5">
          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full text-[#888] hover:bg-[#eee]" aria-label="List view">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.5 4h11M2.5 8h11M2.5 12h11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eee] text-[#333]" aria-label="Grid view">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
            </svg>
          </button>
        </div>
      </div>

      <BasesSection bases={bases} />
    </>
  );
}
