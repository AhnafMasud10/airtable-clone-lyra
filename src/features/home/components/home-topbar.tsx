import { auth } from "~/server/auth";

import { UserMenu } from "~/features/auth/user-menu";

export async function HomeTopbar() {
  const session = await auth();
  return (
    <header className="flex h-[52px] items-center justify-between border-b border-[#e7eaf0] bg-white px-4">
      <button
        type="button"
        className="h-8 w-8 rounded-md text-[#657181] hover:bg-[#f1f3f7]"
        aria-label="Open menu"
      >
        ☰
      </button>

      <div className="w-full max-w-[430px] px-4">
        <div className="flex h-9 items-center rounded-full border border-[#e3e6ec] bg-[#f8f9fb] px-3 text-sm text-[#6d7887]">
          <span className="mr-2">⌕</span>
          <span className="flex-1">Search...</span>
          <span className="rounded border border-[#d8dde6] bg-white px-1.5 py-0.5 text-[10px]">
            ⌘ K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-[#556170]">
        <button type="button" className="hover:text-[#1f57d2]">
          Help
        </button>
        <button
          type="button"
          className="h-8 w-8 rounded-full hover:bg-[#f1f3f7]"
          aria-label="Notifications"
        >
          🔔
        </button>
        {session?.user && <UserMenu user={session.user} />}
      </div>
    </header>
  );
}
