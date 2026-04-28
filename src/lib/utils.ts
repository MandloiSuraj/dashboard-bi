import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a numeric value with the field's hint. */
export function formatValue(
  value: number | string | null | undefined,
  format?: "currency" | "percent" | "number" | "date" | "shortDate",
  options?: { compact?: boolean }
): string {
  if (value === null || value === undefined) return "—";
  if (format === "date" || format === "shortDate") {
    if (!value) return "—";
    const d = new Date(value as string);
    if (isNaN(d.getTime())) return String(value);
    if (format === "shortDate") {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return d.toLocaleDateString();
  }
  if (typeof value !== "number") {
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    value = n;
  }
  if (format === "percent") {
    return `${value.toFixed(value > 100 ? 0 : 1)}%`;
  }
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: options?.compact ? 1 : 0,
      notation: options?.compact ? "compact" : "standard",
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    notation: options?.compact ? "compact" : "standard",
  }).format(value);
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
