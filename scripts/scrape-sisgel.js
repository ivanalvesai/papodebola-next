#!/usr/bin/env node
/**
 * Scraper SisGel - Campeonato Municipal de Santana de Parnaíba
 * Coleta classificação (por grupo), jogos e escudos
 * Roda via cron 2x/dia
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const BASE_URL = "https://prefeitura.santanadeparnaiba.sp.gov.br";
const CAMPEONATOS_URL = `${BASE_URL}/SisGel-PUB/campeonatos`;
const DATA_DIR = path.join(__dirname, "..", "data");
const BADGES_DIR = path.join(__dirname, "..", "public", "escudos-municipal");
const OUTPUT_FILE = path.join(DATA_DIR, "sisgel.json");

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

async function findChampionshipUrl() {
  // Try the main listing page to get a fresh token link
  console.log("Fetching championship listing...");
  const html = await fetch(CAMPEONATOS_URL);
  const links = html.match(/href="(\/SisGel-PUB\/campeonatos\/[A-Za-z0-9_-]{20,})"/g) || [];

  if (links.length > 0) {
    const href = links[0].replace('href="', '').replace('"', '');
    const url = `${BASE_URL}${href}`;
    // Verify it's 2026 by checking content
    const detail = await fetch(url);
    if (detail.includes("2026") || detail.includes("GAROTOS")) {
      console.log("Found 2026 championship via listing");
      return { url, html: detail };
    }
    // If listing returns old championship, it's still valid data
    console.log("Found championship via listing (may be current season)");
    return { url, html: detail };
  }

  throw new Error("No championship found");
}

function parseClassification(html) {
  // Split by group tables - look for tbTabela or classification sections
  const groups = [];

  // Find group sections by splitting on group headers
  // The HTML has multiple table bodies for each group
  const tableSection = html.split(/id="Tabela"/)[1] || html;

  // Extract all td data
  const tdRe = /<td[^>]*>\s*([^<]+?)\s*<\/td>/g;
  const tds = [];
  let m;
  while ((m = tdRe.exec(tableSection)) !== null) {
    const val = dec(m[1]);
    if (val && val !== " ") tds.push(val);
  }

  // Parse teams: each team is 12 fields (pos, name, pts, J, V, E, D, GP, GC, SG, CA, CV)
  const teams = [];
  let i = 0;
  while (i + 11 < tds.length) {
    const posStr = tds[i].replace(/[^\d]/g, "");
    if (posStr && parseInt(posStr) > 0 && parseInt(posStr) <= 30) {
      const name = tds[i + 1];
      // Verify it looks like a team name (not another number)
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

  // Detect groups: when position resets to 1, it's a new group
  let currentGroup = 1;
  let lastPos = 0;
  const groupedTeams = {};

  for (const team of teams) {
    if (team.pos <= lastPos && team.pos === 1 && lastPos > 1) {
      currentGroup++;
    }
    if (!groupedTeams[currentGroup]) groupedTeams[currentGroup] = [];
    groupedTeams[currentGroup].push(team);
    lastPos = team.pos;
  }

  for (const [groupNum, groupTeams] of Object.entries(groupedTeams)) {
    groups.push({
      name: `Grupo ${groupNum}`,
      teams: groupTeams,
    });
  }

  return groups;
}

function parseMatches(html) {
  const matches = [];
  const gameBlocks = html.split(/href="\/SisGel-PUB\/jogo\//);

  for (let j = 1; j < gameBlocks.length; j++) {
    const gb = gameBlocks[j];

    // Find round number from context
    let round = 0;
    const beforeBlock = html.substring(0, html.indexOf(gb.substring(0, 30)));
    const roundMatches = beforeBlock.match(/data-rodada="(\d+)"/g);
    if (roundMatches) {
      const last = roundMatches[roundMatches.length - 1];
      round = parseInt(last.match(/\d+/)[0]) || 0;
    }

    // Team names from partida-item blocks
    const teamTexts = [];
    const partidaItems = gb.split(/partida-item/);
    for (const pi of partidaItems) {
      // Text directly in partida-item div (team name before or after avatar)
      const textBefore = pi.match(/^">\s*\n?\s*([A-ZÀ-Ü][A-Za-zÀ-ü\s\.\/\(\)]+)\s*<div/);
      const textAfter = pi.match(/<\/div>\s*\n?\s*([A-ZÀ-Ü][A-Za-zÀ-ü\s\.\/\(\)]+)\s*$/m);
      if (textBefore) teamTexts.push(dec(textBefore[1]));
      if (textAfter) teamTexts.push(dec(textAfter[1]));
    }

    // Scores
    const scores = [];
    const scoreRe = /font-size:\s*x-large[^>]*>\s*(\d+)\s*</g;
    let sm;
    while ((sm = scoreRe.exec(gb)) !== null) {
      scores.push(parseInt(sm[1]));
    }

    // Date / Time
    const dateMatch = gb.match(/(\d{2}\/\d{2}\/\d{4})/);
    const timeMatch = gb.match(/(\d{2}:\d{2})/);

    // Status
    const statusMatch = gb.match(/partida-situacao">([^<]+)</);

    // Badges
    const badges = [];
    const badgeRe = /alt="(?:Time [AB]|Foto Time)"[^>]*src="([^"]+)"/g;
    let bm;
    while ((bm = badgeRe.exec(gb)) !== null) {
      badges.push(bm[1]);
    }

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

  // Collect all badge URLs from matches
  const badgeMap = {}; // name -> url
  for (const m of matches) {
    if (m.homeBadgeUrl && m.home !== "?") badgeMap[m.home] = m.homeBadgeUrl;
    if (m.awayBadgeUrl && m.away !== "?") badgeMap[m.away] = m.awayBadgeUrl;
  }

  const localMap = {}; // name -> local path

  for (const [name, url] of Object.entries(badgeMap)) {
    const filename = `${slugify(name)}.png`;
    const filepath = path.join(BADGES_DIR, filename);

    if (!fs.existsSync(filepath)) {
      try {
        const buffer = await fetchBinary(url);
        if (buffer.length > 100) { // Not an error page
          fs.writeFileSync(filepath, buffer);
          console.log(`  Badge: ${name} -> ${filename}`);
        }
      } catch (err) {
        console.error(`  Badge error ${name}: ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    localMap[name] = `/escudos-municipal/${filename}`;
  }

  // Apply to groups
  for (const group of groups) {
    for (const team of group.teams) {
      team.badge = localMap[team.name] || "";
    }
  }

  // Apply to matches
  for (const m of matches) {
    m.homeBadgeLocal = localMap[m.home] || "";
    m.awayBadgeLocal = localMap[m.away] || "";
  }

  return localMap;
}

async function main() {
  console.log(`[${new Date().toISOString()}] SisGel scraper starting...`);

  const { url, html } = await findChampionshipUrl();
  console.log(`Championship URL: ${url.substring(0, 80)}...`);

  // Parse championship name
  const nameMatch = html.match(/<h5[^>]*><strong>([^<]+)<\/strong>/);
  const champName = nameMatch ? dec(nameMatch[1]) : "Campeonato Municipal";

  // Parse year
  const yearMatch = html.match(/FUTEBOL\s*(\d{4})/);
  const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

  console.log(`Name: ${champName}`);
  console.log(`Year: ${year}`);

  // Parse classification by groups
  const groups = parseClassification(html);
  const totalTeams = groups.reduce((sum, g) => sum + g.teams.length, 0);
  console.log(`Groups: ${groups.length}, Total teams: ${totalTeams}`);
  for (const g of groups) {
    console.log(`  ${g.name}: ${g.teams.length} teams`);
  }

  // Parse matches
  const matches = parseMatches(html);
  console.log(`Matches: ${matches.length} games`);

  // Download badges
  await downloadBadges(groups, matches);

  // Group matches by round
  const matchesByRound = {};
  for (const m of matches) {
    const key = m.round || 0;
    if (!matchesByRound[key]) matchesByRound[key] = [];
    matchesByRound[key].push(m);
  }

  const result = [{
    name: `${champName} ${year}`,
    city: "Santana de Parnaiba",
    state: "SP",
    year,
    url,
    groups,
    matches,
    matchesByRound,
    totalRounds: Object.keys(matchesByRound).length,
    updatedAt: new Date().toISOString(),
  }];

  // Save
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(`\nSaved to ${OUTPUT_FILE}`);
  console.log(`[${new Date().toISOString()}] Done!`);
}

main().catch((err) => {
  console.error("Scraper error:", err);
  process.exit(1);
});
