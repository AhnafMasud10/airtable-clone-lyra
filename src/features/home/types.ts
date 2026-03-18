import type { RouterOutputs } from "~/trpc/react";

export type HomeBase = RouterOutputs["base"]["list"][number];

export type GroupedBases = {
  today: HomeBase[];
  past7Days: HomeBase[];
  past30Days: HomeBase[];
};

export function groupBasesForHome(bases: HomeBase[]): GroupedBases {
  if (bases.length === 0) {
    return { today: [], past7Days: [], past30Days: [] };
  }

  if (bases.length === 1) {
    return { today: bases, past7Days: [], past30Days: [] };
  }

  if (bases.length === 2) {
    return { today: bases.slice(0, 1), past7Days: bases.slice(1, 2), past30Days: [] };
  }

  return {
    today: bases.slice(0, 1),
    past7Days: bases.slice(1, 2),
    past30Days: bases.slice(2),
  };
}

export function getOpenedLabel(index: number, group: "today" | "past7Days" | "past30Days") {
  if (group === "today") {
    return "Open data";
  }

  if (group === "past7Days") {
    return "Opened 2 days ago";
  }

  if (index === 0) return "Opened 8 days ago";
  return `Opened ${8 + index} days ago`;
}
