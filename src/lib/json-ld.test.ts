import { test } from "node:test";
import assert from "node:assert/strict";
import { jsonLd } from "./json-ld.ts";

test("jsonLd não deixa fechar a tag script", () => {
  const x = { name: "</script><script>alert(1)</script>", text: "a & b > c <!--" };
  const out = jsonLd(x);
  assert.ok(!out.includes("</script"));
  assert.ok(!/[<>&]/.test(out));
});

test("jsonLd preserva os dados ao parsear", () => {
  const x = { "@type": "FAQPage", mainEntity: [{ name: "P&R <b>", n: 1, ok: true, z: null }] };
  assert.deepEqual(JSON.parse(jsonLd(x)), x);
});
