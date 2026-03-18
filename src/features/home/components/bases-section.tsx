import { BaseCard } from "./base-card";
import { getOpenedLabel, groupBasesForHome, type HomeBase } from "../types";

const accentColors = [
  "bg-[#4d7c5c]",
  "bg-[#c8a82e]",
  "bg-[#a67939]",
  "bg-[#5b7daa]",
];

type BasesSectionProps = Readonly<{
  bases: HomeBase[];
}>;

function SectionGroup({
  title,
  bases,
  group,
  offset = 0,
}: Readonly<{
  title: string;
  bases: HomeBase[];
  group: "today" | "past7Days";
  offset?: number;
}>) {
  if (bases.length === 0) return null;

  return (
    <section className="mb-5">
      <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-[#888]">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {bases.map((base, index) => (
          <BaseCard
            key={base.id}
            base={base}
            openedLabel={getOpenedLabel(index, group)}
            accentClass={accentColors[(offset + index) % accentColors.length]!}
          />
        ))}
      </div>
    </section>
  );
}

export function BasesSection({ bases }: BasesSectionProps) {
  const grouped = groupBasesForHome(bases);

  return (
    <div className="mt-2">
      <SectionGroup title="Today" bases={grouped.today} group="today" />
      <SectionGroup
        title="Past 7 days"
        bases={grouped.past7Days}
        group="past7Days"
        offset={grouped.today.length}
      />
    </div>
  );
}
