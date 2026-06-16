---
area: rotas
data: 2026-06-15
---

# Rotas — /jogos-de-hoje e hierarquia geográfica /sp

## `/agenda` → `/jogos-de-hoje`

O termo "jogos de hoje" é mais forte de SEO que "agenda". Renomeada a pasta
`src/app/agenda` → `src/app/jogos-de-hoje` (com `/futebol` dentro).

- Atualizados: canonical, H1, breadcrumbs, tabs (`agenda-tabs.tsx`), nav (label "Agenda" →
  "Jogos de Hoje"), side-panel, footer, `match-bar.tsx`, sitemap e a lista de revalidate do
  painel config.
- **Redirects** em `next.config.ts`: `/agenda` → `/jogos-de-hoje` e `/agenda/:path*` →
  `/jogos-de-hoje/:path*` (permanentes → 308).
- Componentes/dados internos mantiveram o nome (`@/components/agenda`, `@/lib/data/agenda`) —
  não são URLs, evita churn.

SEO das duas páginas (title via template `%s | Papo de Bola`):
- `/jogos-de-hoje` — "Agenda de Jogos de Hoje".
- `/jogos-de-hoje/futebol` — "Jogos de Futebol: Agenda, Datas e Horários".

## `/futebol/jogos-hoje` → `/jogos-de-hoje/futebol`

Padrão futuro: `/jogos-de-hoje/{esporte}` (futebol, depois vôlei, basquete…). A página antiga
`/futebol/jogos-hoje` foi **removida** e tem 301 em `next.config.ts` → `/jogos-de-hoje/futebol`.
Saiu do sitemap. (Conteúdo difere: `/jogos-de-hoje/futebol` é o calendário CBF; os "jogos de
hoje" multiesporte ficam em `/jogos-de-hoje` e os carrosséis por campeonato em `/futebol`.)

## Hierarquia geográfica `/sp`

O antigo `/municipal` (campeonatos municipais de Santana de Parnaíba, SisGel) virou parte de
uma estrutura por estado/cidade:

| Rota | Conteúdo |
|---|---|
| `/sp` | Hub do estado: classificação do Campeonato Paulista (`getStandings(372, 86993)`, estado "em breve" fora de temporada) + card pra cidade |
| `/sp/santana-de-parnaiba` | Página da cidade: card pros campeonatos municipais + **sidebar com a tabela da 1ª divisão** (União do Parque líder) linkando pro municipal |
| `/sp/santana-de-parnaiba/municipal` | A página completa de antes (5 campeonatos SisGel), agora com breadcrumb |

- Novo módulo **`src/lib/data/sisgel.ts`** (lê `data/sisgel.json` server-side + `getFirstDivision()`).
- `/municipal` → 301 → `/sp/santana-de-parnaiba/municipal` (`next.config.ts`).
- Atualizados side-panel (agora "Santana de Parnaíba" + "Municipal"), sitemap e canonicals.
- **Sem seção de notícias** por ora (decisão do Ivan — a definir as tags depois).

Obs: os redirects do Next emitem **308** (Permanent Redirect), tratado pelo Google igual a 301.
O apex (`papodebola.com.br`) faz 301 → www no Cloudflare, então uma URL antiga encadeia
apex → www → destino final.
