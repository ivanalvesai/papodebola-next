// Lista de "próximos jogos" vinda do último dado bom salvo em disco pode trazer jogos
// que já aconteceram (API fora por dias). Mantém só o que ainda não começou ou começou
// há até 3h (ainda pode estar rolando). timestamp 0 = inválido.
const GRACE_SECS = 3 * 3600;

export function dropStaleUpcoming<T extends { timestamp: number }>(list: T[], nowSec: number): T[] {
  return list.filter((m) => m.timestamp > 0 && m.timestamp >= nowSec - GRACE_SECS);
}
