export type StatusV1 = "agendado" | "ao_vivo" | "intervalo" | "encerrado" | "adiado" | "cancelado" | "interrompido";

// statusType bruto do Sofascore (notstarted | inprogress | finished | postponed | canceled ...)
// + descrição (EN ou PT) para detectar o intervalo.
export function toStatusV1(raw: string, desc = ""): StatusV1 {
  const t = (raw || "").toLowerCase();
  if (t === "inprogress") return /half ?time|intervalo/i.test(desc) ? "intervalo" : "ao_vivo";
  if (t === "finished") return "encerrado";
  if (t === "postponed") return "adiado";
  if (t === "canceled" || t === "cancelled") return "cancelado";
  if (t === "interrupted" || t === "suspended" || t === "abandoned") return "interrompido";
  return "agendado";
}
