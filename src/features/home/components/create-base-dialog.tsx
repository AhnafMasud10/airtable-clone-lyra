"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

type CreateBaseDialogProps = Readonly<{
  open: boolean;
  onClose: () => void;
}>;

export function CreateBaseDialog({ open, onClose }: CreateBaseDialogProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const dialogRef = useRef<HTMLDivElement>(null);

  const createBase = api.base.create.useMutation({
    onSuccess: async (base) => {
      await utils.base.list.invalidate();
      onClose();
      router.push(`/base/${base.id}`);
    },
  });

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleBuildOnYourOwn() {
    createBase.mutate({ name: "Untitled Base" });
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9999] bg-black/20" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        className="fixed left-1/2 top-1/2 z-[10000] overflow-hidden rounded-[16px] bg-white shadow-2xl"
        style={{ width: 752, maxWidth: "calc(100% - 32px)", transform: "translate(-50%, -50%)" }}
      >
        {/* Header */}
        <div className="flex flex-col justify-end border-b border-[#e5e5e5] py-[18px]">
          <h2 className="ml-[20px] text-[24px] font-bold leading-[1.3] text-[#333]">
            How do you want to start?
          </h2>
        </div>

        {/* Workspace selector (decorative) */}
        <div className="flex items-center px-[20px] pt-[20px]">
          <p className="mr-[4px] text-[17px] font-semibold leading-[1.5] text-[#333]">
            Workspace:
          </p>
          <div className="flex cursor-pointer items-center">
            <p className="mr-[2px] text-[17px] leading-[1.5] text-[#888]">
              My First Workspace
            </p>
            <svg
              width="16"
              height="16"
              viewBox="0 0 256 256"
              fill="none"
              stroke="currentColor"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#888]"
              style={{ shapeRendering: "geometricPrecision" }}
            >
              <polyline points="208 96 128 176 48 96" />
            </svg>
          </div>
        </div>

        {/* Cards */}
        <div className="flex gap-[20px] p-[20px]">
          {/* Build an app - decorative only */}
          <div
            className="flex w-[340px] cursor-not-allowed flex-col overflow-hidden rounded-[12px] opacity-50 shadow-sm"
          >
            <div
              className="relative flex w-full flex-col items-center justify-end rounded-t-[12px]"
              style={{ height: 200, backgroundColor: "#ede9fe" }}
            >
              <svg
                width="200"
                height="150"
                viewBox="0 0 120 100"
                fill="none"
                className="mb-[12px]"
              >
                <rect x="10" y="10" width="100" height="75" rx="6" fill="white" />
                <rect x="10" y="10" width="28" height="75" rx="6" fill="#c4b5fd" />
                <rect x="16" y="22" width="16" height="3" rx="1.5" fill="#a78bfa" />
                <rect x="16" y="30" width="16" height="3" rx="1.5" fill="#a78bfa" />
                <rect x="16" y="38" width="16" height="3" rx="1.5" fill="#a78bfa" />
                <rect x="16" y="46" width="16" height="3" rx="1.5" fill="#a78bfa" />
                <rect x="48" y="30" width="24" height="40" rx="4" fill="#c4b5fd" />
                <rect x="78" y="30" width="24" height="40" rx="4" fill="#e9e5ff" />
                <circle cx="90" cy="55" r="12" fill="#c4b5fd" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <div className="p-[16px]">
              <div className="mb-[8px] flex items-center">
                <h2 className="text-[18px] font-bold leading-[1.3] text-[#333]">
                  Build an app
                </h2>
              </div>
              <span className="text-[16px] leading-[1.5] text-[#888]">
                Quickly create a custom app with data and interfaces tailored to your team.
              </span>
            </div>
          </div>

          {/* Build an app on your own - functional */}
          <button
            type="button"
            disabled={createBase.isPending}
            onClick={handleBuildOnYourOwn}
            className="flex w-[340px] cursor-pointer flex-col overflow-hidden rounded-[12px] border-none bg-white text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className="relative flex w-full flex-col items-center justify-end rounded-t-[12px]"
              style={{ height: 200, backgroundColor: "#e0e7ff" }}
            >
              <svg
                width="200"
                height="150"
                viewBox="0 0 120 100"
                fill="none"
                className="mb-[12px]"
              >
                <rect x="10" y="10" width="100" height="75" rx="6" fill="white" />
                <rect x="10" y="10" width="100" height="18" rx="6" fill="#93c5fd" />
                <rect x="16" y="15" width="28" height="4" rx="2" fill="white" />
                <rect x="70" y="15" width="16" height="4" rx="2" fill="white" />
                <rect x="16" y="36" width="16" height="3" rx="1.5" fill="#93c5fd" />
                <rect x="36" y="36" width="16" height="3" rx="1.5" fill="#93c5fd" />
                <rect x="56" y="36" width="16" height="3" rx="1.5" fill="#93c5fd" />
                <rect x="76" y="36" width="16" height="3" rx="1.5" fill="#93c5fd" />
                <rect x="16" y="44" width="16" height="3" rx="1.5" fill="#dbeafe" />
                <rect x="36" y="44" width="16" height="3" rx="1.5" fill="#dbeafe" />
                <rect x="56" y="44" width="16" height="3" rx="1.5" fill="#dbeafe" />
                <rect x="76" y="44" width="16" height="3" rx="1.5" fill="#dbeafe" />
                <rect x="16" y="52" width="16" height="3" rx="1.5" fill="#dbeafe" />
                <rect x="36" y="52" width="16" height="3" rx="1.5" fill="#dbeafe" />
                <rect x="56" y="52" width="16" height="3" rx="1.5" fill="#dbeafe" />
                <rect x="76" y="52" width="16" height="3" rx="1.5" fill="#dbeafe" />
                <rect x="16" y="60" width="16" height="3" rx="1.5" fill="#dbeafe" />
                <rect x="36" y="60" width="16" height="3" rx="1.5" fill="#dbeafe" />
                <rect x="56" y="60" width="16" height="3" rx="1.5" fill="#dbeafe" />
                <rect x="76" y="60" width="16" height="3" rx="1.5" fill="#dbeafe" />
              </svg>
            </div>
            <div className="p-[16px]">
              <div className="mb-[8px] flex items-center">
                <h2 className="text-[18px] font-bold leading-[1.3] text-[#333]">
                  {createBase.isPending ? "Creating..." : "Build an app on your own"}
                </h2>
              </div>
              <span className="text-[16px] leading-[1.5] text-[#888]">
                Start with a blank app and build your ideal workflow.
              </span>
            </div>
          </button>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-0 mr-[16px] mt-[24px] flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full border-none bg-transparent hover:bg-[#f0f0f0]"
          aria-label="Close dialog"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 256 256"
            fill="none"
            stroke="currentColor"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#888]"
            style={{ shapeRendering: "geometricPrecision" }}
          >
            <line x1="200" y1="56" x2="56" y2="200" />
            <line x1="200" y1="200" x2="56" y2="56" />
          </svg>
        </button>
      </div>
    </>
  );
}
