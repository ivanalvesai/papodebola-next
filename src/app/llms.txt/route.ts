import { TOURNAMENTS, SPORTS, ALL_CLUSTER_TEAMS } from "@/lib/config";

// /llms.txt — guia legível por agentes de IA (padrão llmstxt.org). Aponta as
// seções de maior valor do portal pra facilitar extração/citação. Gerado a
// partir do config (campeonatos, times, esportes) pra ficar sempre em sincronia.
export const revalidate = 86400; // 1x/dia

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

export async function GET() {
  const champs = Object.values(TOURNAMENTS)
    .filter((t) => t.seasonId)
    .map((t) => `- [${t.name}](${SITE_URL}/futebol/${t.slug}): classificação, rodadas e jogos`)
    .join("\n");

  const teams = ALL_CLUSTER_TEAMS.map(
    (t) => `- [${t.name}](${SITE_URL}/futebol/times/${t.slug}): jogos, escalação, próximos jogos e estatísticas`
  ).join("\n");

  const sports = SPORTS.map(
    (s) => `- [${s.name}](${SITE_URL}${s.href})`
  ).join("\n");

  const body = `# Papo de Bola

> Portal brasileiro de futebol e esportes: notícias, placares ao vivo, classificações, agenda de jogos e cobertura da Copa do Mundo 2026. Conteúdo em português do Brasil. Horários no fuso de Brasília (UTC-3).

Papo de Bola cobre futebol brasileiro e mundial além de outros esportes (basquete/NBA, vôlei, NFL, F1, tênis e mais). As páginas de jogo trazem placar ao vivo, lance a lance, escalações e estatísticas.

## Principais seções

- [Página inicial](${SITE_URL}/): destaques, jogos de hoje e últimas notícias
- [Notícias](${SITE_URL}/noticias): últimas notícias de futebol e esportes
- [Jogos de hoje](${SITE_URL}/jogos-de-hoje): agenda do dia de todos os esportes
- [Agenda do futebol](${SITE_URL}/jogos-de-hoje/futebol): calendário do futebol brasileiro
- [Ao vivo](${SITE_URL}/ao-vivo): placares em tempo real
- [Copa do Mundo 2026](${SITE_URL}/futebol/copa-do-mundo): tabela dos grupos, jogos e resultados
- [Seleção Brasileira](${SITE_URL}/futebol/selecao-brasileira): notícias, convocados e jogos
- [Onde assistir](${SITE_URL}/futebol/onde-assistir): transmissões dos jogos

## Campeonatos

${champs}

## Times

${teams}

## Outros esportes

${sports}

## Cidades

- [Santana de Parnaíba (SP)](${SITE_URL}/sp/santana-de-parnaiba): esportes da cidade e campeonatos municipais

## Institucional

- [Sobre](${SITE_URL}/sobre)
- [Contato](${SITE_URL}/contato)
- [Política de Privacidade](${SITE_URL}/politica-de-privacidade)
- [Termos de Uso](${SITE_URL}/termos-de-uso)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
