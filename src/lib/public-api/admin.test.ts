import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanIps, clampCota, publicRecord } from "./admin.ts";

test("cleanIps aceita IPv4, IPv6 e '*', separados por vírgula/espaço, e descarta lixo", () => {
  assert.deepEqual(cleanIps("1.2.3.4, 5.6.7.8\n*"), ["1.2.3.4", "5.6.7.8", "*"]);
  assert.deepEqual(cleanIps(["2001:db8::1", "bobagem", "<script>"]), ["2001:db8::1"]);
  assert.deepEqual(cleanIps(""), []);
  assert.deepEqual(cleanIps("1.2.3.4 1.2.3.4"), ["1.2.3.4"]);
});

test("clampCota limita entre 10 e 6000 e usa 600 como padrão", () => {
  assert.equal(clampCota(undefined), 600);
  assert.equal(clampCota("abc"), 600);
  assert.equal(clampCota(5), 10);
  assert.equal(clampCota(99999), 6000);
  assert.equal(clampCota("120"), 120);
});

test("publicRecord nunca expõe o hash", () => {
  const r = publicRecord({ id: "1", nome: "x", hash: "segredo", prefixo: "pdb_abcd", ipsPermitidos: ["*"], cotaPorMinuto: 600, ativa: true, criadaEm: "" });
  assert.equal("hash" in r, false);
  assert.equal(r.prefixo, "pdb_abcd");
});
