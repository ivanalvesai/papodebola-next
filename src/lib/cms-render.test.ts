import { test } from "node:test";
import assert from "node:assert/strict";
import { widgetToBlockType, resolveTournament, pathBreadcrumb, hideOnClass, parseStatValue, formatStatValue, gridColsClass, isFullBleedSection } from "./cms-render.ts";

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
test("hideOnClass esconde por dispositivo e não mexe quando não há hideOn", () => {
  assert.equal(hideOnClass({ hideOn: "mobile" }), "max-md:hidden");
  assert.equal(hideOnClass({ hideOn: "desktop" }), "md:hidden");
  assert.equal(hideOnClass({ hideOn: "none" }), "");
  assert.equal(hideOnClass({}), "");
  assert.equal(hideOnClass(undefined), "");
});
test("parseStatValue só anima inteiros (com separador de milhar)", () => {
  assert.deepEqual(parseStatValue("1.200"), { target: 1200, sep: "." });
  assert.deepEqual(parseStatValue("2,500,000"), { target: 2500000, sep: "," });
  assert.deepEqual(parseStatValue(" 45 "), { target: 45, sep: "" });
  assert.equal(parseStatValue("3,5"), null);
  assert.equal(parseStatValue("R$ 10"), null);
  assert.equal(parseStatValue(""), null);
  assert.equal(parseStatValue(undefined), null);
});
test("formatStatValue mantém o separador original", () => {
  assert.equal(formatStatValue(1200, "."), "1.200");
  assert.equal(formatStatValue(999, "."), "999");
  assert.equal(formatStatValue(2500000, ","), "2,500,000");
  assert.equal(formatStatValue(1200, ""), "1200");
});
test("gridColsClass converte a coluna salva como texto em classes estáticas", () => {
  assert.equal(gridColsClass("2"), "sm:grid-cols-2");
  assert.equal(gridColsClass("3"), "sm:grid-cols-2 lg:grid-cols-3");
  assert.equal(gridColsClass("4"), "sm:grid-cols-2 lg:grid-cols-4");
  assert.equal(gridColsClass(undefined), "sm:grid-cols-2 lg:grid-cols-3");
  assert.equal(gridColsClass("9"), "sm:grid-cols-2 lg:grid-cols-3");
});
test("isFullBleedSection só para seção largura total em página largura total", () => {
  assert.equal(isFullBleedSection({ blockType: "section", width: "full" }, "full"), true);
  assert.equal(isFullBleedSection({ blockType: "section", width: "full" }, "narrow"), false);
  assert.equal(isFullBleedSection({ blockType: "section", width: "wide" }, "full"), false);
  assert.equal(isFullBleedSection({ blockType: "hero", width: "full" }, "full"), false);
  assert.equal(isFullBleedSection(undefined, "full"), false);
});
