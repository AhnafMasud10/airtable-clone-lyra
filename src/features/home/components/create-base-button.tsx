"use client";

import { useState } from "react";
import { CreateBaseDialog } from "./create-base-dialog";

type CreateBaseButtonProps = Readonly<{
  compact?: boolean;
  variant?: "default" | "outline";
  label?: string;
}>;

export function CreateBaseButton({
  compact = false,
  variant = "default",
  label = "Create",
}: CreateBaseButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const isOutline = variant === "outline";

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className={`inline-flex cursor-pointer items-center justify-center rounded-[8px] px-[12px] font-medium transition focus-visible:ring-2 focus-visible:ring-[#2a79ef] focus-visible:outline-none ${
          isOutline
            ? "border border-[#d4dae4] bg-white text-[#333] hover:bg-[#f8f9fb] hover:border-[#c8cdd6]"
            : "border-none bg-[#166ee1] font-semibold text-white shadow-sm hover:shadow"
        } ${compact ? "" : "w-full"}`}
        style={{ height: 32 }}
      >
        {!isOutline && (
          <svg width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" className="mr-[8px] shrink-0" aria-hidden="true" style={{ shapeRendering: "geometricPrecision" }}>
            <line x1="40" y1="128" x2="216" y2="128" />
            <line x1="128" y1="40" x2="128" y2="216" />
          </svg>
        )}
        <span className="truncate select-none text-[14px]">
          {label}
        </span>
      </button>
      <CreateBaseDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
