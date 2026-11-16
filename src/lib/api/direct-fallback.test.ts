import { test } from "node:test";
import assert from "node:assert/strict";
import { allowDirectFallback } from "./direct-fallback.ts";

test("container da API nunca cai para o fornecedor direto", () => {
  assert.equal(allowDirectFallback({ PDB_API_MODE: "1" }), false);
  assert.equal(allowDirectFallback({}), true);
  assert.equal(allowDirectFallback({ PDB_API_MODE: "0" }), true);
});
