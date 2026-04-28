import type { Dataset, Field } from "@/types";
import { MOCK_DATASETS } from "./mockDatasets";

/**
 * Datasets are accessed through this thin registry layer so that swapping
 * the in-memory mock for a real backend later is a single-file change.
 *
 * `loadDataset` is async-shaped on purpose — once we hit a real API the call
 * site doesn't need to change, only the implementation here.
 */
class DatasetRegistry {
  private datasets = new Map<string, Dataset>();

  constructor(seed: Dataset[] = []) {
    seed.forEach((d) => this.datasets.set(d.id, d));
  }

  list(): Dataset[] {
    return Array.from(this.datasets.values());
  }

  get(id: string): Dataset | undefined {
    return this.datasets.get(id);
  }

  async loadDataset(id: string): Promise<Dataset | undefined> {
    return this.datasets.get(id);
  }

  /** Convenience: return field metadata for one column. */
  getField(datasetId: string, fieldKey: string): Field | undefined {
    return this.datasets.get(datasetId)?.fields.find((f) => f.key === fieldKey);
  }
}

export const datasetRegistry = new DatasetRegistry(MOCK_DATASETS);
