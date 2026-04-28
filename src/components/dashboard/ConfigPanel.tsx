import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Layers,
  Palette,
  Settings2,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { datasetRegistry } from "@/data/datasetRegistry";
import { CHART_REGISTRY } from "@/lib/chartRegistry";
import { AGGREGATIONS, AGGREGATION_LABELS } from "@/lib/aggregations";
import { PALETTES } from "@/lib/palettes";
import {
  selectActiveDashboard,
  selectSelectedWidget,
  useDashboardStore,
} from "@/store/dashboardStore";
import type { ChartConfig, MeasureConfig } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Right-rail config panel. Edits the currently selected widget in-place.
 * Splits options into Setup / Style / Data so the panel never feels crowded.
 */
export function ConfigPanel() {
  const widget = useDashboardStore(selectSelectedWidget);
  const dashboard = useDashboardStore(selectActiveDashboard);
  const updateWidget = useDashboardStore((s) => s.updateWidget);
  const removeWidget = useDashboardStore((s) => s.removeWidget);
  const openBuilder = useDashboardStore((s) => s.openBuilder);

  const dataset = useMemo(
    () => (widget ? datasetRegistry.get(widget.config.datasetId) : undefined),
    [widget]
  );

  if (!widget || !dataset || !dashboard) {
    return (
      <aside className="hidden h-full w-80 shrink-0 flex-col border-l border-border/60 bg-sidebar lg:flex">
        <EmptyState />
      </aside>
    );
  }

  const cfg = widget.config;
  const setConfig = (next: Partial<ChartConfig>) =>
    updateWidget(widget.id, { config: { ...cfg, ...next } });

  const setOption = (k: string, v: any) =>
    setConfig({ options: { ...(cfg.options ?? {}), [k]: v } });

  const updateMeasure = (idx: number, patch: Partial<MeasureConfig>) =>
    setConfig({
      measures: cfg.measures.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
    });

  const removeMeasure = (idx: number) =>
    setConfig({ measures: cfg.measures.filter((_, i) => i !== idx) });

  const dimensions = dataset.fields.filter((f) => f.role === "dimension");
  const measures = dataset.fields.filter((f) => f.role === "measure");

  return (
    <aside className="hidden h-full w-80 shrink-0 flex-col border-l border-border/60 bg-sidebar lg:flex">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Widget
          </div>
          <div className="truncate text-sm font-semibold">{widget.title}</div>
        </div>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => openBuilder(widget.config, widget.id)}
        >
          <Edit3 className="h-3 w-3" />
          Builder
        </Button>
      </div>

      <Tabs defaultValue="setup" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-3 mt-3 grid grid-cols-3">
          <TabsTrigger value="setup" className="gap-1">
            <Layers className="h-3 w-3" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="style" className="gap-1">
            <Palette className="h-3 w-3" />
            Style
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-1">
            <SlidersHorizontal className="h-3 w-3" />
            Data
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Setup tab */}
          <TabsContent value="setup" className="space-y-4">
            <Field label="Title">
              <Input
                value={widget.title}
                onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                className="h-8 text-xs"
              />
            </Field>
            <Field label="Dataset">
              <Select
                value={cfg.datasetId}
                onValueChange={(v) => setConfig({ datasetId: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {datasetRegistry.list().map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Chart type">
              <Select
                value={cfg.chartType}
                onValueChange={(v) => setConfig({ chartType: v as any })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHART_REGISTRY.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label={cfg.chartType === "scatter" ? "Group by (optional)" : "X axis / Dimension"}
            >
              <Select
                value={cfg.dimensions[0] ?? ""}
                onValueChange={(v) =>
                  setConfig({
                    dimensions: v ? [v, ...(cfg.dimensions.slice(1) ?? [])] : [],
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {dimensions.map((f) => (
                    <SelectItem key={f.key} value={f.key}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {(cfg.chartType === "stackedBar" ||
              cfg.chartType === "heatmap" ||
              cfg.chartType === "table") && (
              <Field label="Group / Series (2nd dimension)">
                <Select
                  value={cfg.dimensions[1] ?? ""}
                  onValueChange={(v) =>
                    setConfig({
                      dimensions: [cfg.dimensions[0] ?? "", v].filter(Boolean),
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {dimensions.map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Measures</Label>
                <Select
                  value=""
                  onValueChange={(v) =>
                    setConfig({
                      measures: [...cfg.measures, { fieldKey: v, aggregation: "sum" }],
                    })
                  }
                >
                  <SelectTrigger className="h-7 w-32 text-xs">
                    <SelectValue placeholder="+ Add" />
                  </SelectTrigger>
                  <SelectContent>
                    {measures.map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {cfg.measures.map((m, idx) => {
                  const f = dataset.fields.find((x) => x.key === m.fieldKey);
                  return (
                    <div
                      key={idx}
                      className="rounded-md border border-border/60 bg-card/40 p-2"
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="text-xs font-semibold">{f?.label ?? m.fieldKey}</div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          onClick={() => removeMeasure(idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Select
                          value={m.aggregation}
                          onValueChange={(v) =>
                            updateMeasure(idx, { aggregation: v as any })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
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
                        <Input
                          type="color"
                          value={m.color ?? "#7C5CFF"}
                          onChange={(e) => updateMeasure(idx, { color: e.target.value })}
                          className="h-7 w-full cursor-pointer p-0.5"
                        />
                      </div>
                      {cfg.chartType === "multiAxis" && (
                        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                          <Select
                            value={m.yAxis ?? "left"}
                            onValueChange={(v) =>
                              updateMeasure(idx, { yAxis: v as "left" | "right" })
                            }
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left axis</SelectItem>
                              <SelectItem value="right">Right axis</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={m.variant ?? "line"}
                            onValueChange={(v) =>
                              updateMeasure(idx, { variant: v as any })
                            }
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="line">Line</SelectItem>
                              <SelectItem value="bar">Bar</SelectItem>
                              <SelectItem value="area">Area</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  );
                })}
                {!cfg.measures.length && (
                  <div className="rounded-md border border-dashed border-border/60 p-3 text-center text-xs text-muted-foreground">
                    Add a measure to render the chart
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Style tab */}
          <TabsContent value="style" className="space-y-4">
            <Field label="Color palette">
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(PALETTES).map((p) => (
                  <button
                    key={p}
                    onClick={() => setOption("palette", p)}
                    className={cn(
                      "rounded-md border p-2 text-left transition-all",
                      cfg.options?.palette === p
                        ? "border-primary/60 ring-2 ring-primary/30"
                        : "border-border/60 hover:border-border"
                    )}
                  >
                    <div className="text-[11px] font-medium capitalize">{p}</div>
                    <div className="mt-1 flex h-3 overflow-hidden rounded">
                      {PALETTES[p].slice(0, 5).map((c) => (
                        <span key={c} style={{ background: c }} className="flex-1" />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </Field>
            <Toggle
              label="Show legend"
              value={cfg.options?.showLegend ?? true}
              onChange={(v) => setOption("showLegend", v)}
            />
            <Toggle
              label="Show grid"
              value={cfg.options?.showGrid ?? true}
              onChange={(v) => setOption("showGrid", v)}
            />
            <Toggle
              label="Smooth lines"
              value={cfg.options?.smooth ?? true}
              onChange={(v) => setOption("smooth", v)}
            />
            <Toggle
              label="Stacked"
              value={cfg.options?.stacked ?? false}
              onChange={(v) => setOption("stacked", v)}
            />
          </TabsContent>

          {/* Data tab */}
          <TabsContent value="data" className="space-y-4">
            <Field label="Sort">
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={cfg.options?.sortBy ?? "label"}
                  onValueChange={(v) => setOption("sortBy", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="label">By label</SelectItem>
                    <SelectItem value="value">By value</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={cfg.options?.sortDir ?? "asc"}
                  onValueChange={(v) => setOption("sortDir", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Field>
            <Field label="Limit (top N)">
              <Input
                type="number"
                value={cfg.options?.limit ?? ""}
                onChange={(e) =>
                  setOption("limit", e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="No limit"
                className="h-8 text-xs"
              />
            </Field>
            <div className="border-t border-border/40 pt-4">
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-center text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeWidget(widget.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete widget
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/40 px-3 py-2">
      <span className="text-xs">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function EmptyState() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-sm font-medium">Nothing selected</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Click on a widget to edit its dataset, dimensions, measures, and styling.
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
