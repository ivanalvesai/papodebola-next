import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanReferee,
  cleanVenue,
  deriveChampion,
  fixBrokenMatchKey,
  isValidMatchKey,
  mergeChampionships,
  mergeMatchRecords,
} from "./municipal-archive.ts";

const m = (round: number, home: string, away: string, hs: number | null, as: number | null, roundLabel = "") => ({
  round, roundLabel, home, away, homeScore: hs, awayScore: as,
});

test("campeonatos: vivo vence; o que só existe no arquivo continua servido", () => {
  const live = [{ name: "1ª", slug: "a", v: "vivo", matches: [m(1, "X", "Y", 1, 0)] }];
  const arch = [
    { name: "1ª", slug: "a", v: "arquivo", matches: [m(1, "X", "Y", 1, 0)] },
    { name: "3ª", slug: "c", v: "arquivo", matches: [] },
  ];
  assert.deepEqual(mergeChampionships(live, arch).map((c) => `${c.slug}:${c.v}`), ["a:vivo", "c:arquivo"]);
  assert.deepEqual(mergeChampionships([], arch).map((c) => c.slug), ["a", "c"]);
  assert.deepEqual(mergeChampionships(live, []).map((c) => c.v), ["vivo"]);
});

test("campeonatos: vivo com time '?' (raspagem quebrada) perde pro arquivo íntegro", () => {
  const live = [{ name: "1ª", slug: "a", v: "vivo", matches: [m(14, "SANTANA", "?", 1, 0)] }];
  const arch = [{ name: "1ª", slug: "a", v: "arquivo", matches: [m(14, "SANTANA", "UNIÃO DO MORRO", 1, 0)] }];
  assert.equal(mergeChampionships(live, arch)[0].v, "arquivo");
  // arquivo também quebrado → fica o vivo
  assert.equal(mergeChampionships(live, [{ ...arch[0], matches: live[0].matches }])[0].v, "vivo");
});

test("fichas de jogo: vivo sobrescreve, chave só do arquivo permanece", () => {
  const out = mergeMatchRecords({ "01-01-2026/a-b": 2 }, { "01-01-2026/a-b": 1, "02-01-2026/c-d": 3 });
  assert.deepEqual(out, { "01-01-2026/a-b": 2, "02-01-2026/c-d": 3 });
});

test("chaves quebradas ficam de fora e redirecionam pra certa", () => {
  assert.equal(isValidMatchKey("19-09-2026/santana-uniao-do-morro"), true);
  assert.equal(isValidMatchKey("19-09-2026/santana-"), false);
  assert.equal(isValidMatchKey("santana-uniao-TOKEN"), false);
  const rec = (home: string) => ({ home });
  const records = {
    "19-09-2026/santana-": rec("SANTANA"),
    "19-09-2026/santana-uniao-do-morro": rec("SANTANA"),
    "30-08-2026/santana-sao-luiz": rec("SANTANA"),
    "30-08-2026/santana-outro": rec("SANTANA"),
    "05-09-2026/santana-fc-x": rec("SANTANA FC"), // prefixo casa, mas o mandante é outro
  };
  assert.equal(fixBrokenMatchKey("19-09-2026", "santana-", records), "19-09-2026/santana-uniao-do-morro");
  assert.equal(fixBrokenMatchKey("30-08-2026", "santana-", records), null); // ambíguo
  assert.equal(fixBrokenMatchKey("05-09-2026", "santana-", records), null); // mandante "santana-fc" ≠ "santana"
  assert.equal(fixBrokenMatchKey("19-09-2026", "santana-uniao-do-morro", records), null);
});

test("limpa local/arbitragem raspados com lixo", () => {
  assert.equal(cleanVenue(">Local \r\n     \r\n   ESTÁDIO MUNICIPAL (X) \r\n   RUA Y"), "ESTÁDIO MUNICIPAL (X)");
  assert.equal(cleanVenue("CAMPO DO 120"), "CAMPO DO 120");
  assert.equal(cleanReferee(">Arbitragem"), "");
  assert.equal(cleanReferee("JOÃO"), "JOÃO");
});

test("campeão = vencedor da final, com o nome da tabela", () => {
  const c = {
    groups: [{ teams: [{ name: "UNIÃO DO MORRO", badge: "/u.png" }, { name: "S.C SANTANA", badge: "/s.png" }] }],
    matches: [m(13, "SANTANA", "SÃO LUIZ", 2, 2, "13ª Rodada - Semi Final"), m(14, "SANTANA", "UNIÃO DO MORRO", 1, 0, "14ª Rodada - Final")],
  };
  assert.deepEqual(deriveChampion(c), { team: "S.C SANTANA", badge: "/s.png", score: "SANTANA 1 x 0 UNIÃO DO MORRO" });
  // visitante vence
  const away = { ...c, matches: [m(14, "SANTANA", "UNIÃO DO MORRO", 0, 2, "14ª Rodada - Final")] };
  assert.equal(deriveChampion(away)?.team, "UNIÃO DO MORRO");
});

test("sem campeão: final empatada, jogo pendente, sem final ou time '?'", () => {
  assert.equal(deriveChampion({ matches: [m(14, "A", "B", 1, 1, "14ª Rodada - Final")] }), null);
  assert.equal(deriveChampion({ matches: [m(13, "A", "B", 1, null, "Semi"), m(14, "A", "B", 1, 0, "14ª Rodada - Final")] }), null);
  assert.equal(deriveChampion({ matches: [m(11, "A", "B", 1, 0, "11ª Rodada - Grupos")] }), null);
  assert.equal(deriveChampion({ matches: [m(13, "A", "B", 1, 0, "13ª Rodada - Semi Final")] }), null);
  assert.equal(deriveChampion({ matches: [m(14, "A", "?", 1, 0, "14ª Rodada - Final")] }), null);
  assert.equal(deriveChampion({ matches: [] }), null);
});
