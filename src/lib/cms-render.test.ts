import { test } from "node:test";
import assert from "node:assert/strict";
import { widgetToBlockType, resolveTournament, pathBreadcrumb } from "./cms-render.ts";

test("widgetToBlockType mapeia pros slugs dos blocos de time", () => {
  assert.equal(widgetToBlockType("upcoming"), "teamUpcoming");
  assert.equal(widgetToBlockType("whereToWatch"), "teamWhereToWatch");
  assert.equal(widgetToBlockType("todayMatch"), "teamTodayMatch");
  assert.equal(widgetToBlockType("xpto"), "");
});
test("resolveTournament", () => {
  assert.deepEqual(resolveTournament("copa-do-mundo"), { kind: "worldcup" });
  const r = resolveTournament("brasileirao-serie-b");
  assert.equal(r?.kind, "tournament");
  assert.equal(resolveTournament("nao-existe"), null);
  assert.equal(resolveTournament(undefined), null);
});
test("pathBreadcrumb gera trilha a partir do caminho", () => {
  assert.deepEqual(pathBreadcrumb("/volei/mundial-2026", "Mundial 2026"), [
    { label: "Início", href: "/" },
    { label: "Volei", href: "/volei" },
    { label: "Mundial 2026", href: "/volei/mundial-2026" },
  ]);
});
