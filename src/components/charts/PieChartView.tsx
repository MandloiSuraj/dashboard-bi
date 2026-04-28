import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { colorFor } from "@/lib/palettes";
import { formatValue } from "@/lib/utils";
import { ChartTooltip } from "./ChartTooltip";
import type { ChartViewProps } from "./types";

interface Props extends ChartViewProps {
  variant: "pie" | "donut";
}

export function PieChartView({ config, data, variant }: Props) {
  const opts = config.options ?? {};
  const valueKey = data.measureIds[0];
  const measure = config.measures[0];
  const measureField = data.dataset?.fields.find((f) => f.key === measure?.fieldKey);
  const total = data.data.reduce((acc, d) => acc + (d[valueKey] ?? 0), 0);
  const measureFields: Record<string, any> = { [valueKey]: measureField };
  const measureLabels: Record<string, string> = { [valueKey]: data.measureLabels[0] };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <Tooltip
          content={
            <ChartTooltip measureFields={measureFields} measureLabels={measureLabels} />
          }
        />
        <Pie
          data={data.data}
          dataKey={valueKey}
          nameKey="__label"
          innerRadius={variant === "donut" ? "62%" : 0}
          outerRadius="90%"
          paddingAngle={2}
          stroke="hsl(var(--card))"
          strokeWidth={2}
          isAnimationActive
        >
          {data.data.map((_, idx) => (
            <Cell key={idx} fill={colorFor(opts.palette, idx)} />
          ))}
        </Pie>
        {variant === "donut" && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="hsl(var(--foreground))"
            style={{ fontSize: 18, fontWeight: 600 }}
          >
            {formatValue(total, measureField?.format ?? "number", { compact: true })}
          </text>
        )}
        {opts.showLegend !== false && (
          <Legend
            iconType="circle"
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: 12 }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
