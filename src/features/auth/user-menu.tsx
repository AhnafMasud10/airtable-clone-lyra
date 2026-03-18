import { signOut } from "~/server/auth";

type UserMenuProps = Readonly<{
  user: { name?: string | null; email?: string | null; image?: string | null };
}>;

export function UserMenu({ user }: UserMenuProps) {
  const initial = user.name?.[0] ?? user.email?.[0] ?? "?";

  return (
    <div className="flex items-center">
      <form action={async () => {
        "use server";
        await signOut();
      }}>
        <button
          type="submit"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white bg-[#7c4dff] text-xs font-semibold text-white shadow-sm hover:opacity-90"
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
        </button>
      </form>
    </div>
  );
}
