---
area: indice
data: 2026-06-18
---

# Resumo da sessão de 2026-06-18 — papodebola-next

Tênis ganhou coleta de dados de verdade. Duas frentes: (A) conserto do endpoint ao vivo
de tênis (estava sempre vazio) e (B) primeira **página de chaveamento de torneio de tênis
ao vivo**, modelo `/tenis/halle-2026` (ATP 500 de Halle), no mesmo padrão das páginas de
jogo da Copa/Série B (placar set a set, AO VIVO / Encerrado, polling no cliente).

## O que mudou
- **01-tenis-torneio-halle** — fallback `matches/ → events/` no `getSportData` (tênis usa
  `events/*`, não `matches/*`); filtro de torneios importantes (ATP/WTA/Grand Slam, fora
  ITF/UTR/Challenger); `skipDateFeeds` no tênis (o feed por data é 9MB+, estoura o cache de
  2MB); nova página `/tenis/halle-2026` com chaveamento R32→Final, foto do atleta (jogador =
  entidade `team`), bandeira de fallback, placar set a set e ao vivo via polling; banner de
  destaque na landing `/tenis`; entrada no sitemap.

## Gotchas dos endpoints de tênis (custaram investigação — ver doc 01)
- Tênis usa `events/*`; `matches/*` dá 404. Inverso do resto.
- Jogador de tênis = entidade `team` → foto em `/img/team/{id}/image` (`player/{id}` dá 0 bytes).
- País (bandeira) só vem do `match/{id}`, não do cuptree.
- O feed `tennis/events/{data}` tem ~1.500 jogos/dia (9MB+) → não cabe no cache de 2MB.

## Pendências deixadas para depois
- **Generalizar para outros torneios** (WTA Berlin, Wimbledon, etc.): só adicionar em
  `TENNIS_TOURNAMENTS` (precisa de `uniqueTournamentId` + `seasonId`). Considerar listagem
  automática dos torneios ATP/WTA em andamento na landing `/tenis`.
- **Indicador de quem saca**: hoje usa `firstToServe` (saque do início do jogo), não o
  servidor atual do game — a API não expõe isso sem point-by-point.
- **Doubles**: a página cobre simples; o cuptree de duplas é um `uniqueTournament` separado.
- Desligar/ajustar quando Halle terminar (22/06) — a página fica estática (tudo Encerrado),
  sem custo de API além do acesso eventual.
