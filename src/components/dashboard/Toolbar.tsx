import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Filter,
  LayoutGrid,
  Moon,
  Plus,
  RefreshCw,
  Share2,
  Sun,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  selectActiveDashboard,
  useDashboardStore,
} from "@/store/dashboardStore";
import { useThemeStore } from "@/store/themeStore";
import { datasetRegistry } from "@/data/datasetRegistry";

interface ToolbarProps {
  onToggleFilters: () => void;
  filtersOpen: boolean;
}

export function Toolbar({ onToggleFilters, filtersOpen }: ToolbarProps) {
  const dashboard = useDashboardStore(selectActiveDashboard);
  const renameDashboard = useDashboardStore((s) => s.renameDashboard);
  const openBuilder = useDashboardStore((s) => s.openBuilder);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(dashboard?.name ?? "");

  if (!dashboard) return null;

  const filterCount =
    (dashboard.globalFilters?.length ?? 0) + (dashboard.dateRange ? 1 : 0);
  const datasets = datasetRegistry.list();

  return (
    <header className="relative flex h-14 items-center gap-3 border-b border-border/60 bg-card/70 px-4 backdrop-blur">
      <div className="flex items-center gap-2 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={() => {
              if (draftName.trim()) renameDashboard(dashboard.id, draftName.trim());
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setDraftName(dashboard.name);
                setEditing(false);
              }
            }}
            className="rounded border border-input bg-background px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        ) : (
          <button
            onClick={() => {
              setDraftName(dashboard.name);
              setEditing(true);
            }}
            className="truncate text-sm font-semibold tracking-tight transition-colors hover:text-primary"
            title="Click to rename"
          >
            {dashboard.name}
          </button>
        )}
        <Badge variant="outline" className="hidden sm:inline-flex">
          {dashboard.widgets.length} widgets
        </Badge>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          live
        </Badge>
      </div>

      <div className="flex-1" />

      <TooltipProvider delayDuration={300}>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant={filtersOpen ? "secondary" : "ghost"}
            onClick={onToggleFilters}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {filterCount > 0 && (
              <span className="ml-0.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary">
                {filterCount}
              </span>
            )}
          </Button>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Grid layout</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={toggleTheme}
              >
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.18 }}
                  className="inline-flex"
                >
                  {theme === "dark" ? (
                    <Sun className="h-3.5 w-3.5" />
                  ) : (
                    <Moon className="h-3.5 w-3.5" />
                  )}
                </motion.span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>

          <Button
            size="sm"
            variant="gradient"
            onClick={() =>
              openBuilder({
                datasetId: datasets[0]?.id ?? "",
                chartType: "bar",
                dimensions: [],
                measures: [],
                options: { palette: "lumina", showGrid: true, showLegend: true },
              })
            }
          >
            <Plus className="h-3.5 w-3.5" />
            New widget
          </Button>
        </div>
      </TooltipProvider>
    </header>
  );
}
