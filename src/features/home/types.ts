import type { RouterOutputs } from "~/trpc/react";

export type HomeBase = RouterOutputs["base"]["list"][number];

export type GroupedBases = {
  today: HomeBase[];
  past7Days: HomeBase[];
};

export function groupBasesForHome(bases: HomeBase[]): GroupedBases {
  if (bases.length <= 1) {
    return { today: bases, past7Days: [] };
  }

  return {
    today: bases.slice(0, 1),
    past7Days: bases.slice(1),
  };
}

export function getOpenedLabel(index: number, group: "today" | "past7Days") {
  if (group === "today") {
    if (index === 0) return "Opened 19 minutes ago";
    return "Opened just now";
  }

  return index % 2 === 0 ? "Opened 23 hours ago" : "Opened yesterday";
}
