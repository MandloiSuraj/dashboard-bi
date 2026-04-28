import { useMemo } from "react";
import { formatValue } from "@/lib/utils";
import type { ChartViewProps } from "./types";

/**
 * Heatmap built from a 2-dimensional aggregated series. Renders an SVG
 * matrix with intensity-based fills. Hover labels show the exact value.
 */
export function HeatmapView({ config, data }: ChartViewProps) {
  const measureField = data.dataset?.fields.find(
    (f) => f.key === config.measures[0]?.fieldKey
  );

  const cells = useMemo(() => {
    const points: { x: string; y: string; v: number }[] = [];
    data.data.forEach((row) => {
      data.series.forEach((s) => {
        points.push({ x: row.__label, y: s, v: Number(row[s]) || 0 });
      });
    });
    return points;
  }, [data]);

  if (!data.data.length || !data.series.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Heatmap needs two dimensions and one measure.
      </div>
    );
  }

  const xs = data.data.map((d) => d.__label);
  const ys = data.series;
  const min = Math.min(...cells.map((c) => c.v));
  const max = Math.max(...cells.map((c) => c.v));
  const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));

  return (
    <div className="flex h-full w-full flex-col p-2">
      <div className="flex flex-1 overflow-auto">
        <table className="w-full border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-card" />
              {xs.map((x) => (
                <th
                  key={x}
                  className="px-1 pb-1 text-left font-normal text-muted-foreground"
                >
                  <div className="truncate" title={x}>
                    {x}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ys.map((y) => (
              <tr key={y}>
                <td className="sticky left-0 bg-card pr-2 text-muted-foreground whitespace-nowrap">
                  {y}
                </td>
                {xs.map((x) => {
                  const cell = cells.find((c) => c.x === x && c.y === y);
                  const t = norm(cell?.v ?? 0);
                  const bg = `hsl(258 90% ${Math.max(20, 80 - t * 55)}% / ${0.18 + t * 0.82})`;
                  return (
                    <td
                      key={x}
                      title={`${y} · ${x}: ${formatValue(cell?.v ?? 0, measureField?.format ?? "number")}`}
                      className="rounded-md text-center font-medium text-white/90 transition-transform duration-150 hover:scale-[1.04]"
                      style={{
                        background: bg,
                        minWidth: 40,
                        height: 28,
                        color: t > 0.55 ? "white" : "hsl(var(--foreground))",
                      }}
                    >
                      {formatValue(cell?.v ?? 0, measureField?.format ?? "number", { compact: true })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
