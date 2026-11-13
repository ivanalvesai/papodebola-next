// Monta o JSON de um post v2 (rodar local):
//   node scripts/onde-assistir/build-v2.mjs <post> <dir-dados> <saida.json>
// <dir-dados> tem facts.json (tabela/forma por id de jogo), m/{id}.json (snapshot do jogo,
// com escalações quando a API já tem) e ls/{teamId}.json (/api/lineup-suggest: XI do jogo anterior).
// O post pode trocar jogadores do XI provável via o.swapHome/o.swapAway = [[saiNome, {name, number, id}]].
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [post, dir, out] = process.argv.slice(2);
const mod = await import(pathToFileURL(path.resolve(`scripts/onde-assistir/posts/${post}.mjs`)).href);
const o = mod.opts;
const facts = JSON.parse(fs.readFileSync(path.join(dir, "facts.json"), "utf8"))[String(o.matchId)];
if (!facts) throw new Error(`jogo ${o.matchId} fora do facts.json`);
const snap = (() => { try { const d = JSON.parse(fs.readFileSync(path.join(dir, "m", `${o.matchId}.json`), "utf8")); return d.data || d; } catch { return {}; } })();
const side = (key, teamId, swaps = []) => {
  let s = snap[key]?.starters?.length >= 11 ? { formation: snap[key].formation, starters: snap[key].starters } : null;
  if (!s) {
    const ls = JSON.parse(fs.readFileSync(path.join(dir, "ls", `${teamId}.json`), "utf8"));
    s = { formation: ls.formation, starters: ls.players.map((p) => ({ name: p.name, number: p.number, id: p.playerId })) };
  }
  for (const [sai, entra] of swaps) {
    const i = s.starters.findIndex((p) => p.name === sai);
    if (i < 0) throw new Error(`${sai} não está no XI de ${key}`);
    s.starters[i] = entra;
  }
  if (o[`formation_${key}`]) s.formation = o[`formation_${key}`];
  return s;
};
const lineups = { home: side("home", facts.homeId, o.swapHome), away: side("away", facts.awayId, o.swapAway) };
const res = mod.default({ facts, lineups });
fs.writeFileSync(out, JSON.stringify(res));
const words = JSON.stringify(res.data.content).match(/"text":"([^"]*)"/g).join(" ").split(/\s+/).length;
console.log(`ok ${res.slug} (~${words} palavras) -> ${out}`);
