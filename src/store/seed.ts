import type { Dashboard, Widget } from "@/types";
import { uid } from "@/lib/utils";

/**
 * Seed dashboards. Loaded once on first mount (no localStorage entry yet) so a
 * brand new visitor immediately sees a meaningful executive dashboard rather
 * than an empty canvas.
 */
function widget(
  partial: Omit<Widget, "id"> & { id?: string }
): Widget {
  return { id: partial.id ?? uid("w"), ...partial };
}

export const SEED_EXECUTIVE_DASHBOARD: Dashboard = {
  id: "exec",
  name: "Executive Overview",
  description:
    "Realtime view of company performance: revenue, growth, and product traction.",
  globalFilters: [],
  dateRange: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  widgets: [
    // KPI row
    widget({
      title: "Total Revenue",
      layout: { x: 0, y: 0, w: 3, h: 4 },
      config: {
        datasetId: "sales",
        chartType: "kpi",
        dimensions: [],
        measures: [{ fieldKey: "revenue", aggregation: "sum" }],
        options: { palette: "lumina" },
      },
    }),
    widget({
      title: "Units Sold",
      layout: { x: 3, y: 0, w: 3, h: 4 },
      config: {
        datasetId: "sales",
        chartType: "kpi",
        dimensions: [],
        measures: [{ fieldKey: "units", aggregation: "sum" }],
        options: { palette: "lumina" },
      },
    }),
    widget({
      title: "Daily Active Users",
      layout: { x: 6, y: 0, w: 3, h: 4 },
      config: {
        datasetId: "userGrowth",
        chartType: "kpi",
        dimensions: [],
        measures: [{ fieldKey: "dau", aggregation: "avg" }],
        options: { palette: "lumina" },
      },
    }),
    widget({
      title: "MRR",
      layout: { x: 9, y: 0, w: 3, h: 4 },
      config: {
        datasetId: "financials",
        chartType: "kpi",
        dimensions: [],
        measures: [{ fieldKey: "mrr", aggregation: "max" }],
        options: { palette: "lumina" },
      },
    }),
    // Revenue trend
    widget({
      title: "Revenue Trend",
      layout: { x: 0, y: 4, w: 8, h: 9 },
      config: {
        datasetId: "sales",
        chartType: "area",
        dimensions: ["date"],
        measures: [
          { fieldKey: "revenue", aggregation: "sum", color: "#7C5CFF" },
          { fieldKey: "cost", aggregation: "sum", color: "#22D3EE" },
        ],
        options: { showGrid: true, showLegend: true, smooth: true, palette: "lumina" },
      },
    }),
    // Region distribution
    widget({
      title: "Revenue by Region",
      layout: { x: 8, y: 4, w: 4, h: 9 },
      config: {
        datasetId: "sales",
        chartType: "donut",
        dimensions: ["region"],
        measures: [{ fieldKey: "revenue", aggregation: "sum" }],
        options: { palette: "lumina", showLegend: true },
      },
    }),
    // Sales funnel
    widget({
      title: "Conversion Funnel",
      layout: { x: 0, y: 13, w: 6, h: 8 },
      config: {
        datasetId: "productAnalytics",
        chartType: "bar",
        dimensions: ["funnelStep"],
        measures: [{ fieldKey: "users", aggregation: "sum" }],
        filters: [{ fieldKey: "feature", op: "equals", value: "Funnel" }],
        options: {
          sortBy: "value",
          sortDir: "desc",
          showLegend: false,
          palette: "sunset",
        },
      },
    }),
    // Channel comparison stacked
    widget({
      title: "Marketing Channels",
      layout: { x: 6, y: 13, w: 6, h: 8 },
      config: {
        datasetId: "marketing",
        chartType: "stackedBar",
        dimensions: ["channel", "campaignType"],
        measures: [{ fieldKey: "spend", aggregation: "sum" }],
        options: { showLegend: true, palette: "cool" },
      },
    }),
    // Forecast / multi-axis
    widget({
      title: "MRR vs Headcount",
      layout: { x: 0, y: 21, w: 8, h: 9 },
      config: {
        datasetId: "financials",
        chartType: "multiAxis",
        dimensions: ["month"],
        measures: [
          { fieldKey: "mrr", aggregation: "max", variant: "bar", yAxis: "left" },
          { fieldKey: "headcount", aggregation: "max", variant: "line", yAxis: "right" },
        ],
        options: { showLegend: true, palette: "forest" },
      },
    }),
    // Heatmap
    widget({
      title: "Revenue · Region × Category",
      layout: { x: 8, y: 21, w: 4, h: 9 },
      config: {
        datasetId: "sales",
        chartType: "heatmap",
        dimensions: ["region", "category"],
        measures: [{ fieldKey: "revenue", aggregation: "sum" }],
      },
    }),
    // Table
    widget({
      title: "Top Days",
      layout: { x: 0, y: 30, w: 12, h: 9 },
      config: {
        datasetId: "sales",
        chartType: "table",
        dimensions: ["date", "region"],
        measures: [
          { fieldKey: "revenue", aggregation: "sum" },
          { fieldKey: "deals", aggregation: "sum" },
          { fieldKey: "discount", aggregation: "avg" },
        ],
        options: { sortBy: "value", sortDir: "desc", limit: 50 },
      },
    }),
  ],
};
