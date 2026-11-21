#!/usr/bin/env node
// Completa os snapshots de jogo (data/snapshots/matches/{id}.json) com o contexto que a /v1
// passou a expor em 18/11/2026: campeonato, fase, agregado, jogo de ida, técnicos e capacidade
// do estádio. Lê só o cache bruto da API em disco (data/api-cache), SEM consultar a API.
// Fonte por jogo: a resposta de match/{id} (completa) e, se não houver, o evento nos feeds de
// rodada (sem técnicos nem capacidade). Só ACRESCENTA campos; nada existente é apagado.
//
// Rodar no container do dev (o volume é compartilhado com a prod):
//   docker cp scripts/backfill-match-context.mjs papodebola-next-dev:/tmp/ && \
//   docker exec papodebola-next-dev node /tmp/backfill-match-context.mjs [--dry]
import fs from "node:fs";

const DATA = process.env.PDB_DATA || "/app/data";
const CACHE = `${DATA}/api-cache/`;
const MATCHES = `${DATA}/snapshots/matches/`;
const CHAMPS = `${DATA}/snapshots/championships/`;
const DRY = process.argv.includes("--dry");

// Mesmo mapa de src/lib/match-labels.ts (KO_LABEL).
const KO_LABEL = {
  "round-of-128": "64 avos de final", "round-of-64": "32 avos de final", "round-of-32": "16 avos de final",
  "round-of-16": "Oitavas de final", quarterfinals: "Quartas de final", "quarter-finals": "Quartas de final",
  semifinals: "Semifinal", "semi-finals": "Semifinal", final: "Final", "3rd-place": "Disputa de 3º lugar", "third-place": "Disputa de 3º lugar",
};
const koLabel = (slug, name) => (slug && KO_LABEL[slug]) || name || "Fase final";

// Nome PT do campeonato pelo id (os snapshots de campeonato guardam o nome do nosso config).
const champName = new Map();
for (const f of fs.readdirSync(CHAMPS)) {
  try {
    const s = JSON.parse(fs.readFileSync(CHAMPS + f, "utf8"));
    const t = (s.data || s).tournament;
    if (t?.id && t?.name) champName.set(t.id, t.name);
  } catch {}
}

// Índice de eventos crus: match/{id} tem prioridade sobre o evento vindo de feed de rodada.
const full = new Map();
const fromFeed = new Map();
for (const f of fs.readdirSync(CACHE)) {
  let x;
  try { x = JSON.parse(fs.readFileSync(CACHE + f, "utf8")); } catch { continue; }
  const ep = String(x.endpoint || "");
  const d = x.data;
  if (/^match\/\d+$/.test(ep) && d?.event?.id) full.set(d.event.id, d.event);
  else if (/\/matches\/round\//.test(ep) && Array.isArray(d?.events)) for (const e of d.events) if (e?.id && !fromFeed.has(e.id)) fromFeed.set(e.id, e);
}

function context(e) {
  const ut = e?.tournament?.uniqueTournament;
  const tid = ut?.id ?? null;
  const ri = e?.roundInfo;
  const hA = e?.homeScore?.aggregated, aA = e?.awayScore?.aggregated;
  return {
    tournamentId: tid,
    tournament: (tid && champName.get(tid)) || ut?.name || e?.tournament?.name || null,
    round: ri
      ? { number: typeof ri.round === "number" ? ri.round : null, label: ri.slug ? koLabel(ri.slug, ri.name) : typeof ri.round === "number" ? `Rodada ${ri.round}` : ri.name || "", slug: ri.slug || null, knockout: !!ri.slug }
      : null,
    aggregate: typeof hA === "number" && typeof aA === "number" ? { home: hA, away: aA } : null,
    aggWinnerCode: typeof e?.aggregatedWinnerCode === "number" ? e.aggregatedWinnerCode : null,
    previousLegId: typeof e?.previousLegEventId === "number" ? e.previousLegEventId : null,
    managers: e?.homeTeam?.manager || e?.awayTeam?.manager ? { home: e?.homeTeam?.manager?.name || null, away: e?.awayTeam?.manager?.name || null } : null,
  };
}

let seen = 0, fromFull = 0, fromRound = 0, none = 0, already = 0;
for (const f of fs.readdirSync(MATCHES)) {
  if (!f.endsWith(".json")) continue;
  seen++;
  const path = MATCHES + f;
  let s;
  try { s = JSON.parse(fs.readFileSync(path, "utf8")); } catch { continue; }
  const d = s.data || s;
  const ev = d.event;
  if (!ev?.id) continue;
  if (ev.round !== undefined && ev.tournament !== undefined) { already++; continue; }
  const raw = full.get(ev.id) || fromFeed.get(ev.id);
  if (!raw) { none++; continue; }
  const ctx = context(raw);
  // Só preenche o que falta (nunca sobrescreve campo já gravado pelo código novo).
  for (const [k, v] of Object.entries(ctx)) if (ev[k] === undefined || ev[k] === null) ev[k] = v;
  if (ev.venue && ev.venue.capacity == null && full.has(ev.id)) {
    const c = raw.venue?.capacity ?? raw.venue?.stadium?.capacity;
    if (typeof c === "number") ev.venue.capacity = c;
  }
  full.has(ev.id) ? fromFull++ : fromRound++;
  if (!DRY) fs.writeFileSync(path, JSON.stringify(s));
}
console.log(JSON.stringify({ dry: DRY, snapshots: seen, completosPorMatch: fromFull, soPorFeedDeRodada: fromRound, semFonte: none, jaTinham: already }));
