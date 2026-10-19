# Lumina BI

Lumina BI is a browser-based business intelligence dashboard builder. It lets
users assemble dashboards from configurable chart widgets, explore seeded
business datasets, apply dashboard filters, and arrange visualizations on a
resizable canvas.

## Features

- Create and switch between dashboards; rename dashboards and manage widgets.
- Build and edit visualizations using a dataset, dimensions, measures,
  aggregations, chart type, and display options.
- Arrange widgets by dragging and resizing them on a 12-column dashboard grid.
- Select, duplicate, delete, and expand widgets into a fullscreen view.
- Apply dashboard-wide categorical filters and choose a date-range preset.
- Switch between dark and light themes.
- Render line, time-series, bar, stacked bar, area, pie, donut, scatter,
  heatmap, table, KPI card, and multi-axis visualizations.

## Technology

- React 18 and TypeScript
- Vite for local development and production builds
- Zustand for dashboard and theme state, with browser `localStorage`
  persistence
- Recharts for charts and `react-grid-layout` for dashboard layout
- Tailwind CSS, Radix UI, Lucide icons, and Framer Motion

## Getting started

### Requirements

- Node.js 20 or later
- npm

### Install and run

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal (normally
`http://localhost:5173`).

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Run TypeScript project builds and create the production bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally after building. |
| `npm run lint` | Run the configured ESLint command. |

## Application architecture

The app is a single-page React application. `src/main.tsx` initializes the
theme from browser storage and mounts the application. `src/App.tsx` composes
the sidebar, toolbar, filter bar, dashboard canvas, configuration panel, and
visualization builder.

### Main data and rendering flow

1. `src/data/mockDatasets.ts` defines the sample datasets and their field
   metadata. `src/data/datasetRegistry.ts` exposes them to the UI through a
   small registry interface.
2. The visualization builder creates a typed `ChartConfig` from a selected
   dataset, dimensions, measures, aggregations, filters, and chart options.
3. Dashboard widgets store that configuration alongside their title and grid
   layout. The Zustand dashboard store provides the shared state/actions used
   by the UI.
4. `ChartRenderer` dispatches the configuration to the matching chart view.
   `useChartData` retrieves the dataset and calls the transformation utilities
   to filter, group, and aggregate rows before rendering.
5. The dashboard store persists dashboards and the active dashboard to
   `localStorage`; the theme store persists the selected theme separately.

### State and data boundaries

The current implementation is frontend-only. Dataset records come from the
in-memory mock catalog, and dashboard/theme state is stored in the current
browser. `DatasetRegistry.loadDataset` is asynchronous-shaped to make a future
API-backed implementation easier to introduce, but it currently reads from
the in-memory registry. No server API or database integration is required to
run the app.

## Directory structure

```text
.
├── index.html
├── public/
│   └── favicon.svg
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── components/
│   │   ├── builder/
│   │   │   └── VisualizationBuilder.tsx
│   │   ├── charts/
│   │   │   ├── AreaChartView.tsx
│   │   │   ├── BarChartView.tsx
│   │   │   ├── ChartRenderer.tsx
│   │   │   ├── ChartTooltip.tsx
│   │   │   ├── HeatmapView.tsx
│   │   │   ├── KpiCardView.tsx
│   │   │   ├── LineChartView.tsx
│   │   │   ├── MultiAxisChartView.tsx
│   │   │   ├── PieChartView.tsx
│   │   │   ├── ScatterChartView.tsx
│   │   │   ├── TableView.tsx
│   │   │   └── types.ts
│   │   ├── dashboard/
│   │   │   ├── ConfigPanel.tsx
│   │   │   ├── DashboardCanvas.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Toolbar.tsx
│   │   │   └── Widget.tsx
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── popover.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── switch.tsx
│   │       ├── tabs.tsx
│   │       └── tooltip.tsx
│   ├── data/
│   │   ├── datasetRegistry.ts
│   │   └── mockDatasets.ts
│   ├── hooks/
│   │   └── useChartData.ts
│   ├── lib/
│   │   ├── aggregations.ts
│   │   ├── chartRegistry.ts
│   │   ├── dataTransforms.ts
│   │   ├── palettes.ts
│   │   └── utils.ts
│   ├── store/
│   │   ├── dashboardStore.ts
│   │   ├── seed.ts
│   │   └── themeStore.ts
│   └── types/
│       └── index.ts
├── netlify.toml
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### Key modules

- **Dashboard UI** — `components/dashboard/` owns the dashboard shell's
  controls, canvas, widget lifecycle, filtering, and configuration panel.
- **Visualization builder** — `components/builder/VisualizationBuilder.tsx`
  edits a draft chart configuration and saves it as a widget or updates an
  existing widget.
- **Chart rendering** — `components/charts/ChartRenderer.tsx` maps chart types
  to the individual views. `lib/chartRegistry.ts` is the chart catalog used by
  the builder.
- **Data preparation** — `hooks/useChartData.ts`, `lib/dataTransforms.ts`, and
  `lib/aggregations.ts` prepare dataset rows for chart views.
- **Shared state** — `store/dashboardStore.ts` handles dashboard and widget
  operations; `store/themeStore.ts` handles the theme.

## Adding a chart type

The chart catalog is defined in `src/lib/chartRegistry.ts`. To add a chart:

1. Add its `ChartType` to `src/types/index.ts`.
2. Add its catalog metadata to `src/lib/chartRegistry.ts`.
3. Implement the chart view and register it in
   `src/components/charts/ChartRenderer.tsx`.
4. Add its icon to the visualization builder's chart icon map and, if needed,
   define suitable default options.

## Production deployment

The Netlify configuration builds with `npm run build`, publishes `dist/`, and
rewrites unknown paths to `index.html` for single-page-app navigation. It pins
Node.js 20 and applies long-lived caching to hashed assets while revalidating
the HTML shell.
