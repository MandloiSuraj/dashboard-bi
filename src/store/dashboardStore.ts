import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ChartConfig,
  Dashboard,
  Filter,
  Widget,
  WidgetLayout,
} from "@/types";
import { uid } from "@/lib/utils";
import { SEED_EXECUTIVE_DASHBOARD } from "./seed";

interface DashboardState {
  dashboards: Dashboard[];
  activeDashboardId: string;
  selectedWidgetId: string | null;
  /** Currently maximized (fullscreen) widget id, if any. */
  fullscreenWidgetId: string | null;
  /** In-progress visualization builder draft. */
  builderDraft: ChartConfig | null;
  /** Editing an existing widget (then save replaces it). */
  builderEditingWidgetId: string | null;

  // Dashboard CRUD
  createDashboard: (name: string) => string;
  selectDashboard: (id: string) => void;
  renameDashboard: (id: string, name: string) => void;
  deleteDashboard: (id: string) => void;

  // Widget CRUD
  addWidget: (widget: Omit<Widget, "id" | "layout"> & { layout?: WidgetLayout }) => string;
  updateWidget: (id: string, patch: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  duplicateWidget: (id: string) => void;
  selectWidget: (id: string | null) => void;
  setLayouts: (layouts: { id: string; layout: WidgetLayout }[]) => void;
  setFullscreenWidget: (id: string | null) => void;

  // Global filters
  setGlobalFilters: (filters: Filter[]) => void;
  setDateRange: (range: { from: string; to: string } | null) => void;

  // Builder
  openBuilder: (draft?: ChartConfig | null, editingId?: string | null) => void;
  setBuilderDraft: (draft: ChartConfig | null) => void;
  saveBuilderDraft: (title: string) => void;
  closeBuilder: () => void;
}

const empty = (): Dashboard => ({
  id: uid("dash"),
  name: "Untitled Dashboard",
  description: "",
  widgets: [],
  globalFilters: [],
  dateRange: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const update = (d: Dashboard, patch: Partial<Dashboard>): Dashboard => ({
  ...d,
  ...patch,
  updatedAt: new Date().toISOString(),
});

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      dashboards: [SEED_EXECUTIVE_DASHBOARD],
      activeDashboardId: SEED_EXECUTIVE_DASHBOARD.id,
      selectedWidgetId: null,
      fullscreenWidgetId: null,
      builderDraft: null,
      builderEditingWidgetId: null,

      createDashboard: (name) => {
        const d = { ...empty(), name };
        set((s) => ({ dashboards: [...s.dashboards, d], activeDashboardId: d.id }));
        return d.id;
      },
      selectDashboard: (id) =>
        set({ activeDashboardId: id, selectedWidgetId: null, fullscreenWidgetId: null }),
      renameDashboard: (id, name) =>
        set((s) => ({
          dashboards: s.dashboards.map((d) => (d.id === id ? update(d, { name }) : d)),
        })),
      deleteDashboard: (id) =>
        set((s) => {
          const remaining = s.dashboards.filter((d) => d.id !== id);
          const next =
            remaining.length === 0
              ? [empty()]
              : remaining;
          return {
            dashboards: next,
            activeDashboardId: next[0].id,
            selectedWidgetId: null,
          };
        }),

      addWidget: (widget) => {
        const active = get().dashboards.find((d) => d.id === get().activeDashboardId)!;
        const layout: WidgetLayout = widget.layout ?? findEmptySlot(active.widgets);
        const w: Widget = { id: uid("w"), title: widget.title, config: widget.config, layout };
        set((s) => ({
          dashboards: s.dashboards.map((d) =>
            d.id === s.activeDashboardId ? update(d, { widgets: [...d.widgets, w] }) : d
          ),
          selectedWidgetId: w.id,
        }));
        return w.id;
      },
      updateWidget: (id, patch) =>
        set((s) => ({
          dashboards: s.dashboards.map((d) =>
            d.id === s.activeDashboardId
              ? update(d, {
                  widgets: d.widgets.map((w) => (w.id === id ? { ...w, ...patch } : w)),
                })
              : d
          ),
        })),
      removeWidget: (id) =>
        set((s) => ({
          dashboards: s.dashboards.map((d) =>
            d.id === s.activeDashboardId
              ? update(d, { widgets: d.widgets.filter((w) => w.id !== id) })
              : d
          ),
          selectedWidgetId: s.selectedWidgetId === id ? null : s.selectedWidgetId,
        })),
      duplicateWidget: (id) => {
        const active = get().dashboards.find((d) => d.id === get().activeDashboardId);
        const target = active?.widgets.find((w) => w.id === id);
        if (!target) return;
        const copy: Widget = {
          ...target,
          id: uid("w"),
          title: `${target.title} (copy)`,
          layout: { ...target.layout, x: 0, y: Infinity },
        };
        set((s) => ({
          dashboards: s.dashboards.map((d) =>
            d.id === s.activeDashboardId ? update(d, { widgets: [...d.widgets, copy] }) : d
          ),
          selectedWidgetId: copy.id,
        }));
      },
      selectWidget: (id) => set({ selectedWidgetId: id }),
      setLayouts: (layouts) =>
        set((s) => ({
          dashboards: s.dashboards.map((d) =>
            d.id === s.activeDashboardId
              ? update(d, {
                  widgets: d.widgets.map((w) => {
                    const next = layouts.find((l) => l.id === w.id);
                    return next ? { ...w, layout: next.layout } : w;
                  }),
                })
              : d
          ),
        })),
      setFullscreenWidget: (id) => set({ fullscreenWidgetId: id }),

      setGlobalFilters: (filters) =>
        set((s) => ({
          dashboards: s.dashboards.map((d) =>
            d.id === s.activeDashboardId ? update(d, { globalFilters: filters }) : d
          ),
        })),
      setDateRange: (range) =>
        set((s) => ({
          dashboards: s.dashboards.map((d) =>
            d.id === s.activeDashboardId ? update(d, { dateRange: range }) : d
          ),
        })),

      openBuilder: (draft = null, editingId = null) =>
        set({ builderDraft: draft, builderEditingWidgetId: editingId }),
      setBuilderDraft: (draft) => set({ builderDraft: draft }),
      saveBuilderDraft: (title) => {
        const { builderDraft, builderEditingWidgetId } = get();
        if (!builderDraft) return;
        if (builderEditingWidgetId) {
          get().updateWidget(builderEditingWidgetId, { title, config: builderDraft });
        } else {
          get().addWidget({ title, config: builderDraft });
        }
        set({ builderDraft: null, builderEditingWidgetId: null });
      },
      closeBuilder: () => set({ builderDraft: null, builderEditingWidgetId: null }),
    }),
    {
      name: "lumina-dashboards-v1",
      partialize: (state) => ({
        dashboards: state.dashboards,
        activeDashboardId: state.activeDashboardId,
      }),
    }
  )
);

/** Selectors */
export const selectActiveDashboard = (s: DashboardState) =>
  s.dashboards.find((d) => d.id === s.activeDashboardId) ?? s.dashboards[0];

export const selectSelectedWidget = (s: DashboardState) => {
  const active = selectActiveDashboard(s);
  return active?.widgets.find((w) => w.id === s.selectedWidgetId) ?? null;
};

/**
 * Find an empty slot for a new widget in a 12-column grid. Walks downwards
 * until it finds enough vertical clearance.
 */
function findEmptySlot(widgets: Widget[]): WidgetLayout {
  const w = 6;
  const h = 8;
  const cols = 12;
  // Bottom-left scan
  const maxY = widgets.reduce((max, x) => Math.max(max, x.layout.y + x.layout.h), 0);
  return { x: 0, y: maxY, w, h };
}
