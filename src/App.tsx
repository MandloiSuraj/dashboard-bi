import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Toolbar } from "@/components/dashboard/Toolbar";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { DashboardCanvas } from "@/components/dashboard/DashboardCanvas";
import { ConfigPanel } from "@/components/dashboard/ConfigPanel";
import { VisualizationBuilder } from "@/components/builder/VisualizationBuilder";

/**
 * App shell. The dashboard surface is composed of:
 *   ┌──────────┬───────────────────────────────────────┐
 *   │          │  Toolbar                              │
 *   │ Sidebar  ├───────────────────────────────────────┤
 *   │          │  FilterBar (collapsible)              │
 *   │          ├───────────────────────────────────────┤
 *   │          │  DashboardCanvas         │  Config    │
 *   └──────────┴──────────────────────────┴────────────┘
 *
 * Cross-cutting state (selected widget, fullscreen widget, builder draft) all
 * lives in `useDashboardStore`, so any panel can read or mutate without prop
 * drilling.
 */
export default function App() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="app-bg flex h-screen w-full overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Toolbar
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((v) => !v)}
        />
        <FilterBar open={filtersOpen} />

        <div className="flex flex-1 overflow-hidden">
          <DashboardCanvas />
          <ConfigPanel />
        </div>
      </div>

      <VisualizationBuilder />
    </div>
  );
}
