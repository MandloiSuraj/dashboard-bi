/**
 * Color palettes used by the chart engine. Charts pick a palette via
 * ChartOptions.palette and assign colors deterministically by series index.
 */
export const PALETTES: Record<string, string[]> = {
  lumina: ["#7C5CFF", "#22D3EE", "#F59E0B", "#10B981", "#EC4899", "#FB7185", "#A78BFA", "#34D399"],
  cool: ["#2563EB", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1", "#8B5CF6", "#14B8A6", "#0891B2"],
  sunset: ["#F97316", "#EF4444", "#F59E0B", "#EAB308", "#EC4899", "#D946EF", "#A855F7", "#FB7185"],
  forest: ["#16A34A", "#22C55E", "#84CC16", "#10B981", "#059669", "#65A30D", "#0D9488", "#A3E635"],
  mono: ["#0F172A", "#1E293B", "#334155", "#475569", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
};

export function colorFor(paletteKey: string | undefined, index: number): string {
  const p = PALETTES[paletteKey ?? "lumina"] ?? PALETTES.lumina;
  return p[index % p.length];
}
