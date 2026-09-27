import { test } from "node:test";
import assert from "node:assert/strict";
import { planArchive, isFinishedMatch } from "./archive-select.ts";

const NOW = 2_000_000_000;

test("só jogo encerrado é candidato; sem status usa 3h após o apito", () => {
  assert.equal(isFinishedMatch({ id: 1, timestamp: 1, status: "finished" }, NOW), true);
  assert.equal(isFinishedMatch({ id: 1, timestamp: 1, status: "inprogress" }, NOW), false);
  assert.equal(isFinishedMatch({ id: 1, timestamp: 1, status: "postponed" }, NOW), false);
  assert.equal(isFinishedMatch({ id: 1, timestamp: 1, status: "canceled" }, NOW), false);
  assert.equal(isFinishedMatch({ id: 1, timestamp: NOW - 4 * 3600 }, NOW), true);
  assert.equal(isFinishedMatch({ id: 1, timestamp: NOW - 2 * 3600 }, NOW), false);
  assert.equal(isFinishedMatch({ id: 1, timestamp: 0 }, NOW), false);
  assert.equal(isFinishedMatch({ id: 0, timestamp: 1, status: "finished" }, NOW), false);
});

test("pula já arquivados, ordena do mais antigo e respeita a ordem dos torneios", () => {
  const plan = planArchive(
    [
      {
        slug: "a",
        matches: [
          { id: 3, timestamp: 300, status: "finished" },
          { id: 1, timestamp: 100, status: "finished" },
          { id: 2, timestamp: 200, status: "finished" },
          { id: 9, timestamp: NOW + 100, status: "notstarted" },
        ],
      },
      { slug: "b", matches: [{ id: 5, timestamp: 50, status: "finished" }] },
    ],
    new Set([2]),
    10,
    NOW
  );
  assert.deepEqual(plan.queue.map((q) => [q.slug, q.match.id]), [["a", 1], ["a", 3], ["b", 5]]);
  assert.deepEqual(
    plan.tournaments.map((t) => [t.slug, t.finishedMatches, t.alreadyArchived]),
    [["a", 3, 1], ["b", 1, 0]]
  );
  assert.equal(plan.pendingTotal, 3);
});

test("max limita a fila mas pendingTotal conta tudo", () => {
  const matches = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, timestamp: i + 1, status: "finished" }));
  const plan = planArchive([{ slug: "a", matches }, { slug: "b", matches: [{ id: 99, timestamp: 1, status: "finished" }] }], new Set(), 4, NOW);
  assert.deepEqual(plan.queue.map((q) => q.match.id), [1, 2, 3, 4]);
  assert.equal(plan.pendingTotal, 11);
  assert.equal(planArchive([{ slug: "a", matches }], new Set(), 0, NOW).queue.length, 0);
});

test("id repetido (grupos + mata-mata da Copa) entra uma vez só", () => {
  const plan = planArchive(
    [
      { slug: "copa", matches: [{ id: 7, timestamp: 10 }, { id: 7, timestamp: 10, status: "finished" }] },
      { slug: "outro", matches: [{ id: 7, timestamp: 10, status: "finished" }] },
    ],
    new Set(),
    10,
    NOW
  );
  assert.equal(plan.queue.length, 1);
  assert.equal(plan.tournaments[0].finishedMatches, 1);
  assert.equal(plan.tournaments[1].finishedMatches, 0);
});
