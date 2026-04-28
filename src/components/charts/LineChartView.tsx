import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Brush,
} from "recharts";
import { colorFor } from "@/lib/palettes";
import { formatValue } from "@/lib/utils";
import { ChartTooltip } from "./ChartTooltip";
import type { ChartViewProps } from "./types";

interface Props extends ChartViewProps {
  variant: "line" | "timeSeries";
}

export function LineChartView({ config, data, onDrill, variant }: Props) {
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
      <LineChart data={data.data} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
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
          cursor={{ stroke: "hsl(var(--ring))", strokeWidth: 1, strokeDasharray: "3 3" }}
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
          <Line
            key={mid}
            type={opts.smooth === false ? "linear" : "monotone"}
            dataKey={mid}
            stroke={config.measures[idx].color ?? colorFor(opts.palette, idx)}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, onClick: (_, e) => onDrill?.(e) }}
            isAnimationActive
          />
        ))}
        {variant === "timeSeries" && data.data.length > 30 && (
          <Brush
            dataKey="__label"
            height={20}
            travellerWidth={8}
            stroke="hsl(var(--primary))"
            fill="hsl(var(--muted))"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
