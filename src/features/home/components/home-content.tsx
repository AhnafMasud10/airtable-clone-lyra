import { BasesSection } from "./bases-section";
import { UpgradeBanner } from "./upgrade-banner";
import type { HomeBase } from "../types";

type HomeContentProps = Readonly<{
  bases: HomeBase[];
  isError?: boolean;
}>;

export function HomeContent({ bases, isError = false }: HomeContentProps) {
  if (isError) {
    return (
      <div className="rounded-lg border border-[#f2cbd2] bg-[#fff6f8] p-6 text-sm text-[#a22135]">
        Could not load bases. Please refresh the page.
      </div>
    );
  }

  if (bases.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#d4dae4] bg-white p-10 text-center">
        <h2 className="text-xl font-semibold text-[#1f2328]">Home</h2>
        <p className="mt-2 text-sm text-[#6f7b8a]">
          No bases yet. Create your first base to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-[36px] font-semibold tracking-tight text-[#1f2328]">
        Home
      </h1>
      <div className="mt-3">
        <UpgradeBanner />
      </div>
      <BasesSection bases={bases} />
    </>
  );
}
