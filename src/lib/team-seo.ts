export type TeamPage = "hub" | "jogoHoje" | "ondeAssistir" | "escalacao" | "proximos" | "estatisticas";
type SeoGroup = { metaTitle?: string | null; metaDescription?: string | null };
type SeoField = "seo" | "seoJogoHoje" | "seoOndeAssistir" | "seoEscalacao" | "seoProximos" | "seoEstatisticas";
export type TeamSeoDoc = Partial<Record<SeoField, SeoGroup | null>>;

export const TEAM_SEO_FIELD: Record<TeamPage, SeoField> = {
  hub: "seo",
  jogoHoje: "seoJogoHoje",
  ondeAssistir: "seoOndeAssistir",
  escalacao: "seoEscalacao",
  proximos: "seoProximos",
  estatisticas: "seoEstatisticas",
};

export const TEAM_PAGE_PATH: Record<TeamPage, string> = {
  hub: "",
  jogoHoje: "/jogo-hoje",
  ondeAssistir: "/onde-assistir",
  escalacao: "/escalacao",
  proximos: "/proximos-jogos",
  estatisticas: "/estatisticas",
};

export function defaultTeamSeo(page: TeamPage, name: string): { title: string; description: string } {
  switch (page) {
    case "hub":
      return {
        title: `${name} - Notícias, Jogos e Classificação`,
        description: `Tudo sobre o ${name}: notícias, jogos de hoje, próximos jogos, escalação, estatísticas e onde assistir ao vivo.`,
      };
    case "jogoHoje":
      return {
        title: `Jogo do ${name} Hoje - Horário e Placar`,
        description: `Veja se o ${name} joga hoje, horário do jogo, placar ao vivo e detalhes da partida.`,
      };
    case "ondeAssistir":
      return {
        title: `Onde Assistir ${name} Hoje - Transmissão Ao Vivo`,
        description: `Saiba onde assistir ao jogo do ${name} hoje ao vivo. TV, streaming e opções de transmissão.`,
      };
    case "escalacao":
      return {
        title: `Escalação do ${name} Hoje - Provável Escalação`,
        description: `Provável escalação do ${name} para o próximo jogo, com base no time que começou a última partida, formação e destaques da temporada.`,
      };
    case "proximos":
      return {
        title: `Próximos Jogos do ${name} - Calendário 2026`,
        description: `Calendário completo dos próximos jogos do ${name} em 2026. Datas, horários, adversários e campeonatos.`,
      };
    case "estatisticas":
      return {
        title: `Estatísticas do ${name} 2026 - Números e Desempenho`,
        description: `Estatísticas do ${name} na temporada 2026: posição, aproveitamento, gols, artilheiros e sequência recente.`,
      };
  }
}

// Próximo jogo do time, já formatado (ex.: { opponent: "Atlético-MG", date: "seg 26/10",
// time: "20h", league: "Brasileirão Série A" }). Alimenta os títulos dinâmicos e os
// placeholders {adversario} {data} {hora} {campeonato} do título/descrição do /cms.
export type TeamNextMatch = { opponent: string; date: string; time: string; league: string };

// Títulos que mudam com o próximo jogo (o que a busca "próximo jogo do X" quer ver no
// snippet). Abas fora daqui ficam no padrão estático.
function dynamicTeamSeo(page: TeamPage, name: string, n: TeamNextMatch): { title: string; description: string } | null {
  switch (page) {
    case "proximos":
      return {
        title: `Próximo jogo do ${name}: x ${n.opponent}, ${n.date}, ${n.time}`,
        description: `O próximo jogo do ${name} é contra o ${n.opponent}, ${n.date} às ${n.time}, pelo ${n.league}. Veja o calendário completo, horários e onde assistir.`,
      };
    case "jogoHoje":
      return {
        title: `${name} x ${n.opponent} hoje: horário e onde assistir`,
        description: `${name} x ${n.opponent} hoje às ${n.time}, pelo ${n.league}: horário, onde assistir, escalações e placar ao vivo.`,
      };
    case "ondeAssistir":
      return {
        title: `Onde assistir ${name} x ${n.opponent} hoje`,
        description: `Onde assistir ${name} x ${n.opponent} (${n.date}, ${n.time}) pelo ${n.league}: canais de TV e streaming.`,
      };
    default:
      return null;
  }
}

const PLACEHOLDER = /{(adversario|data|hora|campeonato)}/g;

// Preenche os placeholders; sem jogo, texto com placeholder é descartado (null) pra não
// vazar "{adversario}" no Google.
function fill(text: string | null | undefined, n: TeamNextMatch | null): string | null {
  const t = text?.trim();
  if (!t) return null;
  if (!PLACEHOLDER.test(t)) return t;
  PLACEHOLDER.lastIndex = 0;
  if (!n) return null;
  const values: Record<string, string> = { adversario: n.opponent, data: n.date, hora: n.time, campeonato: n.league };
  return t.replace(PLACEHOLDER, (_, k: string) => values[k]);
}

export function teamSeo(
  doc: TeamSeoDoc | null,
  page: TeamPage,
  name: string,
  next: TeamNextMatch | null = null
): { title: string; description: string } {
  const stat = defaultTeamSeo(page, name);
  const def = (next && dynamicTeamSeo(page, name, next)) || stat;
  const g = doc?.[TEAM_SEO_FIELD[page]] || null;
  // O seed de 27/09 gravou o padrão estático no /cms dos 57 times: texto idêntico ao
  // padrão conta como "não personalizado" (senão o título dinâmico nunca apareceria).
  const custom = (v: string | null | undefined, std: string) => (v?.trim() === std ? null : v);
  return {
    title: fill(custom(g?.metaTitle, stat.title), next) || def.title,
    description: fill(custom(g?.metaDescription, stat.description), next) || def.description,
  };
}
