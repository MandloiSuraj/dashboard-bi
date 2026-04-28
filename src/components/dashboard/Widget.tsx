import { useState } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Maximize2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Minimize2,
} from "lucide-react";
import { ChartRenderer } from "@/components/charts/ChartRenderer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  selectActiveDashboard,
  useDashboardStore,
} from "@/store/dashboardStore";
import type { Widget as WidgetT } from "@/types";
import { cn } from "@/lib/utils";

interface WidgetProps {
  widget: WidgetT;
}

/**
 * Single dashboard tile. Wraps the ChartRenderer with a header, action menu,
 * and selection / fullscreen affordances. The drag-and-drop / resize is
 * delegated to react-grid-layout (see DashboardCanvas).
 */
export function Widget({ widget }: WidgetProps) {
  const dashboard = useDashboardStore(selectActiveDashboard);
  const selectedId = useDashboardStore((s) => s.selectedWidgetId);
  const fullscreenId = useDashboardStore((s) => s.fullscreenWidgetId);
  const selectWidget = useDashboardStore((s) => s.selectWidget);
  const removeWidget = useDashboardStore((s) => s.removeWidget);
  const duplicateWidget = useDashboardStore((s) => s.duplicateWidget);
  const setFullscreen = useDashboardStore((s) => s.setFullscreenWidget);
  const openBuilder = useDashboardStore((s) => s.openBuilder);

  const isSelected = selectedId === widget.id;
  const isFullscreen = fullscreenId === widget.id;
  const [hovering, setHovering] = useState(false);

  const handleSelect = () => selectWidget(widget.id === selectedId ? null : widget.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={handleSelect}
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all",
        isSelected
          ? "border-primary/60 ring-2 ring-primary/30"
          : "border-border/60 hover:border-border hover:shadow-lg",
        isFullscreen && "z-50"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/40 bg-card/70 px-3 py-2">
        <div className="flex-1 min-w-0">
          <div className="truncate text-[13px] font-semibold tracking-tight">
            {widget.title}
          </div>
          <div className="truncate text-[10px] text-muted-foreground">
            {widget.config.chartType} · {widget.config.measures.length} measures
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-0.5 transition-opacity",
            hovering || isSelected ? "opacity-100" : "opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreen(isFullscreen ? null : widget.id);
            }}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => openBuilder(widget.config, widget.id)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateWidget(widget.id)}>
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => removeWidget(widget.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex-1 overflow-hidden p-2">
        <ChartRenderer
          config={widget.config}
          globalFilters={dashboard?.globalFilters ?? []}
        />
      </div>
    </motion.div>
  );
}
