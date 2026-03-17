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
      <h1 className="text-[36px] font-semibold tracking-tight text-[#1f2328]">
        Home
      </h1>
      <div className="mt-3">
        <UpgradeBanner />
      </div>
      <BasesSection bases={bases} />
    </>
  );
}
