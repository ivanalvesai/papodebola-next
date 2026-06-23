// Baixa as fotos dos jogadores de um torneio via API (SportApi7 / Sofascore) e grava
// no volume compartilhado data/player-images/{id}.webp. Servidas depois pela rota
// /api/player-img/[id] (ver src/app/api/player-img/[id]/route.ts).
//
// POR QUÊ: o Sofascore bloqueia o IP do servidor nas IMAGENS (Cloudflare "challenge"),
// então não dá pra servir direto nem fazer scrape. Mas a API autenticada (sportapi7)
// SERVE a foto (player/{id}/image -> WebP 150x150). Baixamos 1x e servimos do nosso
// volume — não depende mais do Sofascore nem da API atual (sobrevive a troca de API).
//
// QUANDO RODAR: ~1x por ano, ou quando trocar elenco. É barato (~1.500 chamadas, uma
// vez). O script PULA arquivos que já existem (não re-baixa à toa).
//
// COMO RODAR (no servidor, dentro do container que tem a env da API):
//   docker cp scripts/download-player-images.mjs papodebola-next-dev:/tmp/dl.mjs
//   docker exec papodebola-next-dev node /tmp/dl.mjs
//   # (opcional) outro torneio/temporada:
//   docker exec -e PDB_TOURNAMENT=16 -e PDB_SEASON=58210 papodebola-next-dev node /tmp/dl.mjs
//
// Copa do Mundo 2026 = tournament 16, season 58210 (default abaixo).
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.ALLSPORTS_API_KEY;
const HOST = process.env.ALLSPORTS_API_HOST || "sportapi7.p.rapidapi.com";
const TOURNAMENT = process.env.PDB_TOURNAMENT || "16";
const SEASON = process.env.PDB_SEASON || "58210";
const BASE = `https://${HOST}/api/v1`;
const H = { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST };
const DIR = "/app/data/player-images";

fs.mkdirSync(DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gj(p) {
  try {
    const r = await fetch(`${BASE}/${p}`, { headers: H });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

(async () => {
  if (!KEY) {
    console.error("Falta ALLSPORTS_API_KEY no ambiente.");
    process.exit(1);
  }
  // 1) times do torneio (standings)
  const st = await gj(`unique-tournament/${TOURNAMENT}/season/${SEASON}/standings/total`);
  const teams = new Set();
  (st?.standings || []).forEach((g) => (g.rows || []).forEach((r) => teams.add(r.team.id)));
  console.log("times:", teams.size);

  // 2) jogadores de cada elenco
  const players = new Set();
  for (const t of teams) {
    const sq = await gj(`team/${t}/players`);
    (sq?.players || []).forEach((p) => p.player?.id && players.add(p.player.id));
    await sleep(300);
  }
  console.log("jogadores:", players.size);

  // 3) baixa a foto de cada um (pula os que já temos)
  let ok = 0, fail = 0, skip = 0, n = 0;
  for (const pid of players) {
    n++;
    const f = path.join(DIR, `${pid}.webp`);
    if (fs.existsSync(f) && fs.statSync(f).size > 500) { skip++; continue; }
    try {
      const r = await fetch(`${BASE}/player/${pid}/image`, { headers: H });
      if (r.ok) {
        const b = Buffer.from(await r.arrayBuffer());
        if (b.length > 500) { fs.writeFileSync(f, b); ok++; } else fail++;
      } else fail++;
    } catch { fail++; }
    await sleep(150); // ~6/s, bem abaixo do limite de 20/s
    if (n % 200 === 0) console.log(`  ...${n}/${players.size} (${ok} ok, ${fail} sem foto)`);
  }
  console.log(`DONE: ${ok} baixadas, ${fail} sem foto/falha, ${skip} já tinham`);
})();
