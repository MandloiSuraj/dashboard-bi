import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { colorFor } from "@/lib/palettes";
import { formatValue } from "@/lib/utils";
import { ChartTooltip } from "./ChartTooltip";
import type { ChartViewProps } from "./types";

export function AreaChartView({ config, data }: ChartViewProps) {
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
      <AreaChart data={data.data} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
        <defs>
          {data.measureIds.map((mid, idx) => {
            const c = config.measures[idx].color ?? colorFor(opts.palette, idx);
            return (
              <linearGradient key={mid} id={`grad-${mid}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={c} stopOpacity={0.45} />
                <stop offset="100%" stopColor={c} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>
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
        {data.measureIds.map((mid, idx) => (
          <Area
            key={mid}
            type={opts.smooth === false ? "linear" : "monotone"}
            dataKey={mid}
            stroke={config.measures[idx].color ?? colorFor(opts.palette, idx)}
            fill={`url(#grad-${mid})`}
            strokeWidth={2}
            stackId={opts.stacked ? "a" : undefined}
            isAnimationActive
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
