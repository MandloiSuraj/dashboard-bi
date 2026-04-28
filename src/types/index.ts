// Core type system for the Lumina BI dashboard builder.
// Designed to be transport-agnostic: today these shapes are populated from
// in-memory mock data, tomorrow they will be hydrated from a REST/SQL API.

export type FieldType = "string" | "number" | "date" | "boolean";

export type FieldRole = "dimension" | "measure";

export interface Field {
  /** Stable column key used to reference this field everywhere. */
  key: string;
  /** Human-readable label for the UI. */
  label: string;
  type: FieldType;
  role: FieldRole;
  /** Optional formatting hints for the renderer (e.g. "currency", "percent"). */
  format?: "currency" | "percent" | "number" | "date" | "shortDate";
  /** Optional descriptive text shown as helper info. */
  description?: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  /** Schema describing the columns of `rows`. */
  fields: Field[];
  /** Plain-object rows; each row is keyed by field.key. */
  rows: Record<string, any>[];
  category?: string;
  icon?: string;
}

export type Aggregation =
  | "sum"
  | "avg"
  | "count"
  | "countDistinct"
  | "min"
  | "max"
  | "median";

export type ChartType =
  | "line"
  | "bar"
  | "stackedBar"
  | "area"
  | "pie"
  | "donut"
  | "scatter"
  | "heatmap"
  | "table"
  | "kpi"
  | "multiAxis"
  | "timeSeries";

export type FilterOp =
  | "equals"
  | "notEquals"
  | "in"
  | "between"
  | "gt"
  | "lt"
  | "contains";

export interface Filter {
  fieldKey: string;
  op: FilterOp;
  value: any;
}

export interface MeasureConfig {
  fieldKey: string;
  aggregation: Aggregation;
  /** Override the auto-generated label; useful for "Total Revenue" etc. */
  label?: string;
  /** Recharts axis: "left" (default) or "right" for multi-axis charts. */
  yAxis?: "left" | "right";
  /** Color override; falls back to palette. */
  color?: string;
  /** For multi-axis charts: render this measure as a different sub-type. */
  variant?: "line" | "bar" | "area";
}

export interface ChartOptions {
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  stacked?: boolean;
  smooth?: boolean;
  /** Limit the number of categories shown (top-N by first measure). */
  limit?: number;
  /** Sort dimension values: by label, by first measure, etc. */
  sortBy?: "label" | "value";
  sortDir?: "asc" | "desc";
  /** Color palette override key (see lib/palettes.ts). */
  palette?: string;
  /** KPI-specific: comparison field for delta. */
  comparisonAggregation?: Aggregation;
  /** KPI-specific: explicit unit / suffix. */
  unit?: string;
}

/**
 * Universal chart configuration consumed by ChartRenderer.
 * This is the object that the visualization builder produces and
 * the dashboard persists. Anything renderable in the app reduces
 * to this shape.
 */
export interface ChartConfig {
  datasetId: string;
  chartType: ChartType;
  /** 0..N dimensions. Most charts use 1; heatmap/grouped bar uses 2. */
  dimensions: string[];
  measures: MeasureConfig[];
  filters?: Filter[];
  options?: ChartOptions;
}

export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface Widget {
  id: string;
  title: string;
  config: ChartConfig;
  layout: WidgetLayout;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  /** Global filters applied across every widget on this dashboard. */
  globalFilters: Filter[];
  /** ISO datetime range filter, applied to the dataset's primary date field. */
  dateRange?: { from: string; to: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChartTypeMeta {
  id: ChartType;
  label: string;
  description: string;
  /** Lucide icon name. */
  icon: string;
  /** Allowed/required dimension and measure cardinalities. */
  minDimensions: number;
  maxDimensions: number;
  minMeasures: number;
  maxMeasures: number;
  /** Whether this chart needs a numeric x-axis (scatter) vs categorical/temporal. */
  category: "comparison" | "trend" | "distribution" | "relationship" | "summary";
}
