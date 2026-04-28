import { useMemo } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { aggregate } from "@/lib/aggregations";
import { applyFilters } from "@/lib/dataTransforms";
import { cn, formatValue } from "@/lib/utils";
import type { ChartViewProps } from "./types";

/**
 * KPI card with primary value, comparison delta, and a sparkline.
 * Comparison: latest half of the data vs. earlier half on the dataset's
 * primary date field.
 */
export function KpiCardView({ config, data }: ChartViewProps) {
  const measure = config.measures[0];
  const measureField = data.dataset?.fields.find((f) => f.key === measure?.fieldKey);

  const { value, delta, spark } = useMemo(() => {
    if (!data.dataset || !measure)
      return { value: 0, delta: null as number | null, spark: [] as number[] };
    const filtered = applyFilters(data.dataset.rows, data.effectiveFilters);
    const value = aggregate(filtered.map((r) => r[measure.fieldKey]), measure.aggregation);
    const dateField = data.dataset.fields.find((f) => f.type === "date");
    let delta: number | null = null;
    let spark: number[] = [];
    if (dateField) {
      const sorted = [...filtered]
        .filter((r) => r[dateField.key])
        .sort((a, b) => String(a[dateField.key]).localeCompare(String(b[dateField.key])));
      const buckets = new Map<string, any[]>();
      for (const row of sorted) {
        const key = String(row[dateField.key]).slice(0, 10);
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key)!.push(row);
      }
      const series = Array.from(buckets.values()).map((rows) =>
        aggregate(rows.map((r) => r[measure.fieldKey]), measure.aggregation)
      );
      spark = series.slice(-30);
      const half = Math.floor(series.length / 2);
      if (half) {
        const earlier = series.slice(0, half).reduce((a, b) => a + b, 0) / half;
        const later = series.slice(half).reduce((a, b) => a + b, 0) / (series.length - half);
        delta = earlier ? ((later - earlier) / earlier) * 100 : null;
      }
    }
    return { value, delta, spark };
  }, [data.dataset, data.effectiveFilters, measure]);

  const trendUp = (delta ?? 0) >= 0;
  const sparkPath = useMemo(() => {
    if (!spark.length) return "";
    const max = Math.max(...spark);
    const min = Math.min(...spark);
    const w = 200;
    const h = 48;
    return spark
      .map((v, i) => {
        const x = (i / (spark.length - 1)) * w;
        const y = h - ((v - min) / Math.max(1, max - min)) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }, [spark]);

  if (!measure) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select a measure to display
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between p-1">
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {data.measureLabels[0] ?? measure.fieldKey}
        </div>
        <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
          {formatValue(value, measureField?.format ?? "number", { compact: value > 100_000 })}
          {config.options?.unit && (
            <span className="ml-1 text-base font-normal text-muted-foreground">
              {config.options.unit}
            </span>
          )}
        </div>
        {delta !== null && Number.isFinite(delta) && (
          <div
            className={cn(
              "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trendUp
                ? "bg-emerald-500/15 text-emerald-500"
                : "bg-rose-500/15 text-rose-500"
            )}
          >
            {trendUp ? (
              <ArrowUp className="h-3 w-3" />
            ) : delta === 0 ? (
              <Minus className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {Math.abs(delta).toFixed(1)}% vs prior
          </div>
        )}
      </div>
      {sparkPath && (
        <svg viewBox="0 0 200 48" className="mt-2 h-12 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="kpi-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${sparkPath} L200,48 L0,48 Z`}
            fill="url(#kpi-grad)"
            stroke="none"
          />
          <path d={sparkPath} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} />
        </svg>
      )}
    </div>
  );
}
