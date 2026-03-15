import { signOut } from "~/server/auth";

type UserMenuProps = Readonly<{
  user: { name?: string | null; email?: string | null; image?: string | null };
}>;

export function UserMenu({ user }: UserMenuProps) {
  const initial = user.name?.[0] ?? user.email?.[0] ?? "?";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#556170]">{user.name ?? user.email}</span>
      <form action={async () => {
        "use server";
        await signOut();
      }}>
        <button
          type="submit"
          className="rounded px-2 py-1 text-sm text-[#556170] hover:bg-[#f1f3f7] hover:text-[#1f2328]"
        >
          Sign out
        </button>
      </form>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7d4dff] text-xs font-semibold text-white"
        title={user.email ?? undefined}
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- external avatar URL
          <img
            src={user.image}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initial.toUpperCase()
        )}
      </div>
    </div>
  );
}
