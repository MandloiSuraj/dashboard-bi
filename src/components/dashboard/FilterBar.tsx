import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { datasetRegistry } from "@/data/datasetRegistry";
import {
  selectActiveDashboard,
  useDashboardStore,
} from "@/store/dashboardStore";
import type { Filter } from "@/types";

interface FilterBarProps {
  open: boolean;
}

const DATE_PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Last 365 days", days: 365 },
  { label: "All time", days: 0 },
];

export function FilterBar({ open }: FilterBarProps) {
  const dashboard = useDashboardStore(selectActiveDashboard);
  const setGlobalFilters = useDashboardStore((s) => s.setGlobalFilters);
  const setDateRange = useDashboardStore((s) => s.setDateRange);
  const [draftField, setDraftField] = useState<string>("");
  const [draftValue, setDraftValue] = useState<string>("");

  const allFields = useMemo(() => {
    const map = new Map<
      string,
      { key: string; label: string; values: Set<any>; format?: string }
    >();
    datasetRegistry.list().forEach((d) => {
      d.fields.forEach((f) => {
        if (f.role === "dimension" && f.type === "string") {
          if (!map.has(f.key)) {
            map.set(f.key, { key: f.key, label: f.label, values: new Set(), format: f.format });
          }
          d.rows.slice(0, 200).forEach((r) => map.get(f.key)!.values.add(r[f.key]));
        }
      });
    });
    return Array.from(map.values());
  }, []);

  if (!dashboard) return null;

  const filters = dashboard.globalFilters;
  const dateRange = dashboard.dateRange;

  const removeFilter = (idx: number) =>
    setGlobalFilters(filters.filter((_, i) => i !== idx));

  const addFilter = () => {
    if (!draftField || !draftValue) return;
    const next: Filter = {
      fieldKey: draftField,
      op: "equals",
      value: draftValue,
    };
    setGlobalFilters([...filters, next]);
    setDraftField("");
    setDraftValue("");
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden border-b border-border/60 bg-card/40 backdrop-blur"
        >
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
            {/* Date range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="h-8">
                  <Calendar className="h-3.5 w-3.5" />
                  {dateRange ? `${dateRange.from} — ${dateRange.to}` : "All time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-56 p-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pb-1">
                  Date range
                </div>
                <div className="space-y-0.5">
                  {DATE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        if (!p.days) return setDateRange(null);
                        const to = new Date().toISOString().slice(0, 10);
                        const from = new Date(Date.now() - p.days * 86400000)
                          .toISOString()
                          .slice(0, 10);
                        setDateRange({ from, to });
                      }}
                      className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Existing filter chips */}
            {filters.map((f, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="gap-1.5 normal-case tracking-normal text-[11px]"
              >
                <span className="font-normal text-muted-foreground">{f.fieldKey}</span>
                <span>=</span>
                <span className="font-medium">{String(f.value)}</span>
                <button
                  onClick={() => removeFilter(idx)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {/* Add filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8">
                  <Plus className="h-3.5 w-3.5" />
                  Add filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="space-y-2">
                  <Select value={draftField} onValueChange={setDraftField}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent>
                      {allFields.map((f) => (
                        <SelectItem key={f.key} value={f.key}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {draftField &&
                    (() => {
                      const f = allFields.find((x) => x.key === draftField);
                      const values = Array.from(f?.values ?? []) as string[];
                      return (
                        <Select value={draftValue} onValueChange={setDraftValue}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Equals…" />
                          </SelectTrigger>
                          <SelectContent>
                            {values.slice(0, 50).map((v) => (
                              <SelectItem key={v} value={v}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    })()}
                  {!draftField && (
                    <Input
                      placeholder="Pick a field above"
                      disabled
                      className="h-8 text-xs"
                    />
                  )}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={addFilter}
                    disabled={!draftField || !draftValue}
                  >
                    Apply filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {filters.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto h-8 text-muted-foreground"
                onClick={() => setGlobalFilters([])}
              >
                Clear all
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
