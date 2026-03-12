export function UpgradeBanner() {
  return (
    <section className="relative rounded-lg border border-[#e2e6ee] bg-[#f4f7ff] px-6 py-5">
      <button
        type="button"
        aria-label="Dismiss banner"
        className="absolute top-3 right-3 text-[#8d97a7] hover:text-[#5a6574]"
      >
        ×
      </button>

      <div className="flex items-center justify-between gap-6">
        <div className="max-w-[620px]">
          <h2 className="text-[29px] leading-8 font-semibold tracking-tight text-[#1f2328]">
            Upgrade to the Team plan before your trial expires in 14 days
          </h2>
          <p className="mt-1 text-[13px] text-[#617081]">
            Keep the power you need to manage complex workflows, design
            interfaces, and more.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              className="rounded-full bg-[#111827] px-6 py-2 text-sm font-medium text-white"
            >
              ✦ Upgrade
            </button>
            <button
              type="button"
              className="text-sm text-[#647487] hover:text-[#1f57d2]"
            >
              ↹ Compare plans
            </button>
          </div>
        </div>

        <div className="hidden h-28 w-[240px] rounded-lg bg-gradient-to-r from-[#d8f5ef] via-[#c2ecff] to-[#dae2ff] lg:block" />
      </div>
    </section>
  );
}
