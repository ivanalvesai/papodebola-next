import { test } from "node:test";
import assert from "node:assert/strict";
import { standingsWindow } from "./standings-window.ts";

const rows = Array.from({ length: 20 }, (_, i) => ({ teamId: i + 1 }));
const ids = (r: { teamId: number }[]) => r.map((x) => x.teamId);

test("janela centrada no time", () => {
  assert.deepEqual(ids(standingsWindow(rows, 10, 2)), [8, 9, 10, 11, 12]);
});

test("topo e fundo mantêm 5 linhas", () => {
  assert.deepEqual(ids(standingsWindow(rows, 1, 2)), [1, 2, 3, 4, 5]);
  assert.deepEqual(ids(standingsWindow(rows, 20, 2)), [16, 17, 18, 19, 20]);
});

test("time ausente ou tabela curta", () => {
  assert.deepEqual(standingsWindow(rows, 99, 2), []);
  assert.deepEqual(ids(standingsWindow(rows.slice(0, 3), 2, 2)), [1, 2, 3]);
});
