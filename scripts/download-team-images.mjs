// Baixa os ESCUDOS dos times via API autenticada (allsportsapi2: /api/team/{id}/image)
// e grava no volume data/team-images/{id}.png. Servidos pela rota /api/team-img/[id].
//
// POR QUÊ: o proxy /img/team bate no Sofascore, que BLOQUEIA o IP do servidor (403) →
// escudos quebram. A API autenticada serve o escudo sem bloqueio. Baixando 1x e servindo
// do volume, não depende mais do Sofascore nem da API atual.
//
// Coleta os ids dos times dos SNAPSHOTS já salvos (data/snapshots/*) — assim cobre
// Libertadores, Sudamericana, Série A/B, Copa do Brasil e Copa do Mundo sem chamar a API
// de tabela. Pula escudos que já existem.
//
// COMO RODAR (no servidor, dentro do container que tem a env da API):
//   docker cp scripts/download-team-images.mjs papodebola-next-dev:/tmp/dlt.mjs
//   docker exec papodebola-next-dev node /tmp/dlt.mjs
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.ALLSPORTS_API_KEY;
const HOST = process.env.ALLSPORTS_API_HOST || "allsportsapi2.p.rapidapi.com";
const BASE = `https://${HOST}/api`;
const H = { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST };
const DIR = "/app/data/team-images";
const SNAP = "/app/data/snapshots";

fs.mkdirSync(DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJSON = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };

// Coleta ids de team a partir de qualquer estrutura de snapshot (standings + jogos).
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

  const ids = new Set();
  for (const sub of ["championships", "worldcup"]) {
    const dir = path.join(SNAP, sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) collectIds(readJSON(path.join(dir, f)), ids);
  }
  console.log("times encontrados nos snapshots:", ids.size);

  let ok = 0, fail = 0, skip = 0, n = 0;
  for (const tid of ids) {
    n++;
    const f = path.join(DIR, `${tid}.png`);
    if (fs.existsSync(f) && fs.statSync(f).size > 500) { skip++; continue; }
    try {
      const r = await fetch(`${BASE}/team/${tid}/image`, { headers: H });
      if (r.ok) {
        const b = Buffer.from(await r.arrayBuffer());
        if (b.length > 500) { fs.writeFileSync(f, b); ok++; } else fail++;
      } else fail++;
    } catch { fail++; }
    await sleep(150);
    if (n % 50 === 0) console.log(`  ...${n}/${ids.size} (${ok} ok, ${fail} sem escudo)`);
  }
  console.log(`DONE: ${ok} baixados, ${fail} sem escudo/falha, ${skip} já tinham`);
})();
