// Baixa os ESCUDOS dos times via API autenticada (team/{id}/image) e grava no volume
// compartilhado data/team-images/{id}.png. Servidos depois pela rota /api/team-img/[id].
//
// POR QUÊ: o proxy /img/team bate no Sofascore, que BLOQUEIA o IP do servidor nas imagens
// (403) → escudos quebram. A API autenticada (sportapi7) serve o escudo sem bloqueio.
// Baixando 1x e servindo do nosso volume, não depende mais do Sofascore nem da API atual.
//
// QUANDO RODAR: ~1x por temporada, ou quando entrar competição nova. Pula os que já existem.
//
// COMO RODAR (no servidor, dentro do container que tem a env da API):
//   docker cp scripts/download-team-images.mjs papodebola-next-dev:/tmp/dlt.mjs
//   docker exec papodebola-next-dev node /tmp/dlt.mjs
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.ALLSPORTS_API_KEY;
const HOST = process.env.ALLSPORTS_API_HOST || "sportapi7.p.rapidapi.com";
const BASE = `https://${HOST}/api/v1`;
const H = { "x-rapidapi-key": KEY, "x-rapidapi-host": HOST };
const DIR = "/app/data/team-images";

// [uniqueTournamentId, seasonId] das competições cujos escudos queremos arquivar.
// Libertadores e Sudamericana = foco do pedido; + ligas BR + Copa do Mundo (seleções).
const TOURNAMENTS = [
  [384, 87760], // Libertadores
  [480, 87770], // Sudamericana
  [325, 87678], // Brasileirão Série A
  [390, 89840], // Brasileirão Série B
  [373, 89353], // Copa do Brasil
  [16, 58210],  // Copa do Mundo 2026 (seleções)
];

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

  // 1) coleta os ids dos times (standings de cada competição) + jogos (pra pegar quem
  //    não aparece em tabela, ex.: mata-mata).
  const teams = new Set();
  for (const [t, s] of TOURNAMENTS) {
    const st = await gj(`unique-tournament/${t}/season/${s}/standings/total`);
    (st?.standings || []).forEach((g) => (g.rows || []).forEach((r) => r.team?.id && teams.add(r.team.id)));
    await sleep(300);
  }
  console.log("times encontrados:", teams.size);

  // 2) baixa o escudo de cada um (pula os que já temos)
  let ok = 0, fail = 0, skip = 0, n = 0;
  for (const tid of teams) {
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
    if (n % 50 === 0) console.log(`  ...${n}/${teams.size} (${ok} ok, ${fail} sem escudo)`);
  }
  console.log(`DONE: ${ok} baixados, ${fail} sem escudo/falha, ${skip} já tinham`);
})();
