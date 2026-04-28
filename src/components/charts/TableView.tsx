import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { applyFilters } from "@/lib/dataTransforms";
import { aggregate } from "@/lib/aggregations";
import { formatValue, cn } from "@/lib/utils";
import type { ChartViewProps } from "./types";

/**
 * Generic data grid. If both dimensions and measures are configured, rows are
 * grouped by the dimension(s) and measures aggregate. Otherwise the raw rows
 * are listed (capped to keep DOM small).
 */
export function TableView({ config, data }: ChartViewProps) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const rows = useMemo(() => {
    if (!data.dataset) return [] as Record<string, any>[];
    const filtered = applyFilters(data.dataset.rows, data.effectiveFilters);
    // Group when there are dimensions + measures.
    if (config.dimensions.length && config.measures.length) {
      const buckets = new Map<string, Record<string, any>[]>();
      for (const row of filtered) {
        const key = config.dimensions.map((d) => row[d]).join("__");
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key)!.push(row);
      }
      return Array.from(buckets.values()).map((group) => {
        const out: Record<string, any> = {};
        config.dimensions.forEach((d) => (out[d] = group[0][d]));
        config.measures.forEach((m) => {
          const key = `${m.aggregation}__${m.fieldKey}`;
          out[key] = aggregate(group.map((r) => r[m.fieldKey]), m.aggregation);
        });
        return out;
      });
    }
    return filtered.slice(0, 500);
  }, [config, data.dataset, data.effectiveFilters]);

  const columns = useMemo(() => {
    if (config.dimensions.length || config.measures.length) {
      const dimCols = config.dimensions.map((d) => {
        const f = data.dataset?.fields.find((fd) => fd.key === d);
        return { key: d, label: f?.label ?? d, format: f?.format, isMeasure: false };
      });
      const measureCols = config.measures.map((m, idx) => {
        const f = data.dataset?.fields.find((fd) => fd.key === m.fieldKey);
        return {
          key: `${m.aggregation}__${m.fieldKey}`,
          label: data.measureLabels[idx],
          format: f?.format,
          isMeasure: true,
        };
      });
      return [...dimCols, ...measureCols];
    }
    return (
      data.dataset?.fields.slice(0, 8).map((f) => ({
        key: f.key,
        label: f.label,
        format: f.format,
        isMeasure: f.role === "measure",
      })) ?? []
    );
  }, [config, data]);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const sorted = [...rows].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "number" && typeof bv === "number") {
        return sort.dir === "asc" ? av - bv : bv - av;
      }
      return sort.dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return sorted;
  }, [rows, sort]);

  const toggleSort = (key: string) =>
    setSort((s) =>
      !s || s.key !== key
        ? { key, dir: "desc" }
        : s.dir === "desc"
        ? { key, dir: "asc" }
        : null
    );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto rounded-md">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card/95 backdrop-blur">
            <tr className="border-b border-border/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className={cn(
                    "cursor-pointer select-none px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground",
                    col.isMeasure && "text-right"
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sort?.key === col.key ? (
                      sort.dir === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-30" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((r, idx) => (
              <tr
                key={idx}
                className="group border-b border-border/30 transition-colors hover:bg-accent/40"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-2 align-middle",
                      col.isMeasure && "text-right tabular-nums"
                    )}
                  >
                    {formatValue(r[col.key], col.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border/40 px-3 py-1.5 text-[11px] text-muted-foreground">
        {sortedRows.length.toLocaleString()} rows
      </div>
    </div>
  );
}
