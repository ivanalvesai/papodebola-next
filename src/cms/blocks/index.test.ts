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

test("todo bloco tem hideOn e grupo", async () => {
  const { pageBlocks } = await import("./index.ts");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const b of pageBlocks({} as any)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.ok(b.fields.some((f: any) => f.name === "hideOn"), b.slug);
    assert.ok(b.admin?.group, b.slug);
  }
});

test("PAGE_BLOCK_SLUGS inclui os blocos ricos", async () => {
  const { PAGE_BLOCK_SLUGS, SECTION_INNER_SLUGS } = await import("./index.ts");
  for (const s of ["hero","cards","cta","faq","testimonials","stats","mediaText","iconList","tabs","divider","carousel","buttons","social","people","timeline","instagram","xPost","embed","formBlock","countdown","snippet"]) {
    assert.ok((PAGE_BLOCK_SLUGS as readonly string[]).includes(s), s);
  }
  assert.ok(!(SECTION_INNER_SLUGS as readonly string[]).includes("snippet"), "snippet não entra dentro de seção");
});

test("blocos de time NÃO ganham hideOn (tabelas de teams intactas)", async () => {
  const { TEAM_LAYOUT_BLOCKS } = await import("./index.ts");
  for (const b of TEAM_LAYOUT_BLOCKS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert.ok(!b.fields.some((f: any) => f.name === "hideOn"), b.slug);
  }
});
