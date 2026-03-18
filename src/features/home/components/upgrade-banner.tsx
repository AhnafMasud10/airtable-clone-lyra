type UpgradeBannerProps = Readonly<{
  onDismiss?: () => void;
}>;

export function UpgradeBanner({ onDismiss }: UpgradeBannerProps) {
  return (
    <div className="relative rounded-[12px] bg-[#dbeafe] px-[24px] py-[20px] shadow-sm" style={{ backgroundRepeat: "no-repeat" }}>
      <div className="pl-[8px]">
        <h2 className="mb-[8px] text-[15px] font-semibold leading-[18px] text-[#333]">
          Unlock more power on the Team plan
        </h2>
        <p className="mb-[16px] text-[14px] leading-[22px] text-[#333]">
          More records. More automations. More customization. More Airtable.
        </p>
        <div className="flex">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-[8px] rounded-full border-none bg-[#1a1a2e] px-[16px] py-[8px] text-[15px] font-semibold text-white shadow-sm transition hover:shadow"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ shapeRendering: "geometricPrecision" }}>
              <path d="M8 0l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5z" />
            </svg>
            Upgrade
          </button>
          <button
            type="button"
            className="ml-[8px] inline-flex items-center justify-center gap-[8px] rounded-full border-none bg-transparent px-[16px] py-[8px] text-[15px] text-[#555] transition hover:bg-[#cddcf0]"
          >
            <svg width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ shapeRendering: "geometricPrecision" }}>
              <line x1="40" y1="128" x2="216" y2="128" />
              <polyline points="168 80 216 128 168 176" />
              <line x1="216" y1="128" x2="40" y2="128" />
              <polyline points="88 80 40 128 88 176" />
            </svg>
            Compare plans
          </button>
        </div>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="absolute top-[16px] right-[16px] flex cursor-pointer items-center text-[#666] hover:text-[#333]"
      >
        <svg width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" style={{ shapeRendering: "geometricPrecision" }}>
          <line x1="200" y1="56" x2="56" y2="200" />
          <line x1="200" y1="200" x2="56" y2="56" />
        </svg>
      </button>
    </div>
  );
}
