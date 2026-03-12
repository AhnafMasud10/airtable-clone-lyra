"use client";

type TopBarProps = Readonly<{
  baseName: string;
}>;

function AirtableLogoIcon() {
  return (
    <svg
      width="24"
      height="20.4"
      viewBox="0 0 200 170"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <g>
        <path
          fill="hsla(0, 0%, 100%, 0.95)"
          d="M90.0389,12.3675 L24.0799,39.6605 C20.4119,41.1785 20.4499,46.3885 24.1409,47.8515 L90.3759,74.1175 C96.1959,76.4255 102.6769,76.4255 108.4959,74.1175 L174.7319,47.8515 C178.4219,46.3885 178.4609,41.1785 174.7919,39.6605 L108.8339,12.3675 C102.8159,9.8775 96.0559,9.8775 90.0389,12.3675"
        />
        <path
          fill="hsla(0, 0%, 100%, 0.95)"
          d="M105.3122,88.4608 L105.3122,154.0768 C105.3122,157.1978 108.4592,159.3348 111.3602,158.1848 L185.1662,129.5368 C186.8512,128.8688 187.9562,127.2408 187.9562,125.4288 L187.9562,59.8128 C187.9562,56.6918 184.8092,54.5548 181.9082,55.7048 L108.1022,84.3528 C106.4182,85.0208 105.3122,86.6488 105.3122,88.4608"
        />
        <path
          fill="hsla(0, 0%, 100%, 0.95)"
          d="M88.0781,91.8464 L66.1741,102.4224 L63.9501,103.4974 L17.7121,125.6524 C14.7811,127.0664 11.0401,124.9304 11.0401,121.6744 L11.0401,60.0884 C11.0401,58.9104 11.6441,57.8934 12.4541,57.1274 C12.7921,56.7884 13.1751,56.5094 13.5731,56.2884 C14.6781,55.6254 16.2541,55.4484 17.5941,55.9784 L87.7101,83.7594 C91.2741,85.1734 91.5541,90.1674 88.0781,91.8464"
        />
      </g>
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision", marginLeft: "4px" }}
    >
      <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function ClockCounterClockwiseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M2.5 1.75a.75.75 0 0 0-1.5 0v4a.75.75 0 0 0 .75.75h4a.75.75 0 0 0 0-1.5H3.37A5.5 5.5 0 1 1 2.5 8a.75.75 0 0 0-1.5 0 7 7 0 1 0 1.404-4.2L2.5 3.5V1.75Z" />
      <path d="M8.25 4.5a.75.75 0 0 0-1.5 0V8a.75.75 0 0 0 .3.6l2.5 1.875a.75.75 0 0 0 .9-1.2L8.25 7.65V4.5Z" />
    </svg>
  );
}

function SidebarPlayIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9ZM3.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5H6V3H3.5ZM7 3v10h5.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5H7Z" />
      <path d="M9.25 6.53a.5.5 0 0 1 .5 0l1.5.87a.5.5 0 0 1 0 .866l-1.5.866a.5.5 0 0 1-.75-.433V6.964a.5.5 0 0 1 .25-.433Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25Z" />
      <path d="M8.225 12.725a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 1 1-2.83-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="flex-none text-white"
      style={{ shapeRendering: "geometricPrecision" }}
    >
      <path d="M6 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm0-1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
      <path d="M11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0-1a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
      <path d="M5.5 8C3.567 8 2 9.567 2 11.5a.5.5 0 0 0 1 0C3 10.12 4.12 9 5.5 9h1c1.38 0 2.5 1.12 2.5 2.5a.5.5 0 0 0 1 0C10 9.567 8.433 8 6.5 8h-1Z" />
      <path d="M11 8c-0.57 0-1.1.13-1.58.37a.5.5 0 1 0 .44.9A2.49 2.49 0 0 1 11 9c1.38 0 2.5 1.12 2.5 2.5a.5.5 0 0 0 1 0C14.5 9.567 12.933 8 11 8Z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: "Data", active: true },
  { label: "Automations", active: false },
  { label: "Interfaces", active: false },
  { label: "Forms", active: false },
] as const;

const SHADOW_LOW =
  "0px 0px 1px rgba(0,0,0,0.32), 0px 0px 2px rgba(0,0,0,0.08), 0px 1px 3px rgba(0,0,0,0.08)";
const SHADOW_LOW_HOVER =
  "0px 0px 1px rgba(0,0,0,0.32), 0px 0px 3px rgba(0,0,0,0.11), 0px 1px 4px rgba(0,0,0,0.12)";

const FONT_BODY =
  "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";
const FONT_HEADING =
  "'Inter Display', -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";

const FG_DEFAULT = "rgb(29, 31, 37)";
const FG_SUBTLE = "rgb(97, 102, 112)";
const GREEN_DUSTY = "rgb(64, 124, 74)";
const BORDER_DEFAULT = "rgba(0, 0, 0, 0.1)";
const DARKEN1 = "rgba(0, 0, 0, 0.05)";

export function TopBar({ baseName }: TopBarProps) {
  return (
    <header
      className="relative"
      style={{
        backgroundColor: "white",
        borderBottom: `1px solid ${BORDER_DEFAULT}`,
        fontFamily: FONT_BODY,
        fontSize: "13px",
        lineHeight: "18px",
        color: FG_DEFAULT,
        fontWeight: 400,
        boxSizing: "border-box",
      }}
    >
      {/* 3-column grid: left / center / right */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          height: "100%",
          minWidth: "600px",
          gap: "8px",
        }}
      >
        {/* Left: icon + base name */}
        <div
          className="flex items-center overflow-hidden"
          style={{ paddingLeft: "16px" }}
        >
          <div
            className="flex w-full flex-none items-center justify-start"
            style={{ gap: "8px" }}
          >
            {/* Base icon */}
            <div
              className="flex shrink-0 items-center justify-center"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: `1px solid ${BORDER_DEFAULT}`,
                backgroundColor: GREEN_DUSTY,
              }}
            >
              <div style={{ position: "relative", top: "2px" }}>
                <AirtableLogoIcon />
              </div>
            </div>

            {/* Base name + chevron */}
            <div
              className="flex min-w-0 items-center"
              style={{ maxWidth: "480px" }}
            >
              <button
                type="button"
                className="flex items-center rounded"
                style={{
                  minWidth: 0,
                  flex: "0 1 auto",
                  lineHeight: "18px",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
              >
                <div
                  className="truncate"
                  style={{
                    fontFamily: FONT_HEADING,
                    fontSize: "17px",
                    fontWeight: 800,
                    lineHeight: "24px",
                    minWidth: 0,
                    flex: "0 1 auto",
                    color: FG_DEFAULT,
                  }}
                >
                  {baseName}
                </div>
                <ChevronDownIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Center: nav items */}
        <ul
          className="relative flex items-stretch justify-center"
          style={{
            gap: "16px",
            padding: "0 8px",
            margin: 0,
            listStyle: "none",
            backgroundColor: "white",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className="relative flex items-center"
                style={{
                  height: "100%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <p
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "13px",
                    lineHeight: "24px",
                    fontWeight: 600,
                    padding: "16px 0",
                    margin: 0,
                    color: item.active ? FG_DEFAULT : FG_SUBTLE,
                  }}
                >
                  {item.label}
                </p>
                {item.active ? (
                  <div
                    className="absolute right-0 left-0"
                    style={{
                      bottom: "-1px",
                      height: "2px",
                      backgroundColor: GREEN_DUSTY,
                    }}
                  />
                ) : null}
              </button>
            </li>
          ))}
        </ul>

        {/* Right: actions */}
        <div
          className="flex items-center justify-end overflow-hidden"
          style={{ paddingRight: "16px" }}
        >
          <div className="inline-flex items-center" style={{ gap: "8px" }}>
            <div className="flex flex-none items-center" style={{ gap: "8px" }}>
              {/* History (ClockCounterClockwise) */}
              <button
                type="button"
                className="flex items-center justify-center rounded-full"
                style={{
                  width: "28px",
                  height: "28px",
                  color: FG_SUBTLE,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <ClockCounterClockwiseIcon />
              </button>

              {/* Trial pill */}
              <button
                type="button"
                className="flex items-baseline justify-center"
                style={{
                  borderRadius: "100px",
                  padding: "0 12px",
                  margin: "0 8px",
                  fontSize: "13px",
                  lineHeight: "18px",
                  fontWeight: 400,
                  color: FG_DEFAULT,
                  backgroundColor: DARKEN1,
                  whiteSpace: "nowrap",
                  border: "none",
                  cursor: "pointer",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Trial: 12 days left
              </button>

              {/* Launch (icon only) */}
              <button
                type="button"
                className="inline-flex items-center justify-center"
                style={{
                  borderRadius: "6px",
                  padding: "0 8px",
                  fontSize: "13px",
                  color: FG_DEFAULT,
                  backgroundColor: "white",
                  boxShadow: SHADOW_LOW,
                  border: "none",
                  cursor: "pointer",
                  height: "28px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = SHADOW_LOW_HOVER;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = SHADOW_LOW;
                }}
              >
                <SidebarPlayIcon />
              </button>

              {/* Copy link */}
              <button
                type="button"
                className="flex items-center justify-center"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  color: FG_DEFAULT,
                  backgroundColor: "white",
                  boxShadow: SHADOW_LOW,
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = SHADOW_LOW_HOVER;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = SHADOW_LOW;
                }}
              >
                <LinkIcon />
              </button>

              {/* Share (icon only, green bg) */}
              <button
                type="button"
                className="flex items-center"
                style={{
                  height: "28px",
                  borderRadius: "6px",
                  padding: "0 8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  lineHeight: "24px",
                  backgroundColor: GREEN_DUSTY,
                  boxShadow: SHADOW_LOW,
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = SHADOW_LOW_HOVER;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = SHADOW_LOW;
                }}
              >
                <UsersIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
