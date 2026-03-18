"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const FIELD_TYPES = [
  { type: "TEXT" as const, label: "Single line text", icon: "text" },
  { type: "LONG_TEXT" as const, label: "Long text", icon: "paragraph" },
  { type: "NUMBER" as const, label: "Number", icon: "number" },
] as const;

const TEXT_DESCRIPTION =
  "Enter text, or prefill each new cell with a default value.";
const LONG_TEXT_DESCRIPTION = "Enter multiple lines of text.";
const NUMBER_DESCRIPTION =
  "Enter a number, or prefill each new cell with a default value.";

function IconChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" aria-hidden="true">
      <path d="M3.22 5.72a.75.75 0 0 1 1.06 0L8 9.44l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 6.78a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function IconMagnifyingGlass() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" aria-hidden="true">
      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
    </svg>
  );
}

function IconQuestion() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" aria-hidden="true">
      <path d="M8 1.5a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 8 1.5ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-2.75a1 1 0 0 0-.956.703.75.75 0 1 1-1.432-.452 2.5 2.5 0 1 1 3.127 3.153.75.75 0 0 1-.739.596.75.75 0 0 1-.75-.75V8a.75.75 0 0 1 .75-.75 1 1 0 1 0 0-2ZM7.25 11a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Z" />
    </svg>
  );
}

function IconTextAlt() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" aria-hidden="true">
      <path d="M4.75 2.5a.75.75 0 0 1 .75.75v9.5a.75.75 0 0 1-1.5 0v-9.5a.75.75 0 0 1 .75-.75Zm6.5 0a.75.75 0 0 1 .75.75v9.5a.75.75 0 0 1-1.5 0v-9.5a.75.75 0 0 1 .75-.75ZM2 4.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" />
    </svg>
  );
}

function IconParagraph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" aria-hidden="true">
      <path d="M2 4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 4Zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 7Zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 10Zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 2 13Z" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" aria-hidden="true">
      <path d="M8 3a.5.5 0 0 1 .5.5v4h4a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0v-4h-4a.5.5 0 0 1 0-1h4v-4A.5.5 0 0 1 8 3Z" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" aria-hidden="true">
      <path d="M8 1.5a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 8 1.5ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-2.75a1 1 0 0 0-.956.703.75.75 0 1 1-1.432-.452 2.5 2.5 0 1 1 3.127 3.153.75.75 0 0 1-.739.596.75.75 0 0 1-.75-.75V8a.75.75 0 0 1 .75-.75 1 1 0 1 0 0-2ZM7.25 11a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Z" />
    </svg>
  );
}

function IconHash() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-none" aria-hidden="true">
      <path d="M5.5 1a.5.5 0 0 1 .492.592L5.73 3H8a.5.5 0 0 1 0 1H5.564l-.5 3H7.5a.5.5 0 0 1 0 1H4.897l-.39 2.408a.5.5 0 1 1-.986-.16L3.864 8H2a.5.5 0 0 1 0-1h2.03l.5-3H3a.5.5 0 0 1 0-1h1.697l.31-1.908A.5.5 0 0 1 5.5 1Zm5 0a.5.5 0 0 1 .492.592L10.73 3H13a.5.5 0 0 1 0 1h-2.436l-.5 3H12.5a.5.5 0 0 1 0 1H9.897l-.39 2.408a.5.5 0 1 1-.986-.16L8.864 8H7a.5.5 0 0 1 0-1h2.03l.5-3H8a.5.5 0 0 1 0-1h1.697l.31-1.908A.5.5 0 0 1 10.5 1Z" />
    </svg>
  );
}

function FieldTypeIcon({ icon }: Readonly<{ icon: "text" | "paragraph" | "number" }>) {
  if (icon === "text") return <IconTextAlt />;
  if (icon === "paragraph") return <IconParagraph />;
  return <IconHash />;
}

type FieldConfigOptions = {
  default?: string;
  decimalPlaces?: number;
  showThousandsSeparator?: boolean;
  thousandsSeparator?: string;
  decimalSeparator?: string;
  largeNumberAbbrev?: string;
};

type CreateFieldPanelProps = Readonly<{
  onSelect: (
    name: string,
    type: "TEXT" | "LONG_TEXT" | "NUMBER",
    options?: FieldConfigOptions,
  ) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}>;

export function CreateFieldPanel({
  onSelect,
  onClose,
  anchorRef,
}: CreateFieldPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<
    (typeof FIELD_TYPES)[number] | null
  >(null);
  const [fieldName, setFieldName] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [enableRichText, setEnableRichText] = useState(false);
  // Number formatting
  const [decimalPlaces, setDecimalPlaces] = useState(1);
  const [showThousandsSeparator, setShowThousandsSeparator] = useState(true);
  const [separatorPreset, setSeparatorPreset] = useState("local");
  const [largeNumberAbbrev, setLargeNumberAbbrev] = useState("none");
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [anchorRef]);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClose, anchorRef]);

  const filteredFields = FIELD_TYPES.filter((f) =>
    f.label.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelectType = (field: (typeof FIELD_TYPES)[number]) => {
    setSelectedType(field);
    setFieldName(
      field.type === "TEXT"
        ? "Text"
        : field.type === "LONG_TEXT"
          ? "Long text"
          : "Number",
    );
    setDefaultValue("");
    setEnableRichText(false);
    setDecimalPlaces(1);
    setShowThousandsSeparator(true);
    setSeparatorPreset("local");
    setLargeNumberAbbrev("none");
  };

  const handleCreate = () => {
    if (!selectedType) return;
    const name = fieldName.trim() || selectedType.label;
    const options: FieldConfigOptions = {};
    if (defaultValue.trim()) options.default = defaultValue.trim();
    if (selectedType.type === "NUMBER") {
      options.decimalPlaces = decimalPlaces;
      options.showThousandsSeparator = showThousandsSeparator;
      options.thousandsSeparator =
        separatorPreset === "local" ? "," : separatorPreset === "european" ? "." : "";
      options.decimalSeparator =
        separatorPreset === "local" ? "." : separatorPreset === "european" ? "," : ".";
      options.largeNumberAbbrev = largeNumberAbbrev;
    }
    if (selectedType.type === "LONG_TEXT" && enableRichText) {
      (options as Record<string, unknown>).richText = true;
    }
    onSelect(
      name,
      selectedType.type,
      Object.keys(options).length > 0 ? options : undefined,
    );
  };

  const handleBack = () => {
    setSelectedType(null);
    setFieldName("");
    setDefaultValue("");
  };

  if (!pos) return null;

  const panel = (
    <div
      ref={panelRef}
      data-popup
      role="dialog"
      aria-label="Create field"
      className="rounded-xl overflow-auto absolute bg-white"
      style={{
        position: "fixed",
        top: Math.min(pos.top, window.innerHeight - 300),
        left: Math.min(pos.left, window.innerWidth - 420),
        width: 400,
        minWidth: 400,
        maxWidth: 900,
        maxHeight: "min(500px, calc(100vh - 100px))",
        zIndex: 9999,
        fontFamily:
          "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      <div className="flex flex-col" style={{ maxHeight: "min(500px, calc(100vh - 100px))" }}>
        {selectedType ? (
          /* ── Config step ── */
          <div className="flex flex-1 flex-col overflow-auto">
            {/* Field name — Airtable-style px2 py1 */}
            <div className="px-4 pt-4 pb-1">
              <div className="flex w-full items-center">
                <input
                  type="text"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="Field name (optional)"
                  className="w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-[#1d1f25] placeholder-[#969ba5] outline-none focus:border-[#2a79ef] focus:ring-1 focus:ring-[#2a79ef]"
                  style={{ borderColor: "#e0e5ed" }}
                  autoFocus
                  aria-label="Field name (optional)"
                />
              </div>
            </div>

            {/* Field type selector — Airtable dropdown button style */}
            <div className="flex px-4" style={{ height: 32 }}>
              <button
                type="button"
                onClick={handleBack}
                className="flex flex-1 items-center gap-2 overflow-hidden rounded-lg border bg-white px-3 py-2 text-left shadow-sm outline-none transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#2a79ef] focus:ring-offset-0"
                style={{ borderColor: "#e0e5ed" }}
              >
                <span className="flex-none text-[#616670]">
                  <FieldTypeIcon icon={selectedType.icon} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#1d1f25]">
                  {selectedType.label}
                </span>
                <a
                  href="https://support.airtable.com/docs/supported-field-types-in-airtable-overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center text-[#97a0af] hover:text-[#616670]"
                  aria-label="Field types help"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconQuestion />
                </a>
                <span className="flex-none text-[#97a0af]">
                  <IconChevronDown />
                </span>
              </button>
            </div>

            {/* Description — muted text */}
            <p className="mt-2 px-4 text-[13px] text-[#616670]">
              {selectedType.type === "TEXT"
                ? TEXT_DESCRIPTION
                : selectedType.type === "LONG_TEXT"
                  ? LONG_TEXT_DESCRIPTION
                  : NUMBER_DESCRIPTION}
            </p>

            {/* LONG_TEXT: Formatting section */}
            {selectedType.type === "LONG_TEXT" && (
              <div className="px-4 py-2">
                <h2 className="mb-2 text-[13px] font-semibold text-[#1d1f25]">
                  Formatting
                </h2>
                <div className="flex items-center gap-2 py-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enableRichText}
                    onClick={() => setEnableRichText((v) => !v)}
                    className="relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
                    style={{
                      backgroundColor: enableRichText ? "#2a79ef" : "#c4c9d1",
                      padding: 2,
                    }}
                  >
                    <span
                      className="block h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                      style={{
                        transform: enableRichText
                          ? "translateX(16px)"
                          : "translateX(0)",
                      }}
                    />
                  </button>
                  <span className="flex-1 truncate text-[13px] text-[#1d1f25]">
                    Enable rich text formatting
                  </span>
                  <a
                    href="https://support.airtable.com/docs/using-rich-text-with-airtable"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-[#97a0af] hover:text-[#616670]"
                    aria-label="Rich text formatting help"
                  >
                    <IconQuestion />
                  </a>
                </div>
              </div>
            )}

            {/* TEXT/NUMBER: Default value (not for LONG_TEXT in Airtable style) */}
            {(selectedType.type === "TEXT" || selectedType.type === "NUMBER") && (
              <>
                <p className="mt-4 px-4 text-[13px] font-medium text-[#1d1f25]">
                  Default
                </p>
                <div className="px-4">
                  <input
                    type={selectedType.type === "NUMBER" ? "number" : "text"}
                    value={defaultValue}
                    onChange={(e) => setDefaultValue(e.target.value)}
                    placeholder={
                      selectedType.type === "TEXT"
                        ? "Enter default value (optional)"
                        : "Enter default number (optional)"
                    }
                    className="mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-[#1d1f25] placeholder-[#969ba5] outline-none focus:border-[#2a79ef] focus:ring-1 focus:ring-[#2a79ef]"
                    style={{ borderColor: "#e0e5ed" }}
                  />
                </div>
              </>
            )}

            {/* Number formatting */}
            {selectedType.type === "NUMBER" && (
              <div className="mt-4 px-4">
                <p className="text-[13px] font-medium text-[#1d1f25]">
                  Formatting
                </p>
                <div className="mt-2 space-y-3">
                  <div>
                    <label className="block text-[12px] text-[#616670]">
                      Presets
                    </label>
                    <select
                      className="mt-0.5 w-full rounded-lg border bg-white px-3 py-2 text-[13px] text-[#1d1f25] outline-none focus:border-[#2a79ef]"
                      style={{ borderColor: "#e0e5ed" }}
                      defaultValue="select"
                    >
                      <option value="select">Select a preset</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#616670]">
                      Decimal places
                    </label>
                    <select
                      className="mt-0.5 w-full rounded-lg border bg-white px-3 py-2 text-[13px] text-[#1d1f25] outline-none focus:border-[#2a79ef]"
                      style={{ borderColor: "#e0e5ed" }}
                      value={decimalPlaces}
                      onChange={(e) =>
                        setDecimalPlaces(Number(e.target.value))
                      }
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} ({n === 0 ? "0" : `1.${"0".repeat(n - 1)}`})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#616670]">
                      Thousands and decimal separators
                    </label>
                    <select
                      className="mt-0.5 w-full rounded-lg border bg-white px-3 py-2 text-[13px] text-[#1d1f25] outline-none focus:border-[#2a79ef]"
                      style={{ borderColor: "#e0e5ed" }}
                      value={separatorPreset}
                      onChange={(e) => setSeparatorPreset(e.target.value)}
                    >
                      <option value="local">Local (1,000,000.00)</option>
                      <option value="european">European (1.000.000,00)</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] text-[#1d1f25]">
                      Show thousands separator
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showThousandsSeparator}
                      onClick={() =>
                        setShowThousandsSeparator((v) => !v)
                      }
                      className="relative h-5 w-9 shrink-0 rounded-full transition-colors"
                      style={{
                        backgroundColor: showThousandsSeparator
                          ? "#2a79ef"
                          : "#c4c9d1",
                      }}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                        style={{
                          transform: showThousandsSeparator
                            ? "translateX(16px)"
                            : "translateX(0)",
                        }}
                      />
                    </button>
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#616670]">
                      Large number abbreviation
                    </label>
                    <select
                      className="mt-0.5 w-full rounded-lg border bg-white px-3 py-2 text-[13px] text-[#1d1f25] outline-none focus:border-[#2a79ef]"
                      style={{ borderColor: "#e0e5ed" }}
                      value={largeNumberAbbrev}
                      onChange={(e) => setLargeNumberAbbrev(e.target.value)}
                    >
                      <option value="none">None</option>
                      <option value="k">K (1,000)</option>
                      <option value="m">M (1,000,000)</option>
                      <option value="b">B (1,000,000,000)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {showDescription && (
              <div className="px-4 pb-2">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Field description"
                  className="w-full rounded-lg border bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2a79ef] focus:ring-1 focus:ring-[#2a79ef]"
                  style={{ borderColor: "#e0e5ed" }}
                />
              </div>
            )}

            {/* Action bar — Airtable style: Add description left, Cancel/Create right */}
            <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-2">
              <button
                type="button"
                onClick={() => setShowDescription((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-[#1d1f25] hover:bg-[#f7f8fa]"
                aria-label="Add description"
              >
                <IconPlus />
                <span>
                  {showDescription ? "Remove description" : "Add description"}
                </span>
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-3 py-2 text-[13px] text-[#1d1f25] hover:bg-[#f7f8fa]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="rounded-lg bg-[#2a79ef] px-3 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-[#2360c4]"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Type selection step ── */
          <div className="p-3">
            <div className="flex items-center gap-3 mb-2" style={{ height: 32 }}>
              <div
                className="flex flex-1 items-center rounded-lg border bg-[#f7f8fa]"
                style={{ borderColor: "#e0e5ed" }}
              >
                <label className="flex items-center px-3 text-[#97a0af]">
                  <IconMagnifyingGlass />
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find a field type"
                  className="flex-1 min-w-0 bg-transparent text-[13px] text-[#1d1f25] placeholder-[#969ba5] outline-none py-1.5 px-1 rounded-lg"
                  autoFocus
                />
              </div>
              <a
                href="https://support.airtable.com/docs/supported-field-types-in-airtable-overview"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-[#97a0af] hover:text-[#616670] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2a79ef] rounded"
                aria-label="Field types help"
              >
                <IconQuestion />
              </a>
            </div>

            <hr className="border-0 border-b border-[#e0e5ed] my-2 mx-0" />

            <p className="text-[13px] text-[#616670] font-normal mx-3 my-2">
              Field agents
            </p>
            <div className="flex flex-wrap gap-0">
              {[
                { icon: "file", color: "#16a34a", label: "Analyze attachment" },
                { icon: "buildings", color: "#2563eb", label: "Research companies" },
                { icon: "globe", color: "#9333ea", label: "Find image from web" },
                { icon: "image", color: "#ea580c", label: "Generate image" },
                { icon: "arrow", color: "#0d9488", label: "Deep match" },
                { icon: "cursor", color: "#9333ea", label: "Build prototype" },
                { icon: "ai", color: "#407c4a", label: "Create custom agent" },
                { icon: "squares", color: "#616670", label: "Browse catalog" },
              ].map((item) => (
                <div
                  key={item.label}
                  tabIndex={0}
                  role="button"
                  className="flex items-center p-3 rounded-lg w-1/2 cursor-default opacity-60"
                  style={{ pointerEvents: "none" }}
                  aria-disabled
                >
                  <span
                    className="w-4 h-4 rounded flex-none"
                    style={{ backgroundColor: item.color, opacity: 0.3 }}
                  />
                  <span className="ml-2 text-[13px] text-[#1d1f25]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <hr className="border-0 border-b border-[#e0e5ed] my-2 mx-0" />

            <p className="text-[13px] text-[#616670] font-normal mx-3 my-2">
              Standard fields
            </p>
            <div className="p-2 space-y-0.5">
              {filteredFields.map((field) => (
                <button
                  key={field.type}
                  type="button"
                  onClick={() => handleSelectType(field)}
                  className="flex items-center w-full p-3 px-3 rounded-lg text-left hover:bg-[#f7f8fa] active:bg-[#edf0f5] transition-colors"
                  data-field-type={field.type}
                >
                  <span className="flex-none text-[#616670]">
                    <FieldTypeIcon icon={field.icon} />
                  </span>
                  <span className="ml-2 flex-1 truncate text-[13px] text-[#1d1f25]">
                    {field.label}
                  </span>
                </button>
              ))}
              {filteredFields.length === 0 && (
                <div className="px-4 py-5 text-center text-[12px] text-[#969ba5]">
                  No field types found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom footer — Airtable style: Automate with agent */}
        <div
          className="m-2 flex shrink-0 items-center justify-between rounded-lg px-4 py-3"
          style={{
            backgroundColor: "#f0f2f5",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="flex h-5 w-5 items-center justify-center rounded"
              style={{ color: "#407c4a" }}
              aria-hidden
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a3 3 0 0 0-3 3v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V5a3 3 0 0 0-3-3Zm2 4a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a2 2 0 1 1 4 0v1ZM4 9a1 1 0 0 0-1 1v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3a1 1 0 0 0-1-1H4Zm1.5 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Z" />
              </svg>
            </span>
            <span className="text-[13px] text-[#1d1f25]">
              Automate this field with an agent
            </span>
            <button
              type="button"
              aria-label="Learn more about field agents"
              className="flex items-center text-[#97a0af] hover:text-[#616670]"
            >
              <IconInfo />
            </button>
          </div>
          <button
            type="button"
            className="rounded-lg border border-[#e0e5ed] bg-white px-3 py-1.5 text-[13px] text-[#1d1f25] shadow-sm hover:bg-[#f7f8fa]"
            aria-label="Convert to Field Agent"
          >
            Convert
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}

/* ── Edit Field Panel ── */

type EditFieldPanelProps = Readonly<{
  field: { id: string; name: string; type: string };
  position: { x: number; y: number };
  onSave: (fieldId: string, name: string) => void;
  onClose: () => void;
}>;

function getEditFieldTypeLabel(type: string): string {
  switch (type) {
    case "NUMBER":
      return "Number";
    case "LONG_TEXT":
      return "Long text";
    case "USER":
    case "COLLABORATOR":
      return "User";
    case "SELECT":
    case "SINGLE_SELECT":
      return "Single select";
    case "ATTACHMENT":
    case "MULTIPLE_ATTACHMENT":
      return "Attachment";
    case "DATE":
      return "Date";
    case "AI_TEXT":
      return "Long text (agent)";
    default:
      return "Single line text";
  }
}

function getEditFieldDescription(type: string): string {
  switch (type) {
    case "NUMBER":
      return "Enter a number, or prefill each new cell with a default value.";
    case "LONG_TEXT":
      return "Enter multiple lines of text.";
    default:
      return "Enter text.";
  }
}

function EditFieldTypeIcon({ type }: Readonly<{ type: string }>) {
  const props = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "currentColor",
    className: "flex-none",
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
    default:
      return (
        <svg {...props}>
          <path d="M2.5 3A.5.5 0 0 1 3 2.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H8.5V13a.5.5 0 0 1-1 0V4.5H3a.5.5 0 0 1-.5-.5V3Z" />
        </svg>
      );
  }
}

export function EditFieldPanel({
  field,
  position,
  onSave,
  onClose,
}: EditFieldPanelProps) {
  const [fieldName, setFieldName] = useState(field.name);
  const [showDescription, setShowDescription] = useState(false);
  const [description, setDescription] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const typeLabel = getEditFieldTypeLabel(field.type);
  const typeDescription = getEditFieldDescription(field.type);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSave = () => {
    const trimmed = fieldName.trim();
    if (trimmed && trimmed !== field.name) {
      onSave(field.id, trimmed);
    }
    onClose();
  };

  const top = Math.min(position.y, window.innerHeight - 320);
  const left = Math.min(position.x - 200, window.innerWidth - 420);

  const panel = (
    <div
      ref={panelRef}
      data-popup
      role="dialog"
      aria-label="Field customization"
      className="rounded-xl overflow-auto absolute bg-white"
      style={{
        position: "fixed",
        top,
        left: Math.max(4, left),
        width: 400,
        minWidth: 400,
        maxWidth: 900,
        zIndex: 9999,
        fontFamily:
          "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxShadow:
          "0 0 0 1px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      <div className="flex flex-col">
        {/* Field name input */}
        <div className="px-4 pt-4 pb-1">
          <div className="flex w-full items-center">
            <input
              ref={inputRef}
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              placeholder="Field name (optional)"
              className="w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-[#1d1f25] placeholder-[#969ba5] outline-none focus:border-[#2a79ef] focus:ring-1 focus:ring-[#2a79ef]"
              style={{ borderColor: "#e0e5ed" }}
              autoFocus
              aria-label="Field name (optional)"
            />
          </div>
        </div>

        {/* Field type display (read-only for now) */}
        <div className="flex px-4 pb-1" style={{ height: 32 }}>
          <div
            className="flex flex-1 items-center gap-2 overflow-hidden rounded-lg border bg-white px-3 py-2 shadow-sm"
            style={{ borderColor: "#e0e5ed" }}
          >
            <span className="flex-none text-[#616670]">
              <EditFieldTypeIcon type={field.type} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#1d1f25]">
              {typeLabel}
            </span>
            <span className="flex-none text-[#97a0af]">
              <IconChevronDown />
            </span>
          </div>
        </div>

        {/* Type description */}
        <p className="mt-1 px-4 text-[13px] text-[#616670]">
          {typeDescription}
        </p>

        {/* Description field */}
        {showDescription && (
          <div className="px-4 pt-2">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Field description"
              className="w-full rounded-lg border bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2a79ef] focus:ring-1 focus:ring-[#2a79ef]"
              style={{ borderColor: "#e0e5ed" }}
            />
          </div>
        )}

        {/* Action bar */}
        <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-4">
          <button
            type="button"
            onClick={() => setShowDescription((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-[#1d1f25] hover:bg-[#f7f8fa]"
            aria-label="Add description"
          >
            <IconPlus />
            <span>
              {showDescription ? "Remove description" : "Add description"}
            </span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-[13px] text-[#1d1f25] hover:bg-[#f7f8fa]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-[#2a79ef] px-3 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-[#2360c4]"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
