// Rótulos em PT-BR compartilhados pelo site e pela API pública /v1 (módulo puro, sem alias
// de import, pra rodar no node --test).

// Rótulos PT dos rounds de mata-mata (por slug da API). Fallback: o `name` da API.
// Convenção "avos de final": o número = quantidade de CONFRONTOS (= times/2). Logo,
// Round of 32 (32 times, 16 jogos) = "16 avos de final".
export const KO_LABEL: Record<string, string> = {
  "round-of-128": "64 avos de final",
  "round-of-64": "32 avos de final",
  "round-of-32": "16 avos de final",
  "round-of-16": "Oitavas de final",
  quarterfinals: "Quartas de final",
  "quarter-finals": "Quartas de final",
  semifinals: "Semifinal",
  "semi-finals": "Semifinal",
  final: "Final",
  "3rd-place": "Disputa de 3º lugar",
  "third-place": "Disputa de 3º lugar",
};
export const koLabel = (slug?: string | null, name?: string | null) =>
  (slug && KO_LABEL[slug]) || name || "Fase final";

// Nomes de estatística EN -> PT-BR (a AllSportsApi devolve em inglês).
export const STAT_PT: Record<string, string> = {
  "Ball possession": "Posse de bola",
  "Expected goals": "Gols esperados (xG)",
  "Total shots": "Finalizações",
  "Shots on target": "Finalizações no alvo",
  "Shots off target": "Finalizações para fora",
  "Blocked shots": "Finalizações bloqueadas",
  "Shots inside box": "Finalizações na área",
  "Shots outside box": "Finalizações fora da área",
  "Big chances": "Grandes chances",
  "Big chances missed": "Grandes chances perdidas",
  "Big chances scored": "Grandes chances convertidas",
  "Corner kicks": "Escanteios",
  Corners: "Escanteios",
  Offsides: "Impedimentos",
  Fouls: "Faltas",
  "Yellow cards": "Cartões amarelos",
  "Red cards": "Cartões vermelhos",
  "Free kicks": "Tiros livres",
  "Throw-ins": "Laterais",
  "Goal kicks": "Tiros de meta",
  Saves: "Defesas",
  "Goalkeeper saves": "Defesas do goleiro",
  "Total saves": "Defesas",
  Passes: "Passes",
  "Accurate passes": "Passes certos",
  "Long balls": "Bolas longas",
  Crosses: "Cruzamentos",
  Dribbles: "Dribles",
  "Total tackles": "Desarmes",
  Tackles: "Desarmes",
  Interceptions: "Interceptações",
  Clearances: "Cortes",
  "Counter attacks": "Contra-ataques",
  "Counterattacks": "Contra-ataques",
  Duels: "Duelos",
  "Duels won": "Duelos vencidos",
  "Aerials won": "Duelos aéreos vencidos",
  "Hit woodwork": "Na trave",
  "Touches in penalty area": "Toques na área",
  "Final third entries": "Entradas no último terço",
  "Final third phase": "Jogo no último terço",
  "Fouled in final third": "Faltas sofridas no ataque",
  "Through balls": "Passes em profundidade",
  "Dispossessed": "Posses perdidas",
  "Ground duels": "Duelos no chão",
  "Aerial duels": "Duelos aéreos",
  "Tackles won": "Desarmes certos",
  "Recoveries": "Recuperações de bola",
  "Goals prevented": "Gols evitados",
  "Big saves": "Defesas difíceis",
  "High claims": "Saídas de cruzamento",
  // extras comuns do Sofascore (pra não vazar inglês em outros jogos)
  "Penalty saves": "Pênaltis defendidos",
  "Punches": "Socos do goleiro",
  "Errors lead to shot": "Erros que viraram finalização",
  "Errors lead to goal": "Erros que viraram gol",
  "Big chances created": "Grandes chances criadas",
  "Key passes": "Passes decisivos",
  "Accurate long balls": "Bolas longas certas",
  "Accurate crosses": "Cruzamentos certos",
  "Goalkeeper punches": "Socos do goleiro",
  "Expected goals on target": "Gols esperados no alvo (xGOT)",
  "Number of sprints": "Número de piques",
  "Distance covered": "Distância percorrida",
  "Distance covered by outfield players": "Distância percorrida (jogadores de linha)",
  "Errors lead to a shot": "Erros que viraram finalização",
  "Errors lead to a goal": "Erros que viraram gol",
  "Average rating": "Nota média",
};
export function translateStat(name: string): string {
  if (!name) return "";
  if (STAT_PT[name]) return STAT_PT[name];
  const hit = Object.keys(STAT_PT).find((k) => k.toLowerCase() === name.toLowerCase());
  return hit ? STAT_PT[hit] : name;
}


// Motivo do cartão (incidents.reason do Sofascore) -> PT-BR. Desconhecido passa direto.
const CARD_REASON_PT: Record<string, string> = {
  foul: "Falta",
  "professional foul": "Falta tática",
  "serious foul play": "Jogo brusco grave",
  "violent conduct": "Conduta violenta",
  argument: "Reclamação",
  "foul and abusive language": "Linguagem ofensiva",
  "time wasting": "Cera",
  "unsporting behaviour": "Conduta antidesportiva",
  "unsporting behavior": "Conduta antidesportiva",
  handball: "Mão na bola",
  "deliberate handball": "Mão na bola",
  simulation: "Simulação",
  diving: "Simulação",
  dive: "Simulação",
  "excessive celebration": "Comemoração excessiva",
  "entering field": "Entrar em campo sem autorização",
  "leaving field": "Sair de campo sem autorização",
  "kicking ball away": "Chutar a bola para longe",
  "not retreating": "Não respeitar a distância",
  "denied goal-scoring opportunity": "Impedir chance clara de gol",
  "persistent infringement": "Faltas seguidas",
  "bench booking": "Advertência no banco",
  other: "Outro motivo",
};
export function cardReasonPt(reason: string | null | undefined): string | null {
  if (!reason) return null;
  return CARD_REASON_PT[reason.trim().toLowerCase()] || reason;
}

// Marcador de fim de período (incidentType "period"): a API usa 999 como sentinela no minuto
// e no acréscimo. Texto vem como HT / FT / AET / PEN.
export function periodLabel(text: string | null | undefined, minute: number | null | undefined): string {
  const t = (text || "").toUpperCase();
  if (t === "HT" || minute === 45) return "Intervalo";
  if (t === "FT" || minute === 90) return "Fim do tempo normal";
  if (t === "AET" || minute === 120) return "Fim da prorrogação";
  if (t === "PEN" || minute === 999) return "Fim da disputa de pênaltis";
  return "Fim de período";
}
