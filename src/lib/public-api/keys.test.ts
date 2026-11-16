import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKey, hashKey, newRecord, findKey } from "./keys.ts";

test("chave tem formato pdb_ + 40 alfanuméricos e é aleatória", () => {
  const a = generateKey(), b = generateKey();
  assert.match(a, /^pdb_[A-Za-z0-9]{40}$/);
  assert.notEqual(a, b);
});

test("registro guarda só hash e prefixo, nunca a chave", () => {
  const { key, record } = newRecord("Site novo", ["1.2.3.4"]);
  assert.equal(record.hash, hashKey(key));
  assert.equal(record.prefixo, key.slice(0, 8));
  assert.equal(JSON.stringify(record).includes(key), false);
  assert.equal(record.cotaPorMinuto, 600);
  assert.equal(record.ativa, true);
});

test("findKey acha pelo hash e rejeita chave errada", () => {
  const { key, record } = newRecord("x", ["*"]);
  assert.equal(findKey([record], key)?.id, record.id);
  assert.equal(findKey([record], key.slice(0, -1) + "Z"), null);
  assert.equal(findKey([record], ""), null);
});
