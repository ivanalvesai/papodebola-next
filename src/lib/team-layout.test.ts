import { test } from "node:test";
import assert from "node:assert/strict";
import { needsAutoTextAppend } from "./team-layout.ts";

test("layout sem o bloco recebe o texto no fim; com o bloco, não", () => {
  assert.equal(needsAutoTextAppend([{ blockType: "teamNews" }]), true);
  assert.equal(needsAutoTextAppend([{ blockType: "teamNews" }, { blockType: "teamAutoText" }]), false);
  assert.equal(needsAutoTextAppend([]), true);
});
