import type { ChartType, ChartTypeMeta } from "@/types";

/**
 * Single source of truth for the chart catalog. The visualization builder
 * reads this to render its picker; ChartRenderer reads this to validate the
 * incoming config. Adding a new chart type is a 3-step recipe:
 *
 *   1) Append a ChartTypeMeta entry here.
 *   2) Register the chart component in components/charts/ChartRenderer.tsx.
 *   3) (optionally) tweak default config in builder.
 */
export const CHART_REGISTRY: ChartTypeMeta[] = [
  {
    id: "line",
    label: "Line",
    description: "Trend over a continuous (often time) dimension.",
    icon: "LineChart",
    minDimensions: 1,
    maxDimensions: 2,
    minMeasures: 1,
    maxMeasures: 6,
    category: "trend",
  },
  {
    id: "bar",
    label: "Bar",
    description: "Compare categories side-by-side.",
    icon: "BarChart3",
    minDimensions: 1,
    maxDimensions: 2,
    minMeasures: 1,
    maxMeasures: 6,
    category: "comparison",
  },
  {
    id: "stackedBar",
    label: "Stacked Bar",
    description: "Show composition within each category.",
    icon: "BarChart4",
    minDimensions: 1,
    maxDimensions: 2,
    minMeasures: 1,
    maxMeasures: 6,
    category: "comparison",
  },
  {
    id: "area",
    label: "Area",
    description: "Filled trend lines for cumulative reading.",
    icon: "AreaChart",
    minDimensions: 1,
    maxDimensions: 2,
    minMeasures: 1,
    maxMeasures: 6,
    category: "trend",
  },
  {
    id: "pie",
    label: "Pie",
    description: "Proportion of a single measure across categories.",
    icon: "PieChart",
    minDimensions: 1,
    maxDimensions: 1,
    minMeasures: 1,
    maxMeasures: 1,
    category: "distribution",
  },
  {
    id: "donut",
    label: "Donut",
    description: "Pie chart variant with KPI in the center.",
    icon: "CircleDot",
    minDimensions: 1,
    maxDimensions: 1,
    minMeasures: 1,
    maxMeasures: 1,
    category: "distribution",
  },
  {
    id: "scatter",
    label: "Scatter",
    description: "Relationship between two measures.",
    icon: "ScatterChart",
    minDimensions: 0,
    maxDimensions: 1,
    minMeasures: 2,
    maxMeasures: 3,
    category: "relationship",
  },
  {
    id: "heatmap",
    label: "Heatmap",
    description: "Matrix of intensity across two dimensions.",
    icon: "Grid3x3",
    minDimensions: 2,
    maxDimensions: 2,
    minMeasures: 1,
    maxMeasures: 1,
    category: "distribution",
  },
  {
    id: "table",
    label: "Table",
    description: "Tabular grid with sortable columns.",
    icon: "Table",
    minDimensions: 0,
    maxDimensions: 4,
    minMeasures: 0,
    maxMeasures: 8,
    category: "summary",
  },
  {
    id: "kpi",
    label: "KPI Card",
    description: "Single big number with trend delta.",
    icon: "Gauge",
    minDimensions: 0,
    maxDimensions: 0,
    minMeasures: 1,
    maxMeasures: 1,
    category: "summary",
  },
  {
    id: "multiAxis",
    label: "Multi-Axis",
    description: "Compare measures with different scales (combo chart).",
    icon: "Activity",
    minDimensions: 1,
    maxDimensions: 1,
    minMeasures: 2,
    maxMeasures: 4,
    category: "trend",
  },
  {
    id: "timeSeries",
    label: "Time Series",
    description: "High-density temporal chart with brush.",
    icon: "TrendingUp",
    minDimensions: 1,
    maxDimensions: 1,
    minMeasures: 1,
    maxMeasures: 4,
    category: "trend",
  },
];

export const CHART_TYPES: ChartType[] = CHART_REGISTRY.map((c) => c.id);

export function getChartMeta(id: ChartType): ChartTypeMeta | undefined {
  return CHART_REGISTRY.find((c) => c.id === id);
}
