"use client";

import { useState } from "react";
import { CreateBaseDialog } from "./create-base-dialog";

type CreateBaseButtonProps = Readonly<{
  compact?: boolean;
}>;

export function CreateBaseButton({ compact = false }: CreateBaseButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className={`inline-flex cursor-pointer items-center justify-center rounded-[8px] border-none bg-[#166ee1] px-[12px] font-semibold text-white shadow-sm transition hover:shadow focus-visible:ring-2 focus-visible:ring-[#2a79ef] focus-visible:outline-none ${compact ? "" : "w-full"}`}
        style={{ height: 32 }}
      >
        <svg width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" className="mr-[8px] shrink-0" aria-hidden="true" style={{ shapeRendering: "geometricPrecision" }}>
          <line x1="40" y1="128" x2="216" y2="128" />
          <line x1="128" y1="40" x2="128" y2="216" />
        </svg>
        <span className="truncate select-none text-[14px]">
          Create
        </span>
      </button>
      <CreateBaseDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
