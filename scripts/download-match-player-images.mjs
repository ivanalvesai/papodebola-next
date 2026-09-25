// Baixa as FOTOS de todos os jogadores de UM JOGO (escalação titular + banco + quem
// aparece no lance a lance) e grava em data/player-images/{id}.webp — o mesmo arquivo
// que a rota /api/player-img/[id] serve. Assim as fotos do lance a lance sobrevivem à
// API sair do ar. Também baixa os escudos dos dois times (data/team-images/{id}.png).
//
// COMO RODAR (no servidor, dentro do container que tem a env da API):
//   docker cp scripts/download-match-player-images.mjs papodebola-next-dev:/tmp/dlm.mjs
//   docker exec papodebola-next-dev node /tmp/dlm.mjs 16814493 [outroId ...]
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.ALLSPORTS_API_KEY;
const HOST = process.env.ALLSPORTS_API_HOST || "allsportsapi2.p.rapidapi.com";
const BASE = `https://${HOST}/api`;
const H = { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST };
const DIR = "/app/data/player-images";
const TEAM_DIR = "/app/data/team-images";
const SNAP = "/app/data/snapshots/matches";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJSON = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };
async function gj(p) {
  try { const r = await fetch(`${BASE}/${p}`, { headers: H }); return r.ok ? await r.json() : null; } catch { return null; }
}
async function download(url, file) {
  if (fs.existsSync(file) && fs.statSync(file).size > 500) return "skip";
  try {
    const r = await fetch(url, { headers: H });
    if (!r.ok) return "fail";
    const b = Buffer.from(await r.arrayBuffer());
    if (b.length <= 500) return "fail";
    fs.writeFileSync(file, b);
    return "ok";
  } catch { return "fail"; }
}

(async () => {
  const ids = process.argv.slice(2).map(Number).filter(Boolean);
  if (!KEY) { console.error("Falta ALLSPORTS_API_KEY."); process.exit(1); }
  if (!ids.length) { console.error("Uso: node dlm.mjs <matchId> [...]"); process.exit(1); }
  fs.mkdirSync(DIR, { recursive: true });
  fs.mkdirSync(TEAM_DIR, { recursive: true });

  for (const id of ids) {
    const players = new Set();
    const teams = new Set();

    // 1) escalações pela API (titulares + banco dos dois lados)
    const lu = await gj(`match/${id}/lineups`);
    for (const side of ["home", "away"]) {
      for (const p of lu?.[side]?.players || []) p?.player?.id && players.add(p.player.id);
      for (const p of lu?.[side]?.missingPlayers || []) p?.player?.id && players.add(p.player.id);
    }
    // 2) quem aparece no lance a lance / incidentes (inclui quem entrou depois)
    const inc = await gj(`match/${id}/incidents`);
    for (const i of inc?.incidents || []) {
      for (const k of ["player", "assist1", "playerIn", "playerOut"]) i?.[k]?.id && players.add(i[k].id);
    }
    // 3) o snapshot salvo (se a API já tiver caído, ainda pega os ids dos lances)
    const snap = readJSON(path.join(SNAP, `${id}.json`));
    for (const c of snap?.commentary || []) {
      for (const k of ["playerId", "playerInId", "playerOutId"]) typeof c?.[k] === "number" && players.add(c[k]);
    }
    for (const side of ["home", "away"]) {
      for (const p of [...(snap?.[side]?.starters || []), ...(snap?.[side]?.bench || [])]) p?.id && players.add(p.id);
    }
    const ev = await gj(`match/${id}`);
    const homeId = ev?.event?.homeTeam?.id || snap?.event?.homeId;
    const awayId = ev?.event?.awayTeam?.id || snap?.event?.awayId;
    homeId && teams.add(homeId);
    awayId && teams.add(awayId);

    console.log(`jogo ${id}: ${players.size} jogadores, ${teams.size} times`);
    let ok = 0, fail = 0, skip = 0;
    for (const pid of players) {
      const r = await download(`${BASE}/player/${pid}/image`, path.join(DIR, `${pid}.webp`));
      r === "ok" ? ok++ : r === "skip" ? skip++ : fail++;
      if (r !== "skip") await sleep(250);
    }
    for (const tid of teams) {
      const r = await download(`${BASE}/team/${tid}/image`, path.join(TEAM_DIR, `${tid}.png`));
      console.log(`  escudo ${tid}: ${r}`);
      await sleep(250);
    }
    console.log(`  fotos: ${ok} baixadas, ${skip} já tinham, ${fail} sem foto/falha`);
  }
})();
