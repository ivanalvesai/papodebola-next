#!/usr/bin/env node
/**
 * Scraper SisGel - Campeonatos Municipais de Santana de Parnaíba
 * Coleta classificação, jogos e escudos do site da prefeitura
 * Roda via cron 2x/dia no servidor
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const BASE_URL = "https://prefeitura.santanadeparnaiba.sp.gov.br";
const CAMPEONATOS_URL = `${BASE_URL}/SisGel-PUB/campeonatos`;
const DATA_DIR = path.join(__dirname, "..", "data");
const BADGES_DIR = path.join(__dirname, "..", "public", "escudos-municipal");
const OUTPUT_FILE = path.join(DATA_DIR, "sisgel.json");

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
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
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBinary(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function decodeEntities(str) {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

async function getChampionshipLinks(html) {
  const links = [];
  const re = /href="(\/SisGel-PUB\/campeonatos\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (href.length > 30 && !links.includes(href)) {
      links.push(href);
    }
  }

  // Get championship name
  const nameRe = /<h5[^>]*><strong>([^<]+)<\/strong><\/h5>/g;
  const names = [];
  while ((m = nameRe.exec(html)) !== null) {
    names.push(decodeEntities(m[1].trim()));
  }

  return links.map((link, i) => ({
    url: `${BASE_URL}${link}`,
    name: names[i] || `Campeonato ${i + 1}`,
  }));
}

function parseClassification(html) {
  const tdRe = /<td[^>]*>\s*([^<]+?)\s*<\/td>/g;
  const tds = [];
  let m;
  while ((m = tdRe.exec(html)) !== null) {
    const val = decodeEntities(m[1].trim());
    if (val && val !== "&nbsp;") tds.push(val);
  }

  // Pattern: pos, name, pts, games, W, D, L, GF, GA, GD, extra1, extra2
  const teams = [];
  for (let i = 0; i + 11 < tds.length; i += 12) {
    const pos = tds[i].replace(/[^\d]/g, "");
    if (!pos) { i -= 11; continue; }
    teams.push({
      pos: parseInt(pos),
      name: tds[i + 1],
      pts: parseInt(tds[i + 2]) || 0,
      games: parseInt(tds[i + 3]) || 0,
      wins: parseInt(tds[i + 4]) || 0,
      draws: parseInt(tds[i + 5]) || 0,
      losses: parseInt(tds[i + 6]) || 0,
      gf: parseInt(tds[i + 7]) || 0,
      ga: parseInt(tds[i + 8]) || 0,
      gd: parseInt(tds[i + 9]) || 0,
    });
  }
  return teams;
}

function parseMatches(html) {
  const matches = [];

  // Split by rodada blocks
  const rodadaBlocks = html.split(/data-rodada="/);

  for (let i = 1; i < rodadaBlocks.length; i++) {
    const block = rodadaBlocks[i];
    const rodadaNum = parseInt(block.match(/^(\d+)/)?.[1] || "0");
    if (rodadaNum === 0 && !block.includes("partida-item")) continue;

    // Find individual games in this block
    const gameBlocks = block.split(/<a href="\/SisGel-PUB\/jogo\//);

    for (let j = 1; j < gameBlocks.length; j++) {
      const gb = gameBlocks[j];

      // Team names - appear right before/after the avatar div
      const teamNames = [];
      // Team A: text before first avatar
      const beforeAvatar = gb.match(/partida-item">\s*\n?\s*([A-ZÀ-Ü][A-Za-zÀ-ü\s\.\/]+)\s*<div class="time-partida-avatar"/);
      if (beforeAvatar) teamNames.push(beforeAvatar[1].trim());

      // Team B: text after second avatar
      const afterAvatar = gb.match(/<\/div>\s*\n?\s*([A-ZÀ-Ü][A-Za-zÀ-ü\s\.\/]+)\s*<\/div>\s*\n?\s*<\/div>/);
      if (afterAvatar) teamNames.push(afterAvatar[1].trim());

      // Broader search if above didn't work
      if (teamNames.length < 2) {
        const allTeamTexts = gb.match(/partida-item">\s*\n?\s*([^<\n]+)/g) || [];
        for (const t of allTeamTexts) {
          const clean = t.replace(/partida-item">\s*/, "").trim();
          if (clean.length > 2 && !clean.includes("<") && !clean.includes("mdi") && !/^\d/.test(clean)) {
            if (!teamNames.includes(clean)) teamNames.push(clean);
          }
        }
      }

      // Scores
      const scores = [];
      const scoreRe = /font-size:\s*x-large[^>]*>\s*(\d+)\s*</g;
      let sm;
      while ((sm = scoreRe.exec(gb)) !== null) {
        scores.push(parseInt(sm[1]));
      }

      // Date
      const dateMatch = gb.match(/(\d{2}\/\d{2}\/\d{4})/);
      const timeMatch = gb.match(/(\d{2}:\d{2})/);
      const locationMatch = gb.match(/<span>([^<]+)<\/span>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="row form-group">\s*<div class="col-xs-12 partida">/);

      // Status
      const statusMatch = gb.match(/partida-situacao">([^<]+)</);

      // Badge URLs
      const badges = [];
      const badgeRe = /alt="(?:Time [AB]|Foto Time)"[^>]*src="([^"]+)"/g;
      let bm;
      while ((bm = badgeRe.exec(gb)) !== null) {
        badges.push(bm[1]);
      }

      if (teamNames.length >= 2 || scores.length >= 2) {
        matches.push({
          round: rodadaNum,
          home: decodeEntities(teamNames[0] || "?"),
          away: decodeEntities(teamNames[1] || "?"),
          homeScore: scores[0] ?? null,
          awayScore: scores[1] ?? null,
          date: dateMatch?.[1] || "",
          time: timeMatch?.[1] || "",
          status: decodeEntities(statusMatch?.[1]?.trim() || ""),
          homeBadge: badges[0] ? `${BASE_URL}${badges[0]}` : "",
          awayBadge: badges[1] ? `${BASE_URL}${badges[1]}` : "",
        });
      }
    }
  }

  return matches;
}

function parseTeamBadges(html) {
  const badges = {};
  // From classification table - team names mapped to badge images
  const re = /alt="Foto Time"[^>]*src="([^"]+)"[^<]*<\/div>\s*<\/td>\s*<td[^>]*>\s*([^<]+)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const name = decodeEntities(m[2].trim());
    const url = m[1];
    if (name && url) badges[name] = `${BASE_URL}${url}`;
  }

  // Also from equipe table
  const re2 = /src="(\/SisGel-PUB\/arquivo\/download-inline\/[^"]+)"[^<]*<\/div>\s*<\/td>\s*<td[^>]*>\s*([^<]+)/g;
  while ((m = re2.exec(html)) !== null) {
    const name = decodeEntities(m[2].trim());
    const url = m[1];
    if (name && url && !badges[name]) badges[name] = `${BASE_URL}${url}`;
  }

  return badges;
}

async function downloadBadges(badges) {
  fs.mkdirSync(BADGES_DIR, { recursive: true });
  const localBadges = {};

  for (const [name, url] of Object.entries(badges)) {
    const safeName = name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const filename = `${safeName}.png`;
    const filepath = path.join(BADGES_DIR, filename);

    if (!fs.existsSync(filepath)) {
      try {
        const buffer = await fetchBinary(url);
        fs.writeFileSync(filepath, buffer);
        console.log(`  Badge: ${name} -> ${filename}`);
      } catch (err) {
        console.error(`  Badge error ${name}: ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    localBadges[name] = `/escudos-municipal/${filename}`;
  }

  return localBadges;
}

async function main() {
  console.log(`[${new Date().toISOString()}] SisGel scraper starting...`);

  // 1. Get championship list
  console.log("Fetching championships list...");
  const mainHtml = await fetch(CAMPEONATOS_URL);
  const championships = await getChampionshipLinks(mainHtml);
  console.log(`Found ${championships.length} championship(s)`);

  const results = [];

  for (const champ of championships) {
    console.log(`\nProcessing: ${champ.name}`);
    console.log(`URL: ${champ.url}`);

    const html = await fetch(champ.url);

    // 2. Parse classification
    const classification = parseClassification(html);
    console.log(`  Classification: ${classification.length} teams`);

    // 3. Parse matches
    const matches = parseMatches(html);
    console.log(`  Matches: ${matches.length} games`);

    // 4. Parse and download badges
    const badgeUrls = parseTeamBadges(html);
    console.log(`  Badges found: ${Object.keys(badgeUrls).length}`);
    const localBadges = await downloadBadges(badgeUrls);

    // Apply local badge paths to classification and matches
    for (const team of classification) {
      team.badge = localBadges[team.name] || "";
    }
    for (const match of matches) {
      match.homeBadgeLocal = localBadges[match.home] || "";
      match.awayBadgeLocal = localBadges[match.away] || "";
    }

    // Group matches by round
    const matchesByRound = {};
    for (const m of matches) {
      if (!matchesByRound[m.round]) matchesByRound[m.round] = [];
      matchesByRound[m.round].push(m);
    }

    results.push({
      name: champ.name,
      url: champ.url,
      classification,
      matches,
      matchesByRound,
      totalRounds: Object.keys(matchesByRound).length,
      updatedAt: new Date().toISOString(),
    });
  }

  // Save results
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nSaved to ${OUTPUT_FILE}`);
  console.log(`[${new Date().toISOString()}] Done!`);
}

main().catch((err) => {
  console.error("Scraper error:", err);
  process.exit(1);
});
