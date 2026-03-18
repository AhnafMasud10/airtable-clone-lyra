"use client";

type FieldTypeIconProps = Readonly<{
  type: string;
  disabled?: boolean;
}>;

export function FieldTypeIcon({ type, disabled }: FieldTypeIconProps) {
  const iconClass = disabled ? "text-[#b2bac5]" : "text-[rgb(97,102,112)]";
  const props = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "currentColor",
    className: `flex-none mr-1.5 ${iconClass}`,
    style: { shapeRendering: "geometricPrecision" as const },
  };
  switch (type) {
    case "NUMBER":
      return (
        <svg {...props}>
          <path d="M5.5 1a.5.5 0 0 1 .492.592L5.73 3H8a.5.5 0 0 1 0 1H5.564l-.5 3H7.5a.5.5 0 0 1 0 1H4.897l-.39 2.408a.5.5 0 1 1-.986-.16L3.864 8H2a.5.5 0 0 1 0-1h2.03l.5-3H3a.5.5 0 0 1 0-1h1.697l.31-1.908A.5.5 0 0 1 5.5 1Zm5 0a.5.5 0 0 1 .492.592L10.73 3H13a.5.5 0 0 1 0 1h-2.436l-.5 3H12.5a.5.5 0 0 1 0 1H9.897l-.39 2.408a.5.5 0 1 1-.986-.16L8.864 8H7a.5.5 0 0 1 0-1h2.03l.5-3H8a.5.5 0 0 1 0-1h1.697l.31-1.908A.5.5 0 0 1 10.5 1Z" />
        </svg>
      );
    case "LONG_TEXT":
      return (
        <svg {...props}>
          <path d="M2 4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 4Zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 7Zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 10Zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 2 13Z" />
        </svg>
      );
    case "USER":
    case "COLLABORATOR":
      return (
        <svg {...props}>
          <path d="M8 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm0 1a4 4 0 0 0-4 4 1 1 0 0 0 1 1h6a1 1 0 0 0 1-1 4 4 0 0 0-4-4Z" />
        </svg>
      );
    case "SELECT":
    case "SINGLE_SELECT":
      return (
        <svg {...props}>
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM5.22 6.22a.75.75 0 0 1 1.06 0L8 7.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0L5.22 7.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      );
    case "ATTACHMENT":
    case "MULTIPLE_ATTACHMENT":
      return (
        <svg {...props}>
          <path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12.5 2h-9ZM7 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-5ZM5 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-3Zm4-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4Z" />
        </svg>
      );
    case "DATE":
      return (
        <svg {...props}>
          <path d="M4.5 1a.5.5 0 0 1 .5.5V3h6V1.5a.5.5 0 0 1 1 0V3h1.5A1.5 1.5 0 0 1 15 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5v-9A1.5 1.5 0 0 1 2.5 3H4V1.5a.5.5 0 0 1 .5-.5ZM2.5 4a.5.5 0 0 0-.5.5V6h12V4.5a.5.5 0 0 0-.5-.5h-11ZM14 7H2v6.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V7Z" />
        </svg>
      );
    case "AI_TEXT":
      return (
        <svg {...props}>
          <path d="M2 4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 4Zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 7Zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 10Zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 2 13Z" />
          <circle cx="13" cy="3" r="2" fill="#7c3aed" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="M2.5 3A.5.5 0 0 1 3 2.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H8.5V13a.5.5 0 0 1-1 0V4.5H3a.5.5 0 0 1-.5-.5V3Z" />
        </svg>
      );
  }
}
