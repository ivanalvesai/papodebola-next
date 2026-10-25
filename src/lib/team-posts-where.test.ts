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

import { titleMentionsTeam, postMatchesTeam } from "./team-posts-where.ts";

test("título casa o nome como palavra inteira", () => {
  assert.equal(titleMentionsTeam("Palmeiras vence o Santos", "Palmeiras"), true);
  assert.equal(titleMentionsTeam("Sport empata na Ilha", "Sport"), true);
  assert.equal(titleMentionsTeam("SporTV mostra o jogo", "Sport"), false);
  assert.equal(titleMentionsTeam("Sporting lidera em Portugal", "Sport"), false);
  assert.equal(titleMentionsTeam("Athletico-PR vence", "Athletic"), false);
  assert.equal(titleMentionsTeam("A remontada do Barça", "Remo"), false);
  assert.equal(titleMentionsTeam("São Paulo goleia", "São Paulo"), true);
});

test("nomes que são palavras comuns não casam pelo título", () => {
  assert.equal(titleMentionsTeam("Vitória suada do Flamengo", "Vitória"), false);
  assert.equal(titleMentionsTeam("Futebol internacional: resumo", "Internacional"), false);
});

test("post casa por relação ou tag mesmo sem o nome no título", () => {
  const base = { title: "Clássico no domingo", tags: [] as { tag?: string }[], teams: [] as unknown[] };
  assert.equal(postMatchesTeam({ ...base, teams: [{ sofascoreId: 1962 }] }, 1962, "Vitória"), true);
  assert.equal(postMatchesTeam({ ...base, tags: [{ tag: "Vitória" }] }, 1962, "Vitória"), true);
  assert.equal(postMatchesTeam(base, 1962, "Vitória"), false);
  assert.equal(postMatchesTeam({ ...base, title: "Vitória vence o Bahia" }, 1962, "Vitória"), false);
  assert.equal(postMatchesTeam({ ...base, title: "Mirassol surpreende" }, 21982, "Mirassol"), true);
});
