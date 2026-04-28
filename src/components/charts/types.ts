import type { ChartConfig } from "@/types";
import type { ChartData } from "@/hooks/useChartData";

/** Common props passed to every chart view. */
export interface ChartViewProps {
  config: ChartConfig;
  data: ChartData;
  onDrill?: (datum: any) => void;
}
