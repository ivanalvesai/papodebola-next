// Baixa as FOTOS dos elencos dos times de jogos específicos (posts "onde assistir", escalação
// no campinho) pro volume data/player-images/{id}.webp, servidas por /api/player-img/[id].
// Coleta: titulares/reservas do snapshot do jogo + elenco completo dos dois times.
// Pula quem já tem foto. Cadência ≥350 ms (rate limit da API).
//   docker cp scripts/download-match-player-images.mjs papodebola-next-dev:/tmp/dlm.mjs
//   docker exec papodebola-next-dev node /tmp/dlm.mjs 15534197 15537775 ...
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.ALLSPORTS_API_KEY;
const HOST = process.env.ALLSPORTS_API_HOST || "allsportsapi2.p.rapidapi.com";
const BASE = `https://${HOST}/api`;
const H = { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST };
const DIR = "/app/data/player-images";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJSON = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };
async function gj(p) { try { const r = await fetch(`${BASE}/${p}`, { headers: H }); return r.ok ? await r.json() : null; } catch { return null; } }

if (!KEY) { console.error("Falta ALLSPORTS_API_KEY."); process.exit(1); }
fs.mkdirSync(DIR, { recursive: true });
const players = new Set();
const teams = new Set();
for (const id of process.argv.slice(2)) {
  const m = readJSON(`/app/data/snapshots/matches/${id}.json`);
  if (!m) { console.log(`jogo ${id}: sem snapshot`); continue; }
  teams.add(m.event.homeId); teams.add(m.event.awayId);
  for (const side of [m.home, m.away]) for (const p of [...(side?.starters || []), ...(side?.bench || [])]) if (p.id) players.add(p.id);
}
for (const t of teams) {
  const sq = await gj(`team/${t}/players`);
  (sq?.players || []).forEach((p) => p.player?.id && players.add(p.player.id));
  await sleep(350);
}
let ok = 0, fail = 0, skip = 0;
const missing = [];
for (const pid of players) {
  const f = path.join(DIR, `${pid}.webp`);
  if (fs.existsSync(f) && fs.statSync(f).size > 500) { skip++; continue; }
  try {
    const r = await fetch(`${BASE}/player/${pid}/image`, { headers: H });
    const b = r.ok ? Buffer.from(await r.arrayBuffer()) : null;
    if (b && b.length > 500) { fs.writeFileSync(f, b); ok++; } else { fail++; missing.push(`${pid}:${r.status}`); }
  } catch { fail++; missing.push(`${pid}:err`); }
  await sleep(350);
}
console.log(`times ${teams.size}, jogadores ${players.size}: ${ok} baixadas, ${skip} já tinham, ${fail} sem foto`);
if (missing.length) console.log("sem foto:", missing.slice(0, 40).join(" "));
