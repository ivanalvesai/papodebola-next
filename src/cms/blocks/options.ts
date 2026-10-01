import { TOURNAMENTS } from "../../lib/config.ts";
import { WIDGET_LABELS } from "./summary.ts";

export function tournamentOptions(): { label: string; value: string }[] {
  return [
    { label: "Copa do Mundo 2026", value: "copa-do-mundo" },
    ...Object.values(TOURNAMENTS).map((t) => ({ label: t.name, value: t.slug })),
  ];
}
export const WIDGET_OPTIONS = Object.entries(WIDGET_LABELS).map(([value, label]) => ({ label, value }));
