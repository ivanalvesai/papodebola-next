import { test } from "node:test";
import assert from "node:assert/strict";
import { tournamentOptions, WIDGET_OPTIONS } from "./options.ts";

test("tournamentOptions inclui todos do config + Copa", () => {
  const values = tournamentOptions().map((o) => o.value);
  assert.ok(values.includes("brasileirao-serie-a"));
  assert.ok(values.includes("premier-league"));
  assert.equal(values[0], "copa-do-mundo");
  assert.equal(new Set(values).size, values.length);
});
test("WIDGET_OPTIONS tem os 8 widgets do time", () => {
  assert.equal(WIDGET_OPTIONS.length, 8);
  assert.deepEqual(WIDGET_OPTIONS.map((o) => o.value), ["todayMatch","upcoming","results","standing","news","scorers","whereToWatch","lineup"]);
});
