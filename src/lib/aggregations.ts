import type { Aggregation } from "@/types";

/**
 * Reduce an array of raw values into a single aggregated number.
 * The aggregation set here mirrors the SQL primitives most BI tools expose.
 */
export function aggregate(values: any[], agg: Aggregation): number {
  if (agg === "count") return values.length;
  if (agg === "countDistinct") return new Set(values).size;

  const nums = values
    .map((v) => (typeof v === "number" ? v : Number(v)))
    .filter((v) => !Number.isNaN(v));

  if (!nums.length) return 0;

  switch (agg) {
    case "sum":
      return nums.reduce((a, b) => a + b, 0);
    case "avg":
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    case "min":
      return Math.min(...nums);
    case "max":
      return Math.max(...nums);
    case "median": {
      const sorted = [...nums].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
    default:
      return 0;
  }
}

export const AGGREGATION_LABELS: Record<Aggregation, string> = {
  sum: "Sum",
  avg: "Average",
  count: "Count",
  countDistinct: "Distinct Count",
  min: "Min",
  max: "Max",
  median: "Median",
};

export const AGGREGATIONS: Aggregation[] = [
  "sum",
  "avg",
  "count",
  "countDistinct",
  "min",
  "max",
  "median",
];
