import { test } from "node:test";
import assert from "node:assert/strict";
import { dropStaleUpcoming } from "./team-match-filters.ts";

test("descarta jogo que começou há mais de 3h e mantém o resto", () => {
  const now = 1_800_000_000;
  const list = [
    { id: 1, timestamp: now - 4 * 3600 },
    { id: 2, timestamp: now - 2 * 3600 },
    { id: 3, timestamp: now + 3600 },
    { id: 4, timestamp: 0 },
  ];
  assert.deepEqual(dropStaleUpcoming(list, now).map((m) => m.id), [2, 3]);
});
