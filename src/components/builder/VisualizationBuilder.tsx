import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AreaChart,
  BarChart3,
  BarChart4,
  CircleDot,
  Database,
  Gauge,
  Grid3x3,
  Hash,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterChart,
  Sparkles,
  Table as TableIcon,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartRenderer } from "@/components/charts/ChartRenderer";
import { datasetRegistry } from "@/data/datasetRegistry";
import { CHART_REGISTRY, getChartMeta } from "@/lib/chartRegistry";
import { AGGREGATIONS, AGGREGATION_LABELS } from "@/lib/aggregations";
import { useDashboardStore } from "@/store/dashboardStore";
import type { ChartConfig, ChartType, MeasureConfig } from "@/types";
import { cn } from "@/lib/utils";

const CHART_ICONS: Record<ChartType, LucideIcon> = {
  line: LineChartIcon,
  bar: BarChart3,
  stackedBar: BarChart4,
  area: AreaChart,
  pie: PieChartIcon,
  donut: CircleDot,
  scatter: ScatterChart,
  heatmap: Grid3x3,
  table: TableIcon,
  kpi: Gauge,
  multiAxis: Activity,
  timeSeries: TrendingUp,
};

/**
 * Three-pane visualization builder:
 *   1. Left: Dataset & Field picker
 *   2. Middle: Live preview
 *   3. Right: Chart type & options
 *
 * The builder mutates a `draft` ChartConfig held in the dashboard store. On
 * save, the draft is persisted as a widget (or replaces the editing widget).
 */
export function VisualizationBuilder() {
  const draft = useDashboardStore((s) => s.builderDraft);
  const editingId = useDashboardStore((s) => s.builderEditingWidgetId);
  const setDraft = useDashboardStore((s) => s.setBuilderDraft);
  const closeBuilder = useDashboardStore((s) => s.closeBuilder);
  const saveBuilderDraft = useDashboardStore((s) => s.saveBuilderDraft);
  const dashboards = useDashboardStore((s) => s.dashboards);
  const activeId = useDashboardStore((s) => s.activeDashboardId);

  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!draft) return;
    if (editingId) {
      const w = dashboards
        .find((d) => d.id === activeId)
        ?.widgets.find((x) => x.id === editingId);
      setTitle(w?.title ?? "Untitled chart");
    } else {
      setTitle(suggestTitle(draft));
    }
  }, [draft, editingId]);

  const open = !!draft;
  const dataset = draft ? datasetRegistry.get(draft.datasetId) : undefined;
  const dimensions = dataset?.fields.filter((f) => f.role === "dimension") ?? [];
  const measures = dataset?.fields.filter((f) => f.role === "measure") ?? [];
  const meta = draft ? getChartMeta(draft.chartType) : undefined;

  if (!draft) return null;

  const update = (patch: Partial<ChartConfig>) =>
    setDraft({ ...draft, ...patch });
  const setOption = (k: string, v: any) =>
    update({ options: { ...(draft.options ?? {}), [k]: v } });
  const setMeasure = (idx: number, patch: Partial<MeasureConfig>) =>
    update({ measures: draft.measures.map((m, i) => (i === idx ? { ...m, ...patch } : m)) });
  const removeMeasure = (idx: number) =>
    update({ measures: draft.measures.filter((_, i) => i !== idx) });

  const canSave =
    !!dataset &&
    !!meta &&
    draft.dimensions.length >= meta.minDimensions &&
    draft.measures.length >= meta.minMeasures;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) closeBuilder();
      }}
    >
      <DialogContent className="max-w-[1100px] gap-0 p-0 sm:max-w-[1100px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 shadow-lg shadow-violet-500/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <DialogTitle>
                {editingId ? "Edit visualization" : "Build a visualization"}
              </DialogTitle>
              <DialogDescription>
                Choose a dataset, drag fields onto axes, and pick the chart that
                tells the story.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-0 border-t border-border/40">
          {/* LEFT — data panel */}
          <div className="col-span-3 border-r border-border/40 px-3 py-3">
            <div className="mb-2">
              <Label>Dataset</Label>
              <Select
                value={draft.datasetId}
                onValueChange={(v) => update({ datasetId: v, dimensions: [], measures: [] })}
              >
                <SelectTrigger className="mt-1.5 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {datasetRegistry.list().map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <span className="flex items-center gap-2">
                        <Database className="h-3.5 w-3.5 opacity-60" />
                        {d.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-3">
              <Label>Dimensions</Label>
              <div className="mt-1.5 max-h-40 space-y-1 overflow-y-auto rounded-md border border-border/50 bg-card/40 p-1">
                {dimensions.map((f) => {
                  const active = draft.dimensions.includes(f.key);
                  return (
                    <button
                      key={f.key}
                      onClick={() =>
                        update({
                          dimensions: active
                            ? draft.dimensions.filter((d) => d !== f.key)
                            : [...draft.dimensions, f.key].slice(0, meta?.maxDimensions ?? 2),
                        })
                      }
                      className={cn(
                        "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors",
                        active
                          ? "bg-primary/15 text-primary"
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      <Hash className="h-3 w-3 opacity-60" />
                      <span className="flex-1 truncate">{f.label}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {f.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-3">
              <Label>Measures</Label>
              <div className="mt-1.5 max-h-56 space-y-1 overflow-y-auto rounded-md border border-border/50 bg-card/40 p-1">
                {measures.map((f) => {
                  const active = draft.measures.some((m) => m.fieldKey === f.key);
                  return (
                    <button
                      key={f.key}
                      onClick={() =>
                        update({
                          measures: active
                            ? draft.measures.filter((m) => m.fieldKey !== f.key)
                            : [
                                ...draft.measures,
                                { fieldKey: f.key, aggregation: defaultAggForType(f.type) as any },
                              ].slice(0, meta?.maxMeasures ?? 6),
                        })
                      }
                      className={cn(
                        "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors",
                        active
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      <span className="text-[10px] font-bold opacity-70">123</span>
                      <span className="flex-1 truncate">{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active dimensions list */}
            {draft.dimensions.length > 0 && (
              <div className="mt-3">
                <Label>Selected dimensions</Label>
                <div className="mt-1.5 space-y-1">
                  {draft.dimensions.map((d, idx) => {
                    const f = dataset?.fields.find((x) => x.key === d);
                    return (
                      <div
                        key={d}
                        className="flex items-center gap-2 rounded border border-border/50 bg-primary/5 px-2 py-1.5 text-xs"
                      >
                        <span className="text-muted-foreground">
                          {idx === 0 ? "X" : "G"}
                        </span>
                        <span className="flex-1 truncate font-medium">
                          {f?.label}
                        </span>
                        <button
                          onClick={() =>
                            update({
                              dimensions: draft.dimensions.filter((x) => x !== d),
                            })
                          }
                          className="rounded p-0.5 text-muted-foreground hover:bg-foreground/10"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active measures with agg controls */}
            {draft.measures.length > 0 && (
              <div className="mt-3">
                <Label>Selected measures</Label>
                <div className="mt-1.5 space-y-1.5">
                  {draft.measures.map((m, idx) => {
                    const f = dataset?.fields.find((x) => x.key === m.fieldKey);
                    return (
                      <div
                        key={m.fieldKey + idx}
                        className="rounded border border-border/50 bg-emerald-500/5 p-2"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <div className="text-xs font-semibold">
                            {f?.label ?? m.fieldKey}
                          </div>
                          <button
                            onClick={() => removeMeasure(idx)}
                            className="rounded p-0.5 text-muted-foreground hover:bg-foreground/10"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <Select
                          value={m.aggregation}
                          onValueChange={(v) => setMeasure(idx, { aggregation: v as any })}
                        >
                          <SelectTrigger className="h-6 text-[11px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AGGREGATIONS.map((agg) => (
                              <SelectItem key={agg} value={agg}>
                                {AGGREGATION_LABELS[agg]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* MIDDLE — preview */}
          <div className="col-span-6 flex flex-col bg-background/40 px-4 py-4">
            <div className="mb-2 flex items-center justify-between">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 max-w-[60%] border-0 bg-transparent px-1 text-base font-semibold focus-visible:ring-0"
              />
              {dataset && (
                <span className="text-[11px] text-muted-foreground">
                  {dataset.rows.length.toLocaleString()} rows
                </span>
              )}
            </div>
            <motion.div
              key={`${draft.chartType}-${draft.datasetId}-${draft.dimensions.join(",")}-${draft.measures
                .map((m) => `${m.fieldKey}:${m.aggregation}`)
                .join(",")}`}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="relative flex-1 rounded-lg border border-border/60 bg-card p-2"
              style={{ minHeight: 360 }}
            >
              {canSave ? (
                <ChartRenderer config={draft} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                  <div className="text-xs uppercase tracking-wider">Preview</div>
                  <div className="text-foreground">
                    {!dataset
                      ? "Select a dataset to begin"
                      : draft.dimensions.length < (meta?.minDimensions ?? 0)
                      ? `Pick at least ${meta?.minDimensions} dimension${
                          (meta?.minDimensions ?? 0) === 1 ? "" : "s"
                        }`
                      : `Pick at least ${meta?.minMeasures} measure${
                          (meta?.minMeasures ?? 0) === 1 ? "" : "s"
                        }`}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT — chart type picker */}
          <div className="col-span-3 border-l border-border/40 px-3 py-3">
            <Label>Chart type</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {CHART_REGISTRY.map((c) => {
                const Icon = CHART_ICONS[c.id] ?? BarChart3;
                const selected = draft.chartType === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => update({ chartType: c.id })}
                    className={cn(
                      "group flex flex-col items-start gap-1 rounded-lg border p-2 text-left transition-all",
                      selected
                        ? "border-primary/60 bg-primary/10 shadow-md ring-2 ring-primary/30"
                        : "border-border/60 bg-card/40 hover:border-border hover:bg-card"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded",
                        selected
                          ? "bg-primary/20 text-primary"
                          : "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[11px] font-medium leading-tight">{c.label}</div>
                    <div className="text-[10px] leading-tight text-muted-foreground line-clamp-2">
                      {c.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={closeBuilder}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            disabled={!canSave}
            onClick={() => saveBuilderDraft(title || "Untitled chart")}
          >
            {editingId ? "Save changes" : "Add to dashboard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function defaultAggForType(t: string) {
  return t === "number" ? "sum" : "count";
}

function suggestTitle(c: ChartConfig): string {
  if (!c.measures.length) return "Untitled chart";
  const m = c.measures[0];
  const measurePart = `${capitalize(m.aggregation)} of ${m.fieldKey}`;
  if (c.dimensions[0]) return `${measurePart} by ${c.dimensions[0]}`;
  return measurePart;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
