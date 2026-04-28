import { useMemo } from "react";
import GridLayout, { WidthProvider } from "react-grid-layout";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartRenderer } from "@/components/charts/ChartRenderer";
import { Widget } from "./Widget";
import {
  selectActiveDashboard,
  useDashboardStore,
} from "@/store/dashboardStore";
import { datasetRegistry } from "@/data/datasetRegistry";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGrid = WidthProvider(GridLayout);

/**
 * Main canvas. Renders all widgets via react-grid-layout, which gives us
 * drag-to-rearrange and resize-handles for free, and reports new positions
 * back to the store via `setLayouts`.
 */
export function DashboardCanvas() {
  const dashboard = useDashboardStore(selectActiveDashboard);
  const setLayouts = useDashboardStore((s) => s.setLayouts);
  const fullscreenId = useDashboardStore((s) => s.fullscreenWidgetId);
  const setFullscreen = useDashboardStore((s) => s.setFullscreenWidget);
  const openBuilder = useDashboardStore((s) => s.openBuilder);
  const selectWidget = useDashboardStore((s) => s.selectWidget);

  const fullscreenWidget = dashboard?.widgets.find((w) => w.id === fullscreenId);

  const layout = useMemo(
    () =>
      (dashboard?.widgets ?? []).map((w) => ({
        i: w.id,
        x: w.layout.x,
        y: w.layout.y,
        w: w.layout.w,
        h: w.layout.h,
        minW: w.layout.minW ?? 2,
        minH: w.layout.minH ?? 3,
      })),
    [dashboard?.widgets]
  );

  const handleLayoutChange = (newLayout: any[]) => {
    setLayouts(
      newLayout.map((l) => ({
        id: l.i,
        layout: { x: l.x, y: l.y, w: l.w, h: l.h },
      }))
    );
  };

  if (!dashboard) return null;

  if (!dashboard.widgets.length) {
    return (
      <div className="flex h-full flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex max-w-md flex-col items-center text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20">
            <LayoutDashboard className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">
            Build your first dashboard
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add widgets, drag them around, resize, and connect a dataset. Every
            chart is fully configurable — pick fields, aggregations, and
            visualization types from the builder.
          </p>
          <Button
            size="lg"
            variant="gradient"
            className="mt-6"
            onClick={() =>
              openBuilder({
                datasetId: datasetRegistry.list()[0]?.id ?? "",
                chartType: "bar",
                dimensions: [],
                measures: [],
                options: { palette: "lumina", showGrid: true, showLegend: true },
              })
            }
          >
            <Plus className="h-4 w-4" />
            Create your first widget
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="relative flex-1 overflow-y-auto px-3 py-3"
      onClick={() => selectWidget(null)}
    >
      <ResponsiveGrid
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={28}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        draggableHandle=".group"
        draggableCancel="button, [role='menu'], [role='menuitem'], [role='dialog'], input, select"
        onLayoutChange={handleLayoutChange}
        compactType="vertical"
        useCSSTransforms
      >
        {dashboard.widgets.map((widget) => (
          <div key={widget.id} data-grid={layout.find((l) => l.i === widget.id)}>
            <Widget widget={widget} />
          </div>
        ))}
      </ResponsiveGrid>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreenWidget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-3">
              <div>
                <div className="text-sm font-semibold tracking-tight">
                  {fullscreenWidget.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {fullscreenWidget.config.chartType} ·{" "}
                  {fullscreenWidget.config.measures.length} measures
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setFullscreen(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden p-6">
              <ChartRenderer
                config={fullscreenWidget.config}
                globalFilters={dashboard.globalFilters}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
