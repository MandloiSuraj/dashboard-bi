import { formatValue } from "@/lib/utils";
import type { Field } from "@/types";

interface TooltipPayload {
  name?: string;
  dataKey?: string;
  value?: number;
  color?: string;
  payload?: any;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayload[];
  /** Lookup of measureId -> field, for value formatting. */
  measureFields?: Record<string, Field | undefined>;
  /** Lookup of measureId -> human label. */
  measureLabels?: Record<string, string>;
}

/** Shared dark/light tooltip used across all chart types for a consistent feel. */
export function ChartTooltip({
  active,
  label,
  payload,
  measureFields,
  measureLabels,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      {label !== undefined && (
        <div className="mb-1 font-medium text-foreground/90">{String(label)}</div>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((p, idx) => {
          const key = String(p.dataKey ?? p.name ?? idx);
          const niceLabel = measureLabels?.[key] ?? p.name ?? key;
          const field = measureFields?.[key];
          return (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.color ?? "currentColor" }}
                />
                <span className="text-muted-foreground">{niceLabel}</span>
              </div>
              <span className="font-medium tabular-nums">
                {formatValue(p.value ?? 0, field?.format ?? "number")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
