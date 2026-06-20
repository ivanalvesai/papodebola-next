// Consulta o Google Search Console (Search Analytics) via service account.
// Auth: JWT RS256 -> OAuth2 (sem dependências externas). Credencial fora do repo.
//   node scripts/gsc-top-pages.mjs            (últimos 28 dias)
//   GSC_DAYS=7 node scripts/gsc-top-pages.mjs
// Credencial: C:/Users/ivans/.gsc/papodebola.json (ou env GSC_SA).
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

const d = (x) => new Date(x).toISOString().slice(0, 10);
const range = { startDate: d(Date.now() - DAYS * 864e5), endDate: d(Date.now()) };

function table(rows) {
  for (const r of rows) {
    console.log(
      `  ${String(Math.round(r.clicks)).padStart(4)} cliques | ${String(
        Math.round(r.impressions)
      ).padStart(6)} impr | CTR ${(r.ctr * 100).toFixed(1).padStart(4)}% | pos ${r.position
        .toFixed(1)
        .padStart(4)} | ${r.keys[0]}`
    );
  }
}

const token = await getToken();
console.log(`\nSite: ${SITE}  |  Período: ${range.startDate} a ${range.endDate}\n`);

console.log("== TOP PÁGINAS ==");
table(await query(token, { ...range, dimensions: ["page"], rowLimit: 30 }));

console.log("\n== TOP QUERIES ==");
table(await query(token, { ...range, dimensions: ["query"], rowLimit: 30 }));
