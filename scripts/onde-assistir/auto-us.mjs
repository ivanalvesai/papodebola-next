// Gera os guias "onde assistir" de NBA/NFL de um dia a partir dos dados da API (facts-us.py).
// O texto é montado só com números da API (campanha, posição, últimos e próximos jogos); os
// canais vêm de us-canais.json (2 fontes por jogo; padrão = League Pass / NFL Game Pass).
//
// uso: node scripts/onde-assistir/auto-us.mjs <facts.json> <out-dir> <inicio ISO> <passo-min> [autor-inicial]
//   ex.: node auto-us.mjs us-15.json out 2026-11-14T15:00:00-03:00 30
// Saída: out/{slug}.json (formato do create-posts-onde-assistir-lote.mjs) + out/oa-lote.json
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { usPost, B, P, LK } from "./template-us.mjs";

const [factsFile, outDir, startIso, stepMin = "30", firstAuthor = "1"] = process.argv.slice(2);
const F = JSON.parse(readFileSync(factsFile, "utf8"));
const here = path.dirname(fileURLToPath(import.meta.url));
const CANAIS = JSON.parse(readFileSync(path.join(here, "us-canais.json"), "utf8"));
const TZ = "America/Sao_Paulo";

// ---------- nomes ----------
const NICK_2 = /(Trail Blazers|Red Wings)$/;
const nick = (full) => (full.match(NICK_2)?.[1] ?? full.split(" ").pop());
const SINGULAR = new Set(["Heat", "Magic", "Thunder", "Jazz"]);
const sing = (n) => SINGULAR.has(n);
const Art = (n) => (sing(n) ? "O" : "Os");
const art = (n) => (sing(n) ? "o" : "os");
const v = (n, s, p) => (sing(n) ? s : p); // verbo singular/plural
const CIDADE = { "New Orleans": "Nova Orleans", Philadelphia: "Filadélfia", "New York": "Nova York", Munich: "Munique", London: "Londres" };
const NUM = ["zero", "uma", "duas", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"];
const num = (n) => NUM[n] ?? String(n);

// ---------- datas ----------
const dt = (ts) => new Date(ts * 1000);
const hora = (ts) => dt(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).replace(":00", "h").replace(":", "h").replace(/^0/, "");
const dKey = (ts) => dt(ts).toLocaleDateString("en-CA", { timeZone: TZ });
const ddmm = (ts) => dt(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: TZ });
const dia = (ts) => Number(dt(ts).toLocaleDateString("pt-BR", { day: "numeric", timeZone: TZ }));
const WD = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const wd = (ts) => WD[new Date(dt(ts).toLocaleString("en-US", { timeZone: TZ })).getDay()];
const naDia = (ts) => { const w = wd(ts); return `${/^(sábado|domingo)$/.test(w) ? "no" : "na"} ${w} (${dia(ts)})`; };
const nesteDia = (ts) => { const w = wd(ts); return `${/^(sábado|domingo)$/.test(w) ? "neste" : "nesta"} ${w} (${ddmm(ts)})`; };
const dataObj = (ts) => {
  const w = wd(ts), d = dt(ts);
  const mes = d.toLocaleDateString("pt-BR", { month: "long", timeZone: TZ });
  const curto = w.replace("-feira", "");
  return {
    longa: `${w}, ${dia(ts)} de ${mes}`, curta: `${curto}, ${ddmm(ts)}`,
    capa: `${curto[0].toUpperCase()}${curto.slice(1)}, ${ddmm(ts)}`,
    frase: `${/^(sábado|domingo)$/.test(w) ? "Neste" : "Nesta"} ${w}, ${dia(ts)} de ${mes} de ${d.getFullYear()}`,
  };
};

// ---------- tabela ----------
const ST = F.standings;
const findRow = (liga, re, id) => {
  for (const g of ST[liga] || []) if (re.test(g.name || "")) { const r = g.rows.find((x) => x.id === id); if (r) return { g, r }; }
  return null;
};
const confNba = (id) => { const x = findRow("nba", /Conference$/, id); return x && { ...x, label: /^East/.test(x.g.name) ? "Leste" : "Oeste" }; };
const DIR = { North: "Norte", South: "Sul", East: "Leste", West: "Oeste" };
const divNfl = (id) => { const x = findRow("nfl", /^(AFC|NFC) (North|South|East|West)$/, id); return x && { ...x, label: x.g.name.replace(/(North|South|East|West)$/, (m) => DIR[m]) }; };
const confNfl = (id) => findRow("nfl", /^(AFC|NFC)$/, id);

// ---------- jogos do time ----------
function lastBefore(teamId, ts) { return (F.last[teamId] || []).filter((e) => e.ts < ts && e.status === "finished"); }
function streak(teamId, ts) {
  const row = confNba(teamId)?.r;
  if (row && typeof row.streak === "number" && row.streak !== 0) return { n: Math.abs(row.streak), won: row.streak > 0 };
  const l = lastBefore(teamId, ts);
  let n = 0, w = null;
  for (let i = l.length - 1; i >= 0; i--) {
    const e = l[i], won = (e.homeId === teamId ? e.hs > e.as : e.as > e.hs);
    if (w === null) w = won; else if (won !== w) break;
    n++;
  }
  return { n, won: w };
}
function resultado(teamId, e) {
  const home = e.homeId === teamId, my = home ? e.hs : e.as, opp = home ? e.as : e.hs;
  const oppName = home ? e.away : e.home, won = my > opp;
  const n = nick(home ? e.home : e.away);
  return { won, home, oppName, my, opp, txt: `${won ? `${v(n, "venceu", "venceram")} o` : `${v(n, "perdeu", "perderam")} para o`} ${oppName} por ${Math.max(my, opp)} a ${Math.min(my, opp)}, ${home ? "em casa" : "fora de casa"}, ${naDia(e.ts)}` };
}
const placar = (e) => `${nick(e.home)} ${e.hs} x ${e.as} ${nick(e.away)} (${ddmm(e.ts)})`;
const between = (teamId, ts) => (F.next[teamId] || []).filter((e) => e.ts < ts && e.ts * 1000 > Date.now());

// ---------- parágrafos ----------
function posFrase(liga, id) {
  if (liga === "nba") { const c = confNba(id); return c ? `${c.r.pos}º do ${c.label}` : ""; }
  const d = divNfl(id); return d ? `${d.r.pos}º da ${d.label}` : "";
}
function campanha(liga, id) {
  const r = liga === "nba" ? confNba(id)?.r : divNfl(id)?.r;
  return r ? { w: r.w, l: r.l } : null;
}
const ASOF = process.env.OA_ASOF || ""; // dia da coleta (texto com data fixa)
const asofTs = ASOF ? new Date(`${ASOF}T12:00:00-03:00`).getTime() / 1000 : 0;
function chega(liga, g, side, idx) {
  if (ASOF) return chegaFixo(liga, g, side);
  const id = side === "home" ? g.homeId : g.awayId, full = side === "home" ? g.home : g.away, n = nick(full);
  const c = campanha(liga, id), pos = posFrase(liga, id), last = lastBefore(id, g.ts).pop();
  const s = streak(id, g.ts);
  if (c) s.n = Math.min(s.n, c.w + c.l); // não conta jogos da temporada passada
  const parts = [];
  if (c && c.w === 0) parts.push(`${Art(n)} ${n} ainda não ${v(n, "venceu", "venceram")} na temporada: ${v(n, "perdeu", "perderam")} os ${c.l} jogos que ${v(n, "fez", "fizeram")}${pos ? ` e ${v(n, "é", "são")} o ${pos}` : ""}.`);
  else if (c) parts.push(`${Art(n)} ${n} ${v(n, "tem", "têm")} ${c.w} ${c.w === 1 ? "vitória" : "vitórias"} e ${c.l} ${c.l === 1 ? "derrota" : "derrotas"} na temporada${pos ? ` e ${v(n, "é", "são")} o ${pos}` : ""}.`);
  if (last) {
    const r = resultado(id, last);
    if (c && (c.w === 0 || c.l === 0) && s.n === c.w + c.l) parts.push(`No último jogo, ${r.txt}.`);
    else if (s.n >= 3) parts.push(`${v(n, "Vem", "Vêm")} de ${num(s.n)} ${s.won ? "vitórias" : "derrotas"} seguidas; no último jogo, ${r.txt}.`);
    else if (s.n === 2) parts.push(`${s.won ? v(n, "Ganhou", "Ganharam") : v(n, "Perdeu", "Perderam")} os dois últimos jogos; no mais recente, ${r.txt}.`);
    else parts.push(`No último jogo, ${r.txt}.`);
  }
  const bt = between(id, g.ts);
  if (bt.length) {
    const e = bt[0], home = e.homeId === id;
    parts.push(`Antes deste jogo, ${art(n)} ${n} ainda ${v(n, "enfrenta", "enfrentam")} o ${home ? e.away : e.home}, ${home ? "em casa" : "fora"}, ${naDia(e.ts)}.`);
  } else if (liga === "nba" && last && dKey(last.ts) === dKey(g.ts - 86400)) {
    parts.push(`${v(n, "Joga", "Jogam")} pela segunda noite seguida, sem descanso.`);
  }
  return parts.join(" ");
}

function chegaFixo(liga, g, side) {
  // ASOF = último dia com todos os jogos contados; corte = 18h do dia seguinte (antes da rodada da noite).
  const id = side === "home" ? g.homeId : g.awayId, full = side === "home" ? g.home : g.away, n = nick(full);
  const cut = asofTs + 30 * 3600;
  const c = campanha(liga, id), pos = posFrase(liga, id), last = lastBefore(id, g.ts).filter((e) => e.ts < cut).pop();
  const parts = [];
  const rec = c ? (c.w === 0 ? `ainda não ${v(n, "tinha", "tinham")} vencido (${c.l} derrotas)` : `${v(n, "tinha", "tinham")} ${c.w} ${c.w === 1 ? "vitória" : "vitórias"} e ${c.l} ${c.l === 1 ? "derrota" : "derrotas"}`) : "";
  if (c) parts.push(`Até ${naDia(asofTs).replace(/^(no|na) /, "")}, ${art(n)} ${n} ${rec} na temporada${pos ? ` e ${v(n, "era", "eram")} o ${pos}` : ""}.`);
  if (last) {
    const r = resultado(id, last);
    const t = r.txt.replace(/, (no|na) [^,]+$/, "");
    const when = dKey(last.ts) === ASOF ? "nesse dia" : naDia(last.ts);
    parts.push(`${when[0].toUpperCase()}${when.slice(1)}, ${t}.`);
  }
  const bt = (F.next[id] || []).filter((e) => e.ts < g.ts && e.ts >= cut);
  for (const e of bt.slice(0, 2)) {
    const home = e.homeId === id;
    parts.push(`${Art(n)} ${n} também ${v(n, "joga", "jogam")} ${naDia(e.ts)}, contra o ${home ? e.away : e.home}, ${home ? "em casa" : "fora"}${liga === "nba" && dKey(e.ts) === dKey(g.ts - 86400) ? `, e ${v(n, "chega", "chegam")} a este jogo na segunda noite seguida` : ""}.`);
  }
  return parts.join(" ");
}

function zonaNba(id) {
  const c = confNba(id); if (!c) return "";
  const n = nick(c.r.team), p = c.r.pos;
  if (p <= 6) return `${Art(n)} ${n} ${v(n, "está", "estão")} entre os seis primeiros do ${c.label}, que vão direto aos playoffs.`;
  if (p <= 10) return `${Art(n)} ${n} ${v(n, "está", "estão")} na zona do play-in do ${c.label} (7º ao 10º).`;
  const tenth = c.g.rows.find((r) => r.pos === 10);
  return `${Art(n)} ${n} ${v(n, "está", "estão")} fora da zona do play-in do ${c.label}; o 10º colocado tem ${tenth?.w ?? "?"} vitórias.`;
}
function zonaNfl(id) {
  const c = confNfl(id); if (!c) return "";
  const n = nick(c.r.team), p = c.r.pos, conf = c.g.name;
  if (p <= 7) return `${Art(n)} ${n} ${v(n, "é", "são")} hoje o ${p}º da ${conf}, dentro da zona de playoffs (sete vagas por conferência).`;
  const seventh = c.g.rows.find((r) => r.pos === 7);
  return `${Art(n)} ${n} ${v(n, "é", "são")} o ${p}º da ${conf}, fora da zona de playoffs; o 7º colocado tem ${seventh?.w ?? "?"} vitórias.`;
}

// ---------- montagem ----------
const LP = "NBA League Pass", GP = "NFL Game Pass";
function canais(g, A, Bn) {
  const k = `${A}|${Bn}`.toLowerCase(), c = CANAIS[k] || {};
  if (g.liga === "nba") {
    if (!c.tv) return { canal: LP, canalLongo: `${LP} (streaming, por assinatura)`, canalCapa: "NBA LEAGUE PASS", canalCapaAlt: "no NBA League Pass",
      faq: `A partida passa no ${LP}, serviço de streaming da NBA, por assinatura. Não há transmissão na TV aberta ou fechada.`,
      assistir: [`O jogo não tem transmissão na TV brasileira. Ele passa só no ${LP}, o serviço de streaming da própria NBA, que exige assinatura e funciona no site, no aplicativo e em smart TVs.`] };
    return { canal: `${c.tv} e ${LP}`, canalLongo: `${c.tvLongo} e ${LP}`, canalCapa: c.capa, canalCapaAlt: c.capaAlt,
      faq: `A partida tem transmissão ${c.faq} e do ${LP}, às ${hora(g.ts)} de Brasília.`, assistir: [c.assistir, `Todos os jogos da temporada também estão no ${LP}, com assinatura própria.`] };
  }
  const base = { canal: c.tv ? `${c.tv} e ${GP}` : `${GP} (DAZN)`, canalLongo: c.tv ? `${c.tvLongo} e ${GP} (DAZN)` : `${GP}, na DAZN (streaming, por assinatura)`,
    canalCapa: c.capa || "NFL GAME PASS · DAZN", canalCapaAlt: c.capaAlt || "no NFL Game Pass, na DAZN" };
  return { ...base,
    faq: c.tv ? `A partida tem transmissão ${c.faq} e do ${GP}, na DAZN, às ${hora(g.ts)} de Brasília.` : `A partida passa no ${GP}, na DAZN, por assinatura, às ${hora(g.ts)} de Brasília.${c.nota ? ` ${c.nota}` : ""}`,
    assistir: [c.tv ? `${c.assistir} Todos os jogos da temporada também estão no ${GP}, disponível no Brasil pela DAZN, com assinatura.` : `O jogo passa no ${GP}, disponível no Brasil pela DAZN, com assinatura. Ele tem todos os jogos da temporada.${c.nota ? ` ${c.nota}` : ""}`] };
}

function tabela(g) {
  if (g.liga === "nba") {
    const h = confNba(g.homeId), a = confNba(g.awayId); if (!h) return null;
    const max = Math.max(10, h.r.pos, a && a.g === h.g ? a.r.pos : 0);
    const nota = a && a.g !== h.g ? `No ${a.label}, ${art(nick(a.r.team))} ${nick(a.r.team)} ${v(nick(a.r.team), "é", "são")} o ${a.r.pos}º, com ${a.r.w} vitórias e ${a.r.l} derrotas.` : null;
    return { titulo: `Classificação da Conferência ${h.label}`, rows: h.g.rows.filter((r) => r.pos <= max), nota };
  }
  const h = divNfl(g.homeId), a = divNfl(g.awayId); if (!h) return null;
  const nota = a && a.g !== h.g ? `${Art(nick(a.r.team))} ${nick(a.r.team)} ${v(nick(a.r.team), "é", "são")} o ${a.r.pos}º da ${a.label} (${a.r.w} V e ${a.r.l} D).` : null;
  return { titulo: `Classificação da ${h.label}`, rows: h.g.rows, nota };
}

function emJogo(g) {
  if (g.liga === "nba") {
    const h = confNba(g.homeId), a = confNba(g.awayId);
    const intro = h && a && h.g === a.g ? `É um confronto direto do ${h.label}: a vitória vale em dobro na briga pela classificação da conferência.` : "Como o jogo é entre conferências diferentes, não há disputa direta na tabela, mas a vitória pesa na campanha de cada um.";
    return [intro, [zonaNba(g.homeId), zonaNba(g.awayId)].filter(Boolean).join(" ")];
  }
  const h = divNfl(g.homeId), a = divNfl(g.awayId);
  const intro = h && a && h.g === a.g ? `É jogo de divisão: além da vitória, vale vantagem no desempate pela liderança da ${h.label}.` : "Os dois times estão em divisões diferentes, mas cada vitória conta na briga pelas vagas nos playoffs.";
  return [intro, [zonaNfl(g.homeId), zonaNfl(g.awayId)].filter(Boolean).join(" ")];
}

const posts = [];
let at = new Date(startIso).getTime();
let author = Number(firstAuthor);
// OA_SKIP=id,id: jogos que já têm guia feito à mão.
const SKIP = new Set((process.env.OA_SKIP || "").split(",").filter(Boolean).map(Number));
for (const g of F.games) {
  if (g.status && g.status !== "notstarted") continue;
  if (SKIP.has(g.id)) continue;
  const A = nick(g.home), Bn = nick(g.away), ch = canais(g, A, Bn), tb = tabela(g), d = dataObj(g.ts), h = hora(g.ts);
  const VENUE = { 3433: ["Scotiabank Arena", "Toronto"] }; // API sem arena pra esses mandantes
  if (!g.venue && VENUE[g.homeId]) [g.venue, g.city] = VENUE[g.homeId];
  if (!g.venue) throw new Error(`sem arena: ${g.home} x ${g.away} (${g.id}); adicione em VENUE`);
  const cidade = CIDADE[g.city] || g.city || "";
  const localCurto = g.venue ? `${g.venue}${cidade ? `, em ${cidade}` : ""}` : cidade;
  const cap = g.cap ? `, com capacidade para ${g.cap.toLocaleString("pt-BR")} torcedores` : "";
  const nba = g.liga === "nba";
  const comp = nba ? "pela temporada regular da NBA" : `pela semana ${g.round ?? ""} da NFL`.replace("semana  ", "");
  const cH = campanha(g.liga, g.homeId), cA = campanha(g.liga, g.awayId);
  const lh = lastBefore(g.homeId, g.ts).pop(), la = lastBefore(g.awayId, g.ts).pop();
  const o = {
    liga: g.liga, data: d, at: new Date(at).toISOString(), authorId: author, matchId: g.id, homeId: g.homeId, awayId: g.awayId,
    A, Bn, hora: h, slugDate: dKey(g.ts).split("-").reverse().join("-"),
    title: `${A} x ${Bn}: onde assistir e horário do jogo da ${nba ? "NBA" : "NFL"} (${ddmm(g.ts)})`,
    canal: ch.canal, canalLongo: ch.canalLongo, canalCapa: ch.canalCapa, canalCapaAlt: ch.canalCapaAlt,
    localCurto, ondeFrase: `${g.venue ? `no ${g.venue}` : ""}${cidade ? `, em ${cidade}` : ""}${cap}`.replace(/^, /, "em "),
    lead: P(`O `, B(g.home), ` recebe o `, B(g.away), ` ${nesteDia(g.ts)}, às `, B(`${h} (de Brasília)`), `${g.venue ? `, no ${g.venue}` : ""}, ${comp}. Onde assistir: `, B(ch.canalLongo), "."),
    comoChegam: [chega(g.liga, g, "home", 0), chega(g.liga, g, "away", 1)].filter(Boolean),
    cardRows: [
      [A, cH ? `${cH.w} V e ${cH.l} D · ${posFrase(g.liga, g.homeId)}` : "-"],
      [Bn, cA ? `${cA.w} V e ${cA.l} D · ${posFrase(g.liga, g.awayId)}` : "-"],
      ...(lh && !ASOF ? [[`Último jogo ${sing(A) ? "do" : "dos"} ${A}`, placar(lh)]] : []),
      ...(la && !ASOF ? [[`Último jogo ${sing(Bn) ? "do" : "dos"} ${Bn}`, placar(la)]] : []),
    ],
    cardSub: ASOF ? `Campanha até ${ddmm(asofTs)}` : undefined,
    tabelaTitulo: `${tb?.titulo || "Classificação"}${ASOF ? ` (até ${ddmm(asofTs)})` : ""}`, tabela: tb?.rows || [], tabelaNota: tb?.nota,
    emJogo: emJogo(g),
    comoAssistir: [...ch.assistir, "As grades das emissoras podem mudar até a hora do jogo; vale conferir a programação antes de começar."],
    links: [`Veja a classificação completa e os próximos jogos na `, LK(nba ? "página da NBA" : "página de futebol americano", nba ? "/nba" : "/futebol-americano"), `. Confira também os `, LK("outros guias de onde assistir", "/onde-assistir"), ` e os `, LK("jogos de hoje", "/jogos-de-hoje"), "."],
    faqCanal: ch.faq,
    faqExtra: cH && cA && !ASOF ? [[`Como estão ${A} e ${Bn} na temporada?`, `${Art(A)} ${A} ${v(A, "tem", "têm")} ${cH.w} vitórias e ${cH.l} derrotas (${posFrase(g.liga, g.homeId)}). ${Art(Bn)} ${Bn} ${v(Bn, "tem", "têm")} ${cA.w} vitórias e ${cA.l} derrotas (${posFrase(g.liga, g.awayId)}).`]] : [],
    excerpt: `${A} e ${Bn} se enfrentam às ${h} ${nesteDia(g.ts).replace(/^(neste|nesta) /, "deste ").replace("deste segunda", "desta segunda").replace("deste terça", "desta terça").replace("deste quarta", "desta quarta").replace("deste quinta", "desta quinta").replace("deste sexta", "desta sexta")}${cidade ? `, em ${cidade}` : ""}. Veja onde assistir ao jogo da ${nba ? "NBA" : "NFL"} e como chegam os dois times.`,
    metaDescription: `Saiba onde assistir a ${A} x ${Bn} ${nesteDia(g.ts)}, às ${h}, pela ${nba ? "NBA" : "NFL"}. Transmissão: ${ch.canal}. Campanha dos times e classificação.`,
  };
  if (o.tabela.length === 0) throw new Error(`sem tabela: ${A} x ${Bn}`);
  posts.push({ at: o.at, ...usPost(o) });
  at += Number(stepMin) * 60000;
  author = author === 1 ? 2 : 1;
}

mkdirSync(outDir, { recursive: true });
const lote = [];
for (const p of posts) {
  writeFileSync(path.join(outDir, `${p.slug}.json`), JSON.stringify(p, null, 1));
  lote.push({ file: `${p.slug}.json`, at: p.at });
  console.log(p.at, p.slug);
}
writeFileSync(path.join(outDir, "oa-lote.json"), JSON.stringify(lote));
