#!/usr/bin/env node
/**
 * Scraper SisGel - Campeonatos Municipais de Santana de Parnaíba
 * Coleta classificação (por grupo), jogos e escudos
 * Roda via cron 2x/dia
 *
 * URLs dos campeonatos são fornecidas manualmente (tokens de sessão).
 * Se um token expirar (página retorna erro), o scraper tenta a listagem.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const BASE_URL = "https://prefeitura.santanadeparnaiba.sp.gov.br";
const CAMPEONATOS_URL = `${BASE_URL}/SisGel-PUB/campeonatos`;
const DATA_DIR = path.join(__dirname, "..", "data");
const BADGES_DIR = path.join(__dirname, "..", "public", "escudos-municipal");
const OUTPUT_FILE = path.join(DATA_DIR, "sisgel.json");

// URLs dos campeonatos 2026 (atualizar tokens se expirarem)
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
        const redir = res.headers.location.startsWith("http") ? res.headers.location : `${BASE_URL}${res.headers.location}`;
        return fetch(redir).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function fetchBinary(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redir = res.headers.location.startsWith("http") ? res.headers.location : `${BASE_URL}${res.headers.location}`;
        return fetchBinary(redir).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function dec(str) {
  return str.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, " ").trim();
}

function slugify(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function parseClassification(html) {
  const tdRe = /<td[^>]*>\s*([^<]+?)\s*<\/td>/g;
  const tds = [];
  let m;
  while ((m = tdRe.exec(html)) !== null) {
    const val = dec(m[1]);
    if (val && val !== " ") tds.push(val);
  }

  const teams = [];
  let i = 0;
  while (i + 11 < tds.length) {
    const posStr = tds[i].replace(/[^\d]/g, "");
    if (posStr && parseInt(posStr) > 0 && parseInt(posStr) <= 30) {
      const name = tds[i + 1];
      if (name && isNaN(parseInt(name)) && name.length > 2) {
        teams.push({
          pos: parseInt(posStr),
          name,
          pts: parseInt(tds[i + 2]) || 0,
          games: parseInt(tds[i + 3]) || 0,
          wins: parseInt(tds[i + 4]) || 0,
          draws: parseInt(tds[i + 5]) || 0,
          losses: parseInt(tds[i + 6]) || 0,
          gf: parseInt(tds[i + 7]) || 0,
          ga: parseInt(tds[i + 8]) || 0,
          gd: parseInt(tds[i + 9]) || 0,
          badge: "",
        });
        i += 12;
        continue;
      }
    }
    i++;
  }

  // Detect groups by position reset
  let currentGroup = 1;
  let lastPos = 0;
  const groupedTeams = {};

  for (const team of teams) {
    if (team.pos <= lastPos && team.pos <= 2 && lastPos > 2) {
      currentGroup++;
    }
    if (!groupedTeams[currentGroup]) groupedTeams[currentGroup] = [];
    groupedTeams[currentGroup].push(team);
    lastPos = team.pos;
  }

  const groups = [];
  for (const [groupNum, groupTeams] of Object.entries(groupedTeams)) {
    groups.push({ name: `Grupo ${groupNum}`, teams: groupTeams });
  }

  return groups;
}

function parseMatches(html) {
  const matches = [];
  const gameBlocks = html.split(/href="\/SisGel-PUB\/jogo\//);

  for (let j = 1; j < gameBlocks.length; j++) {
    const gb = gameBlocks[j];

    // Round number
    let round = 0;
    const idx = html.indexOf(gb.substring(0, 40));
    if (idx > 0) {
      const before = html.substring(Math.max(0, idx - 2000), idx);
      const rm = before.match(/data-rodada="(\d+)"/g);
      if (rm) round = parseInt(rm[rm.length - 1].match(/\d+/)[0]) || 0;
    }

    // Team names
    const teamTexts = [];
    const partidaItems = gb.split(/partida-item/);
    for (const pi of partidaItems) {
      const textBefore = pi.match(/^">\s*\n?\s*([A-ZÀ-Ü][A-Za-zÀ-ü\s\.\/\(\)]+)\s*<div/);
      const textAfter = pi.match(/<\/div>\s*\n?\s*([A-ZÀ-Ü][A-Za-zÀ-ü\s\.\/\(\)]+)\s*<\/div>/);
      if (textBefore) teamTexts.push(dec(textBefore[1]));
      if (textAfter) teamTexts.push(dec(textAfter[1]));
    }

    // Scores
    const scores = [];
    const scoreRe = /font-size:\s*x-large[^>]*>\s*(\d+)\s*</g;
    let sm;
    while ((sm = scoreRe.exec(gb)) !== null) scores.push(parseInt(sm[1]));

    const dateMatch = gb.match(/(\d{2}\/\d{2}\/\d{4})/);
    const timeMatch = gb.match(/(\d{2}:\d{2})/);
    const statusMatch = gb.match(/partida-situacao">([^<]+)</);

    const badges = [];
    const badgeRe = /alt="(?:Time [AB]|Foto Time)"[^>]*src="([^"]+)"/g;
    let bm;
    while ((bm = badgeRe.exec(gb)) !== null) badges.push(bm[1]);

    if (teamTexts.length >= 2 || scores.length >= 2) {
      matches.push({
        round,
        home: teamTexts[0] || "?",
        away: teamTexts[1] || "?",
        homeScore: scores.length >= 2 ? scores[0] : null,
        awayScore: scores.length >= 2 ? scores[1] : null,
        date: dateMatch?.[1] || "",
        time: timeMatch?.[1] || "",
        status: dec(statusMatch?.[1] || ""),
        homeBadgeUrl: badges[0] ? `${BASE_URL}${badges[0]}` : "",
        awayBadgeUrl: badges[1] ? `${BASE_URL}${badges[1]}` : "",
        homeBadgeLocal: "",
        awayBadgeLocal: "",
      });
    }
  }

  return matches;
}

async function downloadBadges(groups, matches) {
  fs.mkdirSync(BADGES_DIR, { recursive: true });
  const badgeMap = {};
  for (const m of matches) {
    if (m.homeBadgeUrl && m.home !== "?") badgeMap[m.home] = m.homeBadgeUrl;
    if (m.awayBadgeUrl && m.away !== "?") badgeMap[m.away] = m.awayBadgeUrl;
  }

  const localMap = {};
  for (const [name, url] of Object.entries(badgeMap)) {
    const filename = `${slugify(name)}.png`;
    const filepath = path.join(BADGES_DIR, filename);
    if (!fs.existsSync(filepath)) {
      try {
        const buffer = await fetchBinary(url);
        if (buffer.length > 100) {
          fs.writeFileSync(filepath, buffer);
          console.log(`    Badge: ${name} -> ${filename}`);
        }
      } catch (err) {
        console.error(`    Badge error ${name}: ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    localMap[name] = `/escudos-municipal/${filename}`;
  }

  for (const group of groups) {
    for (const team of group.teams) team.badge = localMap[team.name] || "";
  }
  for (const m of matches) {
    m.homeBadgeLocal = localMap[m.home] || "";
    m.awayBadgeLocal = localMap[m.away] || "";
  }
}

async function scrapeChampionship(entry) {
  console.log(`\n  Fetching: ${entry.name}`);
  const html = await fetch(entry.url);

  // Check if page loaded correctly (not error page)
  if (html.includes("Erro - SisGel") || html.length < 5000) {
    console.log(`  SKIP: Token expired or page error`);
    return null;
  }

  // Parse name from page if available
  const nameMatch = html.match(/<h5[^>]*><strong>([^<]+)<\/strong>/);
  const pageName = nameMatch ? dec(nameMatch[1]) : entry.name;

  const groups = parseClassification(html);
  const matches = parseMatches(html);
  const totalTeams = groups.reduce((sum, g) => sum + g.teams.length, 0);

  console.log(`  Name: ${pageName}`);
  console.log(`  Groups: ${groups.length}, Teams: ${totalTeams}, Matches: ${matches.length}`);

  await downloadBadges(groups, matches);

  const matchesByRound = {};
  for (const m of matches) {
    const key = m.round || 0;
    if (!matchesByRound[key]) matchesByRound[key] = [];
    matchesByRound[key].push(m);
  }

  return {
    name: pageName,
    slug: slugify(pageName),
    city: "Santana de Parnaiba",
    state: "SP",
    year: "2026",
    url: entry.url,
    groups,
    matches,
    matchesByRound,
    totalRounds: Object.keys(matchesByRound).length,
    updatedAt: new Date().toISOString(),
  };
}

async function main() {
  console.log(`[${new Date().toISOString()}] SisGel scraper starting...`);
  console.log(`Championships to scrape: ${CHAMPIONSHIP_URLS.length}`);

  const results = [];

  for (const entry of CHAMPIONSHIP_URLS) {
    try {
      const result = await scrapeChampionship(entry);
      if (result) results.push(result);
    } catch (err) {
      console.error(`  Error scraping ${entry.name}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nSaved ${results.length} championships to ${OUTPUT_FILE}`);
  console.log(`[${new Date().toISOString()}] Done!`);
}

main().catch((err) => {
  console.error("Scraper error:", err);
  process.exit(1);
});
