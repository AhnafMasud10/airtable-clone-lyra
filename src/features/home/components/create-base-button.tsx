"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export function CreateBaseButton() {
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
      className="w-full rounded-md bg-[#2a79ef] px-4 py-2 text-sm font-medium text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)] transition hover:bg-[#1f6feb] focus-visible:ring-2 focus-visible:ring-[#2a79ef] focus-visible:outline-none"
    >
      {createBase.isPending ? "Creating..." : "+ Create"}
    </button>
  );
}
