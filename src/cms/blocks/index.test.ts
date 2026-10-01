import { test } from "node:test";
import assert from "node:assert/strict";
import { staticBlocks, STATIC_BLOCK_SLUGS } from "./static.ts";

test("staticBlocks segue STATIC_BLOCK_SLUGS (ordem e conjunto)", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks = staticBlocks({} as any);
  assert.deepEqual(blocks.map((b) => b.slug), [...STATIC_BLOCK_SLUGS]);
});
