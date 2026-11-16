import type { StatusV1 } from "./status.ts";

// Tempo de cache (s) no container da API, por tipo de dado.
export const TTL = {
  aoVivo: 10, hoje: 30, campeonatoComJogo: 60, campeonatoParado: 600,
  encerrado: 86400, agendado: 60, time: 300, diaPassado: 86400, diaFuturo: 600,
} as const;

export function matchTtl(s: StatusV1): number {
  if (s === "ao_vivo" || s === "intervalo") return TTL.aoVivo;
  if (s === "encerrado" || s === "cancelado") return TTL.encerrado;
  return TTL.agendado;
}

// meta.proximaAtualizacaoSugerida: intervalo de polling recomendado ao cliente.
export function suggestedRefresh(s: StatusV1): number {
  if (s === "ao_vivo") return 10;
  if (s === "intervalo") return 60;
  if (s === "encerrado" || s === "cancelado") return 86400;
  return 300;
}
