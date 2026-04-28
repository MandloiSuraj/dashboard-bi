import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  Database,
  LayoutDashboard,
  Megaphone,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { datasetRegistry } from "@/data/datasetRegistry";
import { CHART_REGISTRY } from "@/lib/chartRegistry";
import { useDashboardStore, selectActiveDashboard } from "@/store/dashboardStore";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  TrendingUp,
  Megaphone,
  Users,
  Wallet,
  Boxes,
  Database,
  LayoutDashboard,
  BarChart3,
};

export function Sidebar() {
  const [tab, setTab] = useState<"datasets" | "viz" | "dashboards">("datasets");
  const [query, setQuery] = useState("");
  const datasets = datasetRegistry.list();
  const dashboards = useDashboardStore((s) => s.dashboards);
  const active = useDashboardStore(selectActiveDashboard);
  const selectDashboard = useDashboardStore((s) => s.selectDashboard);
  const createDashboard = useDashboardStore((s) => s.createDashboard);
  const openBuilder = useDashboardStore((s) => s.openBuilder);

  const filteredDatasets = datasets.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border/60 bg-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 shadow-lg shadow-violet-500/30">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">Lumina BI</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Analytics Studio
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="px-3 pb-2">
        <div className="grid grid-cols-3 gap-1 rounded-md bg-muted/40 p-1">
          {(
            [
              { id: "datasets", label: "Data" },
              { id: "viz", label: "Charts" },
              { id: "dashboards", label: "Boards" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded px-2 py-1 text-xs font-medium transition-all",
                tab === t.id
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {tab === "datasets" && (
          <div className="space-y-1">
            <SectionHeader>Datasets</SectionHeader>
            {filteredDatasets.map((d) => {
              const Icon = ICONS[d.icon ?? "Database"] ?? Database;
              return (
                <motion.div
                  key={d.id}
                  whileHover={{ x: 2 }}
                  draggable
                  onDragStart={(e) =>
                    (e as any).dataTransfer?.setData("text/dataset", d.id)
                  }
                  className="group flex cursor-grab items-start gap-2.5 rounded-md px-2.5 py-2 transition-colors hover:bg-accent"
                >
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium leading-tight">{d.name}</div>
                    <div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                      {d.description}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {d.fields.filter((f) => f.role === "dimension").length} dims
                      </span>
                      <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {d.fields.filter((f) => f.role === "measure").length} measures
                      </span>
                      <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {d.rows.length.toLocaleString()} rows
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {tab === "viz" && (
          <div className="space-y-1">
            <SectionHeader>Visualizations</SectionHeader>
            <div className="grid grid-cols-2 gap-1.5">
              {CHART_REGISTRY.filter(
                (c) =>
                  c.label.toLowerCase().includes(query.toLowerCase()) ||
                  c.description.toLowerCase().includes(query.toLowerCase())
              ).map((c) => {
                const Icon = (ICONS[c.icon] ?? BarChart3) as LucideIcon;
                return (
                  <button
                    key={c.id}
                    onClick={() =>
                      openBuilder({
                        datasetId: datasets[0]?.id ?? "",
                        chartType: c.id,
                        dimensions: [],
                        measures: [],
                        options: { palette: "lumina" },
                      })
                    }
                    className="group flex flex-col items-start gap-1 rounded-md border border-border/40 bg-card/40 p-2 text-left transition-all hover:border-primary/40 hover:bg-card hover:shadow-md"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-xs font-medium leading-tight">{c.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === "dashboards" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 pb-1.5 pt-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Dashboards
              </div>
              <Button
                size="xs"
                variant="ghost"
                className="h-6"
                onClick={() => createDashboard("Untitled Dashboard")}
              >
                <Plus className="h-3 w-3" />
                New
              </Button>
            </div>
            {dashboards.map((d) => (
              <button
                key={d.id}
                onClick={() => selectDashboard(d.id)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors",
                  d.id === active?.id
                    ? "bg-accent text-foreground"
                    : "hover:bg-accent/60 text-muted-foreground"
                )}
              >
                <LayoutDashboard className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate text-xs font-medium">{d.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {d.widgets.length} widgets
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}
