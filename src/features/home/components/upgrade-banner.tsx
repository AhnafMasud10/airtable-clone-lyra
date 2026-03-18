export function UpgradeBanner() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-[#e2e6ee] bg-white px-6 py-5 shadow-sm">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute top-3 right-3 z-10 text-[#999] hover:text-[#555]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
        </svg>
      </button>

      <div className="relative z-[1]">
        <h2 className="text-[17px] font-semibold text-[#333]">
          Upgrade to the Team plan before your trial expires in{" "}
          <span className="text-[#2563eb]">7 days</span>
        </h2>
        <p className="mt-1 text-[14px] text-[#666]">
          Keep the power you need to manage complex workflows, design
          interfaces, and more.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-[#1a1a2e] px-5 py-2 text-sm font-medium text-white hover:bg-[#111]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5z" />
            </svg>
            Upgrade
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-[#555] hover:bg-[#f5f5f5]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z" />
            </svg>
            Compare plans
          </button>
        </div>
      </div>

      {/* Decorative illustration placeholder */}
      <div className="absolute top-0 right-0 hidden h-full w-[300px] lg:block">
        <div className="h-full w-full bg-gradient-to-l from-[#d8f5ef] via-[#c8ecf8] to-transparent opacity-60" />
      </div>
    </section>
  );
}
