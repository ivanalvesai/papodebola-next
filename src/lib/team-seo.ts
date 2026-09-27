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

export function teamSeo(doc: TeamSeoDoc | null, page: TeamPage, name: string): { title: string; description: string } {
  const def = defaultTeamSeo(page, name);
  const g = doc?.[TEAM_SEO_FIELD[page]] || null;
  return {
    title: g?.metaTitle?.trim() || def.title,
    description: g?.metaDescription?.trim() || def.description,
  };
}
