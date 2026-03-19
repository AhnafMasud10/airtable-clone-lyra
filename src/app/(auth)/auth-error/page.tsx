import Link from "next/link";

type ErrorType =
  | "Configuration"
  | "AccessDenied"
  | "Verification"
  | "OAuthSignin"
  | "OAuthCallback"
  | "OAuthCreateAccount"
  | "EmailCreateAccount"
  | "Callback"
  | "OAuthAccountNotLinked"
  | "EmailSignin"
  | "CredentialsSignin"
  | "SessionRequired"
  | "Default";

const errorMessages: Record<ErrorType, string> = {
  Configuration:
    "There is a problem with the server configuration. Please contact support.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Verification:
    "The sign-in link has expired or has already been used. Please try again.",
  OAuthSignin: "Error starting the sign-in process. Please try again.",
  OAuthCallback: "Error during the sign-in callback. Please try again.",
  OAuthCreateAccount:
    "Could not create your account. The email may already be in use with another provider.",
  EmailCreateAccount:
    "Could not create your account. Please try again or use a different sign-in method.",
  Callback: "An error occurred during sign-in. Please try again.",
  OAuthAccountNotLinked:
    "This email is already associated with another sign-in method. Please sign in using your original method.",
  EmailSignin: "Could not send the sign-in email. Please try again.",
  CredentialsSignin: "Invalid credentials. Please check your details and try again.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An unexpected error occurred during sign-in. Please try again.",
};

export default async function AuthErrorPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error?: string }>;
}>) {
  const params = await searchParams;
  const error = (params.error ?? "Default") as ErrorType;
  const message =
    errorMessages[error] ?? errorMessages.Default;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f2f3f6]">
      <div className="w-full max-w-[400px] rounded-2xl border border-[#e7eaf0] bg-white p-10 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-[#1f2328]">
            Sign-in error
          </h1>
          <p className="text-sm text-[#6d7887]">{message}</p>
        </div>

        <Link
          href="/sign-in"
          className="block w-full rounded-lg border border-[#e3e6ec] bg-white px-4 py-3.5 text-center text-sm font-medium text-[#1f2328] shadow-sm transition-colors hover:bg-[#f8f9fb] hover:border-[#d8dde6]"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
