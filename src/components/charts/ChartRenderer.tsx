import { memo } from "react";
import type { ChartConfig, Filter } from "@/types";
import { useChartData } from "@/hooks/useChartData";
import { LineChartView } from "./LineChartView";
import { BarChartView } from "./BarChartView";
import { AreaChartView } from "./AreaChartView";
import { PieChartView } from "./PieChartView";
import { ScatterChartView } from "./ScatterChartView";
import { HeatmapView } from "./HeatmapView";
import { TableView } from "./TableView";
import { KpiCardView } from "./KpiCardView";
import { MultiAxisChartView } from "./MultiAxisChartView";

interface ChartRendererProps {
  config: ChartConfig;
  globalFilters?: Filter[];
  /** Optional handler called when a data point is clicked (drill-down). */
  onDrill?: (datum: any) => void;
}

/**
 * Generic chart dispatcher. Receives a ChartConfig, computes the aggregated
 * series with `useChartData`, and forwards both to the matching chart view.
 *
 * This is the only place that knows about every chart type. Every chart view
 * receives the same `ChartViewProps` so swapping a chart type at runtime is
 * a no-op for the rest of the app.
 */
function ChartRendererImpl({ config, globalFilters, onDrill }: ChartRendererProps) {
  const data = useChartData(config, globalFilters ?? []);
  if (!data.dataset) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Dataset unavailable
      </div>
    );
  }

  const props = { config, data, onDrill };

  switch (config.chartType) {
    case "line":
    case "timeSeries":
      return <LineChartView {...props} variant={config.chartType} />;
    case "bar":
      return <BarChartView {...props} stacked={false} />;
    case "stackedBar":
      return <BarChartView {...props} stacked />;
    case "area":
      return <AreaChartView {...props} />;
    case "pie":
      return <PieChartView {...props} variant="pie" />;
    case "donut":
      return <PieChartView {...props} variant="donut" />;
    case "scatter":
      return <ScatterChartView {...props} />;
    case "heatmap":
      return <HeatmapView {...props} />;
    case "table":
      return <TableView {...props} />;
    case "kpi":
      return <KpiCardView {...props} />;
    case "multiAxis":
      return <MultiAxisChartView {...props} />;
    default:
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Unsupported chart type: {config.chartType}
        </div>
      );
  }
}

export const ChartRenderer = memo(ChartRendererImpl);
