"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

type CreateBaseButtonProps = Readonly<{
  compact?: boolean;
}>;

export function CreateBaseButton({ compact = false }: CreateBaseButtonProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const createBase = api.base.create.useMutation({
    onSuccess: async (base) => {
      await utils.base.list.invalidate();
      router.push(`/base/${base.id}`);
    },
  });

  return (
    <button
      type="button"
      disabled={createBase.isPending}
      onClick={() => {
        const name = globalThis.prompt("Base name")?.trim();
        if (!name) return;
        createBase.mutate({ name });
      }}
      className={`flex items-center justify-center gap-1.5 rounded-lg bg-[#166ee1] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1259b8] focus-visible:ring-2 focus-visible:ring-[#2a79ef] focus-visible:outline-none ${compact ? "" : "w-full"}`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M8 3v10M3 8h10" />
      </svg>
      {createBase.isPending ? "Creating..." : "Create"}
    </button>
  );
}
