---
area: seo
data: 2026-06-16
---

# Backlinks legados + análise de keywords orgânicas

## Backlinks do site legado (2004–2013)
Export Ahrefs (`backlink-antigo.csv`, 1.165 links / 84 domínios). Perfil **limpo e no nicho**:
- **NICHO (49 domínios, ~1034 links):** Wikipedia (PT/EN/CA/RU/IT, DR97), portais de jornalismo/mídia
  esportiva (Portal dos Jornalistas DR51, Natelinha/UOL DR91, sport.pl, GGN), blogs/fóruns de futebol.
- **TÓXICO (12 domínios, 22 links):** lojas de backlink / link farms (backlinkshop.shop, addurl.in,
  netvouz…) → candidatos a disavow (baixa urgência, volume ínfimo).
- **ESPELHO (16):** scrapers da Wikipedia → ignorar.

**Problema central:** todas as URLs antigas (`/papodemidia`, `/vidadecraque`, `/goleiros`,
`/24horas`…) davam **404** → equity desperdiçado.

**Ações:**
1. **301 por seção** (já no ar, `next.config.ts`): perfis de jogador → `/futebol`; editorial/mídia
   → `/noticias`. Interim — recupera parte do equity e tira o link morto.
2. **`backlinks-recriar.csv` (103 páginas):** lista priorizada das páginas que valem **recriar**
   (DR≥20). 30 citadas pela **Wikipedia (DR97)** = prioridade. Ao recriar, servir na MESMA URL (ou
   301 específico) pra capturar 100% do equity. Conteúdo é tudo no nicho: craques, goleiros,
   jornalistas/narradores, colunas de mídia/TV.

## Keywords orgânicas (`organic-keyword.csv`, 455 kw)
- **Tráfego ~2.282/mês para 5,28M de volume somado** → ranqueia em termos gigantes, mas quase tudo
  em **página 3+** (358 kw em pos 21-50; só 7 no top 3). **Upside enorme.**
- **Motor = páginas de time** (`/futebol/times/[slug]/...`): "jogo hoje", "próximo jogo",
  "escalação", "classificação", "onde assistir" + nome do time.

**Quick wins (pos 4-20, alto volume)** — `keyword-oportunidades.csv` (90 kw):
- `classificações de chapecoense` — vol **140k**, pos 15 → maior quick win.
- Cluster **Palmeiras** (jogo-hoje/próximos/escalação): vol 5k–27k em pos 16-20.
- **Botafogo, Vasco, Bragantino**: escalação/jogo-hoje/classificação em pos 13-20.

**Gigantes (pos>20)** — prêmio de médio prazo: `jogo do palmeiras` (919k, p29),
`palmeiras hoje` (889k, p26), `jogo do botafogo` (315k), `copa libertadores` (299k), `jogos de vasco` (260k).

**GEO:** **119 keywords têm AI Overview** no SERP → com os bots de IA liberados + schema esportivo,
vale otimizar pra citação (blocos de resposta direta).

## Plano recomendado
1. **Bloco "resposta rápida"** no topo das páginas de time (jogo-hoje/próximos): responde a query
   exata ("O Palmeiras joga hoje? Sim, contra X às Yh, em Z") → mira featured snippet + AI Overview.
2. **Reforçar as páginas de time** dos times com mais demanda (Palmeiras, Chapecoense, Botafogo,
   Vasco, Bragantino, Inter): conteúdo mais completo/fresco + SportsEvent schema também aqui.
3. **Recriar as 30 páginas citadas pela Wikipedia** (lote 1) na URL antiga.
4. Disavow opcional dos 12 domínios tóxicos.
