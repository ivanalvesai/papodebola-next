// Inspeciona o status de indexação de URLs no Google (URL Inspection API).
//   node scripts/gsc-inspect.mjs <url1> <url2> ...
// Sem args, usa uma lista de exemplo. Cred: C:/Users/ivans/.gsc/papodebola.json.
import crypto from "crypto";
import { readFileSync } from "fs";

const SA_PATH = process.env.GSC_SA || "C:/Users/ivans/.gsc/papodebola.json";
const SITE = process.env.GSC_SITE || "https://www.papodebola.com.br/";
const sa = JSON.parse(readFileSync(SA_PATH, "utf8"));
const b64url = (s) => Buffer.from(s).toString("base64url");

function signJwt(scope) {
  const now = Math.floor(Date.now() / 1000);
  const data =
    b64url(JSON.stringify({ alg: "RS256", typ: "JWT" })) +
    "." +
    b64url(JSON.stringify({ iss: sa.client_email, scope, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  return data + "." + crypto.createSign("RSA-SHA256").update(data).sign(sa.private_key, "base64url");
}

async function getToken() {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signJwt("https://www.googleapis.com/auth/webmasters.readonly"),
    }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("token: " + JSON.stringify(j));
  return j.access_token;
}

async function inspect(token, url) {
  const r = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE }),
  });
  const j = await r.json();
  if (j.error) return { url, erro: j.error.message };
  const i = j.inspectionResult?.indexStatusResult || {};
  return {
    url,
    verdict: i.verdict, // PASS | NEUTRAL | FAIL
    cobertura: i.coverageState, // "Submitted and indexed" | "Crawled - currently not indexed" | ...
    googleCanonical: i.googleCanonical,
    ultimoCrawl: i.lastCrawlTime || "—",
    robots: i.robotsTxtState,
    indexacao: i.indexingState,
  };
}

const urls =
  process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : [
        "https://www.papodebola.com.br/futebol/copa-do-mundo/jogo/15-06-2026/belgica-egito",
        "https://www.papodebola.com.br/futebol/copa-do-mundo/jogo/20-06-2026/holanda-suecia",
        "https://www.papodebola.com.br/futebol/copa-do-mundo/jogo/21-06-2026/uruguai-cabo-verde",
        "https://www.papodebola.com.br/sobre",
      ];

const token = await getToken();
for (const u of urls) {
  const r = await inspect(token, u);
  console.log("\n" + r.url);
  if (r.erro) {
    console.log("  ERRO:", r.erro);
    continue;
  }
  console.log(`  veredito: ${r.verdict} | cobertura: ${r.cobertura}`);
  console.log(`  último crawl: ${r.ultimoCrawl} | robots: ${r.robots} | indexação: ${r.indexacao}`);
  if (r.googleCanonical && r.googleCanonical !== u) console.log(`  canônica do Google: ${r.googleCanonical}`);
}
