import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session?.user) {
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "localhost:3000";
    const proto = headersList.get("x-forwarded-proto") ?? "http";
    const baseUrl = `${proto}://${host}`;
    const signInUrl = new URL("/api/auth/signin", baseUrl);
    signInUrl.searchParams.set("callbackUrl", "/");
    redirect(signInUrl.toString());
  }

  return <>{children}</>;
}
