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
    return "Opened just now";
  }

  if (index === 0) return "Opened yesterday";
  return "Opened 7 days ago";
}
