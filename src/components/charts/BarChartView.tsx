import {
  Bar,
  BarChart,
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

interface Props extends ChartViewProps {
  stacked: boolean;
}

export function BarChartView({ config, data, stacked, onDrill }: Props) {
  const opts = config.options ?? {};
  const usingPivot = data.series.length > 0;
  const seriesKeys = usingPivot ? data.series : data.measureIds;
  const measureFields: Record<string, any> = {};
  const measureLabelMap: Record<string, string> = {};
  if (!usingPivot) {
    data.measureIds.forEach((id, idx) => {
      const m = config.measures[idx];
      measureFields[id] = data.dataset?.fields.find((f) => f.key === m.fieldKey);
      measureLabelMap[id] = data.measureLabels[idx];
    });
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data.data} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
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
          cursor={{ fill: "hsl(var(--accent))", opacity: 0.35 }}
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
            formatter={(v) => (usingPivot ? v : measureLabelMap[v as string] ?? v)}
          />
        )}
        {seriesKeys.map((key, idx) => (
          <Bar
            key={key}
            dataKey={key}
            stackId={stacked ? "a" : undefined}
            fill={!usingPivot ? config.measures[idx]?.color ?? colorFor(opts.palette, idx) : colorFor(opts.palette, idx)}
            radius={stacked ? [0, 0, 0, 0] : [6, 6, 0, 0]}
            onClick={(e) => onDrill?.(e)}
            isAnimationActive
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
