// Relatório de baseline do Google Search Console (service account, sem deps).
//   node scripts/gsc-report.mjs          (últimos 28 dias)
//   GSC_DAYS=7 node scripts/gsc-report.mjs
// Saída: totais, CTR por aba do time, buckets de posição e top páginas. Usado pra medir
// antes/depois das mudanças de SEO (docs/knowledge/2026-10-25-baseline-gsc.md).
import crypto from "crypto";
import { readFileSync } from "fs";

const SA_PATH = process.env.GSC_SA || "C:/Users/ivans/.gsc/papodebola.json";
const SITE = process.env.GSC_SITE || "https://www.papodebola.com.br/";
const DAYS = Number(process.env.GSC_DAYS || 28);
const sa = JSON.parse(readFileSync(SA_PATH, "utf8"));

const b64url = (s) => Buffer.from(s).toString("base64url");

function signJwt(scope) {
  const now = Math.floor(Date.now() / 1000);
  const data =
    b64url(JSON.stringify({ alg: "RS256", typ: "JWT" })) +
    "." +
    b64url(
      JSON.stringify({
        iss: sa.client_email,
        scope,
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      })
    );
  const sig = crypto.createSign("RSA-SHA256").update(data).sign(sa.private_key, "base64url");
  return `${data}.${sig}`;
}

async function getToken() {
  const jwt = signJwt("https://www.googleapis.com/auth/webmasters.readonly");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("Falha no token: " + JSON.stringify(j));
  return j.access_token;
}

async function query(token, body) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (j.error) throw new Error("Erro na query: " + JSON.stringify(j.error));
  return j.rows || [];
}

const fmt = (d) => d.toISOString().slice(0, 10);
const end = new Date(Date.now() - 2 * 864e5);
const start = new Date(end - (DAYS - 1) * 864e5);
const pct = (c, i) => (i ? ((c / i) * 100).toFixed(2) + "%" : "-");

const token = await getToken();
const pages = await query(token, { startDate: fmt(start), endDate: fmt(end), dimensions: ["page"], rowLimit: 5000 });

const tot = pages.reduce((a, r) => ({ c: a.c + r.clicks, i: a.i + r.impressions }), { c: 0, i: 0 });
console.log(`Período: ${fmt(start)} a ${fmt(end)} (${DAYS} dias)`);
console.log(`Cliques ${tot.c} | Impressões ${tot.i} | CTR ${pct(tot.c, tot.i)}`);

const tabs = {};
for (const r of pages) {
  const m = r.keys[0].match(/\/futebol\/times\/[^/]+(?:\/([^/?#]+))?/);
  if (!m) continue;
  const k = m[1] || "hub";
  tabs[k] ??= { c: 0, i: 0, pos: 0 };
  tabs[k].c += r.clicks;
  tabs[k].i += r.impressions;
  tabs[k].pos += r.position * r.impressions;
}
console.log("\nAbas do time (cliques / impressões / CTR / posição média ponderada):");
for (const [k, v] of Object.entries(tabs).sort((a, b) => b[1].i - a[1].i))
  console.log(`  ${k.padEnd(16)} ${String(v.c).padStart(6)} ${String(v.i).padStart(9)} ${pct(v.c, v.i).padStart(7)}  ${(v.pos / v.i).toFixed(1)}`);

const buckets = [["1-3", 3], ["3-5", 5], ["5-10", 10], ["10-20", 20], ["20+", Infinity]];
const b = Object.fromEntries(buckets.map(([k]) => [k, { n: 0, c: 0, i: 0 }]));
for (const r of pages) {
  const [k] = buckets.find(([, max]) => r.position < max);
  b[k].n++; b[k].c += r.clicks; b[k].i += r.impressions;
}
console.log("\nPosição (páginas / cliques / impressões):");
for (const [k, v] of Object.entries(b)) console.log(`  ${k.padEnd(6)} ${String(v.n).padStart(5)} ${String(v.c).padStart(6)} ${String(v.i).padStart(9)}`);

console.log("\nTop 20 páginas por impressões:");
for (const r of pages.sort((a, b) => b.impressions - a.impressions).slice(0, 20))
  console.log(`  ${r.keys[0].replace(SITE, "/")}  c${r.clicks} i${r.impressions} ${pct(r.clicks, r.impressions)} p${r.position.toFixed(1)}`);
