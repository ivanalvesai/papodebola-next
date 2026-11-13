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
