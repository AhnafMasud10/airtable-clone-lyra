import { BaseCard } from "./base-card";
import { CreateBaseButton } from "./create-base-button";
import { getOpenedLabel, groupBasesForHome, type HomeBase } from "../types";

const accentColors = ["bg-[#3f9150]", "bg-[#f0b400]", "bg-[#a76d10]"];

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
    <section className="mt-4">
      <h3 className="mb-2 text-sm font-medium text-[#57606a]">{title}</h3>
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
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-[#57606a]">
          Your bases
        </span>
        <CreateBaseButton compact />
      </div>

      <SectionGroup title="Recent" bases={grouped.today} group="today" />
      <SectionGroup
        title="More"
        bases={grouped.past7Days}
        group="past7Days"
        offset={grouped.today.length}
      />
    </div>
  );
}
