import { test } from "node:test";
import assert from "node:assert/strict";
import { authorize } from "./authorize.ts";
import { newRecord } from "./keys.ts";
import { createRateLimiter } from "./rate-limit.ts";

const { key, record } = newRecord("site", ["10.0.0.1"], 2);
const rl = () => createRateLimiter(() => 0);

test("sem chave = 401 chave_ausente", () => {
  const r = authorize({ key: null, ip: "10.0.0.1", records: [record] }, rl());
  assert.deepEqual([r.ok, !r.ok && r.status, !r.ok && r.codigo], [false, 401, "chave_ausente"]);
});
test("chave errada = 401 chave_invalida", () => {
  const r = authorize({ key: "pdb_x", ip: "10.0.0.1", records: [record] }, rl());
  assert.equal(!r.ok && r.codigo, "chave_invalida");
});
test("sem arquivo de chaves = 401 (falha fechada)", () => {
  const r = authorize({ key, ip: "10.0.0.1", records: [] }, rl());
  assert.equal(!r.ok && r.status, 401);
});
test("IP fora da lista = 403", () => {
  const r = authorize({ key, ip: "8.8.8.8", records: [record] }, rl());
  assert.deepEqual([!r.ok && r.status, !r.ok && r.codigo], [403, "ip_nao_autorizado"]);
});
test("IP ausente com lista restrita = 403", () => {
  assert.equal(!authorize({ key, ip: null, records: [record] }, rl()).ok, true);
});
test("chave desativada = 403", () => {
  const r = authorize({ key, ip: "10.0.0.1", records: [{ ...record, ativa: false }] }, rl());
  assert.equal(!r.ok && r.codigo, "chave_desativada");
});
test("'*' libera qualquer IP; cota estourada = 429 com retryAfter", () => {
  const open = { ...record, ipsPermitidos: ["*"] };
  const l = rl();
  assert.equal(authorize({ key, ip: "9.9.9.9", records: [open] }, l).ok, true);
  assert.equal(authorize({ key, ip: "9.9.9.9", records: [open] }, l).ok, true);
  const r = authorize({ key, ip: "9.9.9.9", records: [open] }, l);
  assert.deepEqual([!r.ok && r.status, !r.ok && r.codigo], [429, "limite_excedido"]);
  assert.ok(!r.ok && (r.retryAfter ?? 0) >= 1);
});
