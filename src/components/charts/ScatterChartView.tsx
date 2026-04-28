import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  Legend,
} from "recharts";
import { applyFilters } from "@/lib/dataTransforms";
import { colorFor } from "@/lib/palettes";
import { formatValue } from "@/lib/utils";
import { ChartTooltip } from "./ChartTooltip";
import type { ChartViewProps } from "./types";

/**
 * Scatter charts work differently from grouped charts: every row in the
 * dataset becomes a point. So this view bypasses the aggregated `data.data`
 * and rebuilds points directly from the (filtered) raw rows.
 */
export function ScatterChartView({ config, data }: ChartViewProps) {
  const opts = config.options ?? {};
  const x = config.measures[0];
  const y = config.measures[1];
  const z = config.measures[2];
  if (!x || !y || !data.dataset) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Scatter charts need at least 2 measures.
      </div>
    );
  }
  const xField = data.dataset.fields.find((f) => f.key === x.fieldKey);
  const yField = data.dataset.fields.find((f) => f.key === y.fieldKey);
  const groupKey = config.dimensions[0];
  const filteredRows = applyFilters(data.dataset.rows, data.effectiveFilters).slice(0, 1500);
  const groups = new Map<string, any[]>();
  for (const row of filteredRows) {
    const k = groupKey ? String(row[groupKey] ?? "All") : "All";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push({
      x: row[x.fieldKey],
      y: row[y.fieldKey],
      z: z ? row[z.fieldKey] : 50,
      raw: row,
    });
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
        {opts.showGrid !== false && (
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 4" />
        )}
        <XAxis
          type="number"
          dataKey="x"
          name={xField?.label}
          tick={{ fontSize: 11 }}
          stroke="hsl(var(--muted-foreground))"
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatValue(v, xField?.format ?? "number", { compact: true })}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={yField?.label}
          tick={{ fontSize: 11 }}
          stroke="hsl(var(--muted-foreground))"
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatValue(v, yField?.format ?? "number", { compact: true })}
        />
        <ZAxis type="number" dataKey="z" range={[40, 280]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={({ active, payload }: any) => {
            if (!active || !payload?.length) return null;
            const p = payload[0]?.payload;
            return (
              <div className="rounded-lg border border-border/60 bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
                <div className="font-medium">
                  {p?.raw?.[groupKey] ?? "Point"}
                </div>
                <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-muted-foreground">
                  <span>{xField?.label}</span>
                  <span className="text-right text-foreground tabular-nums">
                    {formatValue(p?.x, xField?.format)}
                  </span>
                  <span>{yField?.label}</span>
                  <span className="text-right text-foreground tabular-nums">
                    {formatValue(p?.y, yField?.format)}
                  </span>
                </div>
              </div>
            );
          }}
        />
        {opts.showLegend !== false && groupKey && (
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        )}
        {Array.from(groups.entries()).map(([name, points], idx) => (
          <Scatter
            key={name}
            name={name}
            data={points}
            fill={colorFor(opts.palette, idx)}
            fillOpacity={0.7}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
