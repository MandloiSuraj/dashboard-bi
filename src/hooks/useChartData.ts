import { useMemo } from "react";
import { datasetRegistry } from "@/data/datasetRegistry";
import { groupAndAggregate, type AggregatedSeries } from "@/lib/dataTransforms";
import type { ChartConfig, Dataset, Filter } from "@/types";

export interface ChartData extends AggregatedSeries {
  dataset: Dataset | undefined;
  /** All filters that were applied (widget's own + compatible global). */
  effectiveFilters: Filter[];
}

/**
 * useChartData binds a ChartConfig to its dataset, applies filters and global
 * filters, and returns the aggregated series. Memoized so widgets don't
 * recompute on every parent render.
 */
export function useChartData(
  config: ChartConfig,
  globalFilters: Filter[] = []
): ChartData {
  return useMemo(() => {
    const dataset = datasetRegistry.get(config.datasetId);
    if (!dataset) {
      return {
        dataset: undefined,
        data: [],
        series: [],
        measureIds: [],
        measureLabels: [],
        effectiveFilters: [],
      };
    }
    // Merge global filters that target a field present in this dataset.
    const compatibleGlobals = globalFilters.filter((f) =>
      dataset.fields.some((field) => field.key === f.fieldKey)
    );
    const effective = [...(config.filters ?? []), ...compatibleGlobals];
    const merged: ChartConfig = { ...config, filters: effective };
    const series = groupAndAggregate(dataset, merged);
    return { ...series, dataset, effectiveFilters: effective };
  }, [config, globalFilters]);
}
