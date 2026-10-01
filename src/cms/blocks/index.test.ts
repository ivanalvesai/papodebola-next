import { test } from "node:test";
import assert from "node:assert/strict";
import { staticBlocks, STATIC_BLOCK_SLUGS } from "./static.ts";

test("staticBlocks segue STATIC_BLOCK_SLUGS (ordem e conjunto)", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks = staticBlocks({} as any);
  assert.deepEqual(blocks.map((b) => b.slug), [...STATIC_BLOCK_SLUGS]);
});

test("pageBlocks segue PAGE_BLOCK_SLUGS (Seção + todos os blocos)", async () => {
  const { pageBlocks, PAGE_BLOCK_SLUGS } = await import("./index.ts");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assert.deepEqual(pageBlocks({} as any).map((b) => b.slug), [...PAGE_BLOCK_SLUGS]);
});
