// Monta o JSON do post "onde assistir" (rodar local):
//   node scripts/onde-assistir/build.mjs <post> <snapshot-do-jogo.json> <snapshot-liga.json> <saida.json>
// <post> = arquivo em scripts/onde-assistir/posts/ (sem .mjs). O JSON vai pro servidor em
// ~/cupons-banners/oa-post.json junto com a capa e é gravado por scripts/create-post-onde-assistir.mjs.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [post, matchFile, leagueFile, out] = process.argv.slice(2);
const match = JSON.parse(fs.readFileSync(matchFile, "utf8"));
const league = JSON.parse(fs.readFileSync(leagueFile, "utf8"));
const lg = league.data || league;
const { homeId, awayId } = match.event;
const grp = lg.standings.find((g) => (g.rows || []).some((r) => r.teamId === homeId || r.teamId === awayId));
if (!grp) throw new Error("grupo não encontrado na tabela salva");
const mod = await import(pathToFileURL(path.resolve(`scripts/onde-assistir/posts/${post}.mjs`)).href);
const res = mod.default({ match, group: grp.rows, groupName: grp.name });
fs.writeFileSync(out, JSON.stringify(res));
const words = JSON.stringify(res.data.content).match(/"text":"([^"]*)"/g).join(" ").split(/\s+/).length;
console.log(`ok ${res.slug} (~${words} palavras) -> ${out}`);
