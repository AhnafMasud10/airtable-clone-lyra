import { BaseCard } from "./base-card";
import { getOpenedLabel, groupBasesForHome, type HomeBase } from "../types";

const accentColors = [
  "bg-[#4d7c5c]",
  "bg-[#c8a82e]",
  "bg-[#a67939]",
  "bg-[#5b7daa]",
];

type FilterValue = "today" | "past7" | "past30" | "anytime";

type BasesSectionProps = Readonly<{
  bases: HomeBase[];
  filter?: FilterValue;
}>;

function SectionGroup({
  title,
  bases,
  group,
  offset = 0,
}: Readonly<{
  title: string;
  bases: HomeBase[];
  group: "today" | "past7Days" | "past30Days";
  offset?: number;
}>) {
  if (bases.length === 0) return null;

  return (
    <div className="mb-[20px] flex w-full flex-col items-start">
      <h4 className="mb-[8px] text-[11px] font-semibold uppercase tracking-wide text-[#888]">
        {title}
      </h4>
      <div className="mt-[4px] w-full" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(286px, 1fr))", gap: 12 }}>
        {bases.map((base, index) => (
          <BaseCard
            key={base.id}
            base={base}
            openedLabel={getOpenedLabel(index, group)}
            accentClass={accentColors[(offset + index) % accentColors.length]!}
          />
        ))}
      </div>
    </div>
  );
}

export function BasesSection({ bases, filter = "anytime" }: BasesSectionProps) {
  const grouped = groupBasesForHome(bases);

  const showToday = filter === "anytime" || filter === "today";
  const showPast7 = filter === "anytime" || filter === "past7";
  const showPast30 = filter === "anytime" || filter === "past30";

  return (
    <>
      {showToday && (
        <SectionGroup title="Today" bases={grouped.today} group="today" />
      )}
      {showPast7 && (
        <SectionGroup
          title="Past 7 days"
          bases={grouped.past7Days}
          group="past7Days"
          offset={grouped.today.length}
        />
      )}
      {showPast30 && (
        <SectionGroup
          title="Past 30 days"
          bases={grouped.past30Days}
          group="past30Days"
          offset={grouped.today.length + grouped.past7Days.length}
        />
      )}
    </>
  );
}
