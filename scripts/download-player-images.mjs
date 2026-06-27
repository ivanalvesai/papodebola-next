// Baixa as FOTOS dos jogadores via API autenticada (allsportsapi2: /api/player/{id}/image)
// e grava no volume data/player-images/{id}.webp. Servidas pela rota /api/player-img/[id].
//
// POR QUÊ: o Sofascore bloqueia o IP do servidor nas imagens. A API autenticada serve a
// foto sem bloqueio. Baixando 1x e servindo do volume, não depende mais do Sofascore.
//
// Coleta os times dos SNAPSHOTS já salvos (data/snapshots/*) e baixa o elenco de cada um
// (team/{id}/players -> player/{id}/image). Cobre Copa, Libertadores, Sudamericana,
// Série A/B etc. Pula fotos que já existem.
//
// COMO RODAR (no servidor, dentro do container que tem a env da API):
//   docker cp scripts/download-player-images.mjs papodebola-next-dev:/tmp/dl.mjs
//   docker exec papodebola-next-dev node /tmp/dl.mjs
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.ALLSPORTS_API_KEY;
const HOST = process.env.ALLSPORTS_API_HOST || "allsportsapi2.p.rapidapi.com";
const BASE = `https://${HOST}/api`;
const H = { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST };
const DIR = "/app/data/player-images";
const SNAP = "/app/data/snapshots";

fs.mkdirSync(DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJSON = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };
async function gj(p) {
  try { const r = await fetch(`${BASE}/${p}`, { headers: H }); return r.ok ? await r.json() : null; } catch { return null; }
}
function collectIds(obj, ids) {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) { for (const x of obj) collectIds(x, ids); return; }
  if (typeof obj.teamId === "number") ids.add(obj.teamId);
  if (typeof obj.homeId === "number") ids.add(obj.homeId);
  if (typeof obj.awayId === "number") ids.add(obj.awayId);
  for (const k of Object.keys(obj)) collectIds(obj[k], ids);
}

(async () => {
  if (!KEY) { console.error("Falta ALLSPORTS_API_KEY."); process.exit(1); }

  // 1) times dos snapshots
  const teams = new Set();
  for (const sub of ["championships", "worldcup"]) {
    const dir = path.join(SNAP, sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) collectIds(readJSON(path.join(dir, f)), teams);
  }
  console.log("times:", teams.size);

  // 2) jogadores de cada elenco
  const players = new Set();
  for (const t of teams) {
    const sq = await gj(`team/${t}/players`);
    (sq?.players || []).forEach((p) => p.player?.id && players.add(p.player.id));
    await sleep(200);
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
    await sleep(150);
    if (n % 200 === 0) console.log(`  ...${n}/${players.size} (${ok} ok, ${fail} sem foto, ${skip} já tinham)`);
  }
  console.log(`DONE: ${ok} baixadas, ${fail} sem foto/falha, ${skip} já tinham`);
})();
