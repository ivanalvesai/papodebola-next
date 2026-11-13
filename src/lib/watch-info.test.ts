import { test } from "node:test";
import assert from "node:assert/strict";
import { articleHref, WATCH_CATEGORY } from "./config.ts";
import { extractWatchInfo } from "./watch-info.ts";

test("post de onde assistir mora em /onde-assistir/{slug}", () => {
  assert.equal(
    articleHref(WATCH_CATEGORY, "holanda-x-grecia-onde-assistir-horario-e-escalacoes"),
    "/onde-assistir/holanda-x-grecia-onde-assistir-horario-e-escalacoes"
  );
});

test("extractWatchInfo lê o bloco matchInfo (mesmo aninhado)", () => {
  const content = {
    root: {
      children: [
        { type: "paragraph", children: [] },
        { type: "block", fields: { blockType: "matchInfo", channels: " ESPN e Disney+ ", channelsConfirmed: true } },
      ],
    },
  };
  assert.deepEqual(extractWatchInfo(content), { channels: "ESPN e Disney+", confirmed: true });
});

test("extractWatchInfo: sem bloco, conteúdo vazio ou canal vazio → null", () => {
  assert.equal(extractWatchInfo({ root: { children: [] } }), null);
  assert.equal(extractWatchInfo(null), null);
  assert.equal(
    extractWatchInfo({ root: { children: [{ type: "block", fields: { blockType: "matchInfo", channels: "  " } }] } }),
    null
  );
});

import { normalizeReferee } from "./watch-info.ts";
test("normalizeReferee: nome + país traduzido; sem árbitro → null", () => {
  assert.deepEqual(normalizeReferee({ referee: { name: "Rohit Saggi", country: { name: "Norway" } } }), {
    name: "Rohit Saggi",
    country: "Noruega",
  });
  assert.deepEqual(normalizeReferee({ referee: { name: "X" } }), { name: "X", country: "" });
  assert.equal(normalizeReferee({}), null);
  assert.equal(normalizeReferee({ referee: { name: "" } }), null);
});

import { groupLabel } from "./group-label.ts";
import { toWatchMatch } from "./watch-info.ts";
test("groupLabel entende o formato abreviado 'Gr. 2' do match/{id}", () => {
  assert.equal(groupLabel("UEFA Nations League, League A, Gr. 2"), "Liga A · Grupo 2");
});
test("toWatchMatch: liga das nações → campeonato, grupo, rodada, local com capacidade, árbitro, href", () => {
  const raw = {
    id: 15534069,
    startTimestamp: 1794599100,
    status: { type: "notstarted" },
    homeTeam: { id: 4705, name: "Netherlands" },
    awayTeam: { id: 4710, name: "Greece" },
    tournament: { name: "UEFA Nations League, League A, Gr. 2", uniqueTournament: { id: 10783 } },
    roundInfo: { round: 5 },
    venue: { name: "Johan Cruijff Arena", stadium: { capacity: 55865 }, city: { name: "Amsterdam" } },
    referee: { name: "Rohit Saggi", country: { name: "Norway" } },
  };
  const href = (slug: string, _ts: number, _h: number, _a: number, home: string, away: string) => `/${slug}/${home}-${away}`;
  const m = toWatchMatch(raw, href)!;
  assert.equal(m.home, "Holanda");
  assert.equal(m.away, "Grécia");
  assert.equal(m.champSlug, "liga-das-nacoes");
  assert.equal(m.tournament, "Liga das Nações");
  assert.equal(m.group, "Liga A · Grupo 2");
  assert.equal(m.round, 5);
  assert.deepEqual(m.venue, { stadium: "Johan Cruijff Arena", city: "Amsterdã", capacity: 55865 });
  assert.deepEqual(m.referee, { name: "Rohit Saggi", country: "Noruega" });
  assert.equal(m.href, "/liga-das-nacoes/Holanda-Grécia");
});
test("toWatchMatch: sem venue/árbitro → null; campeonato desconhecido → href null", () => {
  const m = toWatchMatch({ id: 1, startTimestamp: 1, homeTeam: { id: 1, name: "A" }, awayTeam: { id: 2, name: "B" }, tournament: { uniqueTournament: { id: 999999 }, name: "X" } }, () => "/nunca")!;
  assert.equal(m.venue, null);
  assert.equal(m.referee, null);
  assert.equal(m.href, null);
  assert.equal(toWatchMatch(null, () => ""), null);
});

import { splitAtMatchInfoSlot, MATCH_INFO_SLOT } from "./watch-info.ts";
test("splitAtMatchInfoSlot divide o corpo no marcador do bloco; sem marcador → tudo depois", () => {
  assert.deepEqual(splitAtMatchInfoSlot(`<p>a</p>${MATCH_INFO_SLOT}<p>b</p>`), ["<p>a</p>", "<p>b</p>"]);
  assert.deepEqual(splitAtMatchInfoSlot("<p>a</p>"), ["", "<p>a</p>"]);
});
