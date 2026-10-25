import { test } from "node:test";
import assert from "node:assert/strict";
import { teamPostsWhere } from "./team-posts-where.ts";

test("casa por relação, tag ou título (frase exata)", () => {
  assert.deepEqual(teamPostsWhere(1963, "Palmeiras"), {
    or: [
      { "teams.sofascoreId": { equals: 1963 } },
      { "tags.tag": { like: "Palmeiras" } },
      { title: { contains: "Palmeiras" } },
    ],
  });
});

test("nome vazio → só a relação", () => {
  assert.deepEqual(teamPostsWhere(1963, "  "), { or: [{ "teams.sofascoreId": { equals: 1963 } }] });
});
