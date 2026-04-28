import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { colorFor } from "@/lib/palettes";
import { formatValue } from "@/lib/utils";
import { ChartTooltip } from "./ChartTooltip";
import type { ChartViewProps } from "./types";

/**
 * Combo chart with independent left/right Y axes. Each measure can specify
 * `yAxis: "left" | "right"` and `variant: "line" | "bar" | "area"` to mix
 * representations on the same chart.
 */
export function MultiAxisChartView({ config, data }: ChartViewProps) {
  const opts = config.options ?? {};
  const measureFields: Record<string, any> = {};
  const measureLabelMap: Record<string, string> = {};
  data.measureIds.forEach((id, idx) => {
    const m = config.measures[idx];
    measureFields[id] = data.dataset?.fields.find((f) => f.key === m.fieldKey);
    measureLabelMap[id] = data.measureLabels[idx];
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data.data} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
        {opts.showGrid !== false && (
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 4" vertical={false} />
        )}
        <XAxis
          dataKey="__label"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatValue(v, "number", { compact: true })}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatValue(v, "number", { compact: true })}
        />
        <Tooltip
          cursor={{ stroke: "hsl(var(--ring))", strokeDasharray: "3 3" }}
          content={
            <ChartTooltip
              measureFields={measureFields}
              measureLabels={measureLabelMap}
            />
          }
        />
        {opts.showLegend !== false && (
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
            formatter={(v) => measureLabelMap[v as string] ?? v}
          />
        )}
        {data.measureIds.map((mid, idx) => {
          const m = config.measures[idx];
          const color = m.color ?? colorFor(opts.palette, idx);
          const variant = m.variant ?? (idx === 0 ? "bar" : "line");
          const yAxisId = m.yAxis ?? (idx === 0 ? "left" : "right");
          if (variant === "bar") {
            return (
              <Bar
                key={mid}
                dataKey={mid}
                yAxisId={yAxisId}
                fill={color}
                radius={[6, 6, 0, 0]}
              />
            );
          }
          if (variant === "area") {
            return (
              <Area
                key={mid}
                dataKey={mid}
                yAxisId={yAxisId}
                stroke={color}
                fill={color}
                fillOpacity={0.18}
                type="monotone"
              />
            );
          }
          return (
            <Line
              key={mid}
              dataKey={mid}
              yAxisId={yAxisId}
              stroke={color}
              strokeWidth={2}
              dot={false}
              type="monotone"
            />
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
