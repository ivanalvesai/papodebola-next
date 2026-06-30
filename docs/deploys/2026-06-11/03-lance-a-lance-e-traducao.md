---
area: feature-lance-a-lance
data: 2026-06-11
---

# Lance a lance: feed completo, merge, substituição, cartão, marcas — e tradução PT

## Feed via commentary + merge dos incidents
O feed do meio usa `match/{id}/commentary` (texto completo: faltas, escanteios, finalizações,
impedimentos, defesas, VAR…). Tipos EN mapeados pra PT no `live-match.tsx` (const `COMM`),
**sem mostrar o texto em inglês como rótulo**.

**Problema dos gols sumindo:** o commentary do Sofascore **nem sempre marca todos os gols**
como `scoreChange` (ex: México 2x0 — o 2º gol só estava nos `incidents`). Solução: `mergeFeed()`
em `match-detail.ts` injeta os `incidents` (gol/cartão/sub/VAR — sempre completos e instantâneos)
que faltam no feed, inserindo por minuto, sem duplicar. **Não usar retry** (não era falha de
request, era o feed de texto do Sofascore).

## Lances-chave (foto do jogador)
Gol/cartão/pênalti/VAR renderizam com **foto do jogador** (`PlayerAvatar` → `/img/player/{id}/image`,
fallback bandeira) + manchete PT ("⚽ GOL DO MÉXICO!"). Borda: gol verde, vermelho red, amarelo yellow.
Lances normais: **bandeira do time** (isHome→home/awayId) + rótulo/texto.

## Substituição: Entra (verde) / Sai (vermelho)
A API traz `playerIn`/`playerOut` no commentary E nos incidents. O card mostra a foto de quem
entra, "Entra: X" em verde (↑) e "Sai: Y" em vermelho (↓).

## Motivo do cartão
O `reason` (ex: `Foul`, `Violent conduct`, `Professional foul last man`) só existe nos
`incidents`; `mergeFeed` injeta no item de cartão do feed. Traduzido por `REASON_PT` no
live-match.tsx → "Motivo: Falta / Conduta violenta / Falta profissional (último homem)".

## Marcas na escalação
`buildMarks(incidents)` (por nome do jogador) põe ⚽ (gol, ícone de bola) e quadradinho
amarelo/vermelho (cartão) ao lado do nome. Nome longo (>13 chars) vira **sobrenome** e o ícone
fica **fora do truncate** (shrink-0) pra não ser cortado.

## Selo de fase
A API não manda comentário de "fim do 1º tempo". `CommentaryFeed` mostra a fase atual
(Intervalo / Fim de jogo) pelo status do evento, no topo.

## Tradução EN→PT — LibreTranslate self-hosted (sem tokens)
- **Container `libretranslate`** no servidor (modelos en+pt), bind em `172.17.0.1:5000`;
  containers Next alcançam via `host.docker.internal:5000` (env `LIBRETRANSLATE_URL` nos 2 .env.local).
- `src/lib/services/translate.ts`: cache em disco (`data/translations-en-pt.json`, volume
  compartilhado). **NÃO bloqueia a request**: retorna só o que já está em cache e traduz o resto
  em **background**, em lotes (CHUNK 12, ~6 frases/s → timeout 20s). Tradução aparece no poll
  seguinte. Fallback: se o LT cair, mostra o rótulo PT (feed nunca quebra).
- `MatchCommentary.textPt` é preenchido por `translateFeed` em match-detail.ts. O render prefere
  `textPt` (texto rico traduzido); na ausência, usa o rótulo PT.
- Por que LibreTranslate e não Claude: o usuário pediu pra **não gastar tokens** da Anthropic.
