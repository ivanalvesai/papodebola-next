#!/usr/bin/env node
/**
 * Scraper SisGel - Campeonatos Municipais de Santana de Parnaíba
 * Coleta classificação (por grupo), jogos por rodada e escudos
 * Roda via cron 2x/dia
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const BASE_URL = "https://prefeitura.santanadeparnaiba.sp.gov.br";
const DATA_DIR = path.join(__dirname, "..", "data");
const BADGES_DIR = path.join(__dirname, "..", "public", "escudos-municipal");
const OUTPUT_FILE = path.join(DATA_DIR, "sisgel.json");

const CHAMPIONSHIP_URLS = [
  { name: "1ª Divisão Futebol 2026", url: `${BASE_URL}/SisGel-PUB/campeonatos/lfB49S_FU1vwXm0fPah6fytx1WipJcZxDzPKxYy8KUa35E8M9NGYZaSUu906_RwF8WksUA2` },
  { name: "2ª Divisão Futebol 2026", url: `${BASE_URL}/SisGel-PUB/campeonatos/TDIedderUVYixOjHrO7iCB-Sk74kVcbdqbEOJMct24oYOULcippTRhg3cVMK3-Y9Qg_cFA2` },
  { name: "3ª Divisão Futebol 2026", url: `${BASE_URL}/SisGel-PUB/campeonatos/rVK-SWaj6a9vZd-RPyjPnnZtWfFsmnqNgVhFe_TqGnIakFkl9BtE8T3jtbAgMGxlOLS9MA2` },
  { name: "Veteraníssimo Futebol 2026", url: `${BASE_URL}/SisGel-PUB/campeonatos/01qzblJp6mFIWohqozrdGUrxdBzxl7-GoBF9VI0QXlqTlJlbfhnQIxNAKq3hZ_7FliN3CQ2` },
  { name: "Veterano Futebol 2026", url: `${BASE_URL}/SisGel-PUB/campeonatos/b-ffRktJmllFryKiP2pa-1QbzyDUeG8hrPcrgiHaOjSM64GpvgKLP_AHNSZ4x6Tsw4pwrg2` },
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const r = res.headers.location.startsWith("http") ? res.headers.location : `${BASE_URL}${res.headers.location}`;
        return fetch(r).then(resolve).catch(reject);
      }
      let d = ""; res.on("data", (ch) => (d += ch)); res.on("end", () => resolve(d)); res.on("error", reject);
    }).on("error", reject);
  });
}

function fetchBin(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const r = res.headers.location.startsWith("http") ? res.headers.location : `${BASE_URL}${res.headers.location}`;
        return fetchBin(r).then(resolve).catch(reject);
      }
      const ch = []; res.on("data", (c) => ch.push(c)); res.on("end", () => resolve(Buffer.concat(ch))); res.on("error", reject);
    }).on("error", reject);
  });
}

function dec(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").trim();
}

function slug(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

// Extract ALL team badges from EQUIPES table + match blocks
function extractAllBadges(html) {
  const badges = {};
  // Pattern: badge image followed by team name in next <td>
  const re1 = /src="(\/SisGel-PUB\/arquivo\/download-inline\/[^"]+)"[^<]*<\/div>\s*<\/td>\s*<td[^>]*>\s*([^<]+)/g;
  let m;
  while ((m = re1.exec(html)) !== null) {
    const name = dec(m[2]);
    if (name && name.length > 2 && !name.match(/^\d/)) badges[name] = `${BASE_URL}${m[1]}`;
  }
  // Pattern: badge in match block — home team (name BEFORE avatar)
  const re2 = /partida-item">\s*\n?\s*([A-ZÀ-Ü][^<\n]{2,40})\s*<div class="time-partida-avatar">\s*\n?\s*<img[^>]*src="([^"]+)"/g;
  while ((m = re2.exec(html)) !== null) {
    const name = dec(m[1]);
    if (name && !badges[name]) badges[name] = `${BASE_URL}${m[2]}`;
  }
  // Pattern: badge in match block — away team (avatar BEFORE name)
  const re3 = /alt="Time B"[^>]*src="([^"]+)"[^<]*<\/div>\s*\n?\s*([A-ZÀ-Ü][^<\n]{2,40})\s*<\/div>/g;
  while ((m = re3.exec(html)) !== null) {
    const name = dec(m[2]);
    if (name && !badges[name]) badges[name] = `${BASE_URL}${m[1]}`;
  }
  return badges;
}

function parseClassification(html) {
  const tdRe = /<td[^>]*>\s*([^<]+?)\s*<\/td>/g;
  const tds = [];
  let m;
  while ((m = tdRe.exec(html)) !== null) {
    const v = dec(m[1]);
    if (v && v !== " ") tds.push(v);
  }

  const teams = [];
  let i = 0;
  while (i + 11 < tds.length) {
    const ps = tds[i].replace(/[^\d]/g, "");
    if (ps && parseInt(ps) > 0 && parseInt(ps) <= 30) {
      const nm = tds[i + 1];
      if (nm && isNaN(parseInt(nm)) && nm.length > 2) {
        teams.push({
          pos: parseInt(ps), name: nm,
          pts: parseInt(tds[i + 2]) || 0, games: parseInt(tds[i + 3]) || 0,
          wins: parseInt(tds[i + 4]) || 0, draws: parseInt(tds[i + 5]) || 0,
          losses: parseInt(tds[i + 6]) || 0, gf: parseInt(tds[i + 7]) || 0,
          ga: parseInt(tds[i + 8]) || 0, gd: parseInt(tds[i + 9]) || 0,
          badge: "",
        });
        i += 12; continue;
      }
    }
    i++;
  }

  // Detect groups by position reset
  let grp = 1, last = 0;
  const grouped = {};
  for (const t of teams) {
    if (t.pos <= last && t.pos <= 2 && last > 2) grp++;
    if (!grouped[grp]) grouped[grp] = [];
    grouped[grp].push(t);
    last = t.pos;
  }
  return Object.entries(grouped).map(([n, t]) => ({ name: `Grupo ${n}`, teams: t }));
}

function parseMatches(html) {
  const matches = [];
  const blocks = html.split(/href="\/SisGel-PUB\/jogo\//);

  for (let j = 1; j < blocks.length; j++) {
    const gb = blocks[j].substring(0, 3000);

    // Round — find active rodada from context
    let round = 0;
    const pos = html.indexOf(blocks[j].substring(0, 50));
    if (pos > 0) {
      const ctx = html.substring(Math.max(0, pos - 5000), pos);
      const rms = ctx.match(/data-rodada="(\d+)"/g);
      if (rms) round = parseInt(rms[rms.length - 1].match(/\d+/)[0]) || 0;
    }

    // Date: "sex - 10/04/2026" or just "10/04/2026"
    const dateM = gb.match(/(\d{2}\/\d{2}\/\d{4})/);
    // Time: "19h30" or "19:30" or standalone after date
    const timeM = gb.match(/(\d{1,2}h\d{2}|\d{2}:\d{2})/);
    // Venue
    const venueM = gb.match(/(?:EST[AÁ]DIO|CAMPO|QUADRA)[^<]*/i);

    // Home team: text BEFORE first avatar in first partida-item
    const homeM = gb.match(/partida-item">\s*\n?\s*([A-ZÀ-Ü][^\n<]{2,40}?)\s*<div class="time-partida-avatar"/);
    // Away team: text AFTER second avatar (Time B)
    const awayM = gb.match(/alt="Time B"[^>]*>[^<]*<\/div>\s*\n?\s*([A-ZÀ-Ü][^\n<]{2,40}?)\s*<\/div>/);

    // Scores
    const scores = [];
    const sRe = /font-size:\s*x-large[^>]*>\s*(\d+)\s*</g;
    let sm;
    while ((sm = sRe.exec(gb)) !== null) scores.push(parseInt(sm[1]));

    // Status
    const statusM = gb.match(/partida-situacao">([^<]+)/);

    // Badges
    const badgeA = gb.match(/alt="Time A"[^>]*src="([^"]+)"/);
    const badgeB = gb.match(/alt="Time B"[^>]*src="([^"]+)"/);

    const home = homeM ? dec(homeM[1]) : "?";
    const away = awayM ? dec(awayM[1]) : "?";

    if (home !== "?" || away !== "?") {
      matches.push({
        round,
        home, away,
        homeScore: scores.length >= 2 ? scores[0] : null,
        awayScore: scores.length >= 2 ? scores[1] : null,
        date: dateM?.[1] || "",
        time: timeM?.[1] || "",
        venue: venueM ? dec(venueM[0]) : "",
        status: statusM ? dec(statusM[1]) : "",
        homeBadgeLocal: "",
        awayBadgeLocal: "",
      });
    }
  }
  return matches;
}

async function downloadBadges(allBadges) {
  fs.mkdirSync(BADGES_DIR, { recursive: true });
  const localMap = {};
  for (const [name, url] of Object.entries(allBadges)) {
    const fn = `${slug(name)}.png`;
    const fp = path.join(BADGES_DIR, fn);
    if (!fs.existsSync(fp)) {
      try {
        const buf = await fetchBin(url);
        if (buf.length > 100) { fs.writeFileSync(fp, buf); console.log(`    Badge: ${name}`); }
      } catch (e) { console.error(`    Badge err ${name}: ${e.message}`); }
      await new Promise((r) => setTimeout(r, 200));
    }
    localMap[name] = `/escudos-municipal/${fn}`;
  }
  return localMap;
}

async function scrapeOne(entry) {
  console.log(`\n  Fetching: ${entry.name}`);
  const html = await fetch(entry.url);
  if (html.includes("Erro - SisGel") || html.length < 5000) { console.log("  SKIP: token expired"); return null; }

  const nameM = html.match(/<h5[^>]*><strong>([^<]+)<\/strong>/);
  const pageName = nameM ? dec(nameM[1]) : entry.name;

  const groups = parseClassification(html);
  const matches = parseMatches(html);
  const allBadges = extractAllBadges(html);
  const totalTeams = groups.reduce((s, g) => s + g.teams.length, 0);

  console.log(`  ${pageName}: ${groups.length} grupos, ${totalTeams} times, ${matches.length} jogos, ${Object.keys(allBadges).length} escudos`);

  const localBadges = await downloadBadges(allBadges);

  // Apply badges
  for (const g of groups) for (const t of g.teams) t.badge = localBadges[t.name] || "";
  for (const m of matches) {
    m.homeBadgeLocal = localBadges[m.home] || "";
    m.awayBadgeLocal = localBadges[m.away] || "";
  }

  const byRound = {};
  for (const m of matches) { const k = m.round || 0; if (!byRound[k]) byRound[k] = []; byRound[k].push(m); }

  return {
    name: pageName, slug: slug(pageName),
    city: "Santana de Parnaiba", state: "SP", year: "2026",
    url: entry.url, groups, matches, matchesByRound: byRound,
    totalRounds: Object.keys(byRound).length,
    updatedAt: new Date().toISOString(),
  };
}

async function main() {
  console.log(`[${new Date().toISOString()}] SisGel scraper v3`);
  const results = [];
  for (const entry of CHAMPIONSHIP_URLS) {
    try {
      const r = await scrapeOne(entry);
      if (r) results.push(r);
    } catch (e) { console.error(`  Error: ${e.message}`); }
    await new Promise((r) => setTimeout(r, 500));
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nSaved ${results.length} championships`);
}

main().catch((e) => { console.error(e); process.exit(1); });
