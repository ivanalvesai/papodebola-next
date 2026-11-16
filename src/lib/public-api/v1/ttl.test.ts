import { test } from "node:test";
import assert from "node:assert/strict";
import { toStatusV1 } from "./status.ts";
import { matchTtl, suggestedRefresh } from "./ttl.ts";

test("status bruto da API vira status do contrato", () => {
  assert.equal(toStatusV1("notstarted"), "agendado");
  assert.equal(toStatusV1("inprogress"), "ao_vivo");
  assert.equal(toStatusV1("inprogress", "Halftime"), "intervalo");
  assert.equal(toStatusV1("inprogress", "Intervalo"), "intervalo");
  assert.equal(toStatusV1("finished"), "encerrado");
  assert.equal(toStatusV1("postponed"), "adiado");
  assert.equal(toStatusV1("canceled"), "cancelado");
  assert.equal(toStatusV1("cancelled"), "cancelado");
  assert.equal(toStatusV1("interrupted"), "interrompido");
  assert.equal(toStatusV1("suspended"), "interrompido");
  assert.equal(toStatusV1(""), "agendado");
});

test("ttl e atualização sugerida por status", () => {
  assert.equal(matchTtl("ao_vivo"), 10);
  assert.equal(matchTtl("intervalo"), 10);
  assert.equal(matchTtl("encerrado"), 86400);
  assert.equal(matchTtl("agendado"), 60);
  assert.equal(suggestedRefresh("ao_vivo"), 10);
  assert.equal(suggestedRefresh("intervalo"), 60);
  assert.equal(suggestedRefresh("encerrado"), 86400);
  assert.equal(suggestedRefresh("agendado"), 300);
});
