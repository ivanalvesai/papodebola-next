import { test } from "node:test";
import assert from "node:assert/strict";
import { escHtml, escAttr, safeUrl, stripUnsafeUrls, videoFigureHtml } from "./html-escape.ts";

test("escapes", () => {
  assert.equal(escHtml("<b>&"), "&lt;b&gt;&amp;");
  assert.equal(escAttr(`"x'`), "&quot;x&#39;");
});
test("legenda do vídeo é escapada (figcaption e title)", () => {
  const h = videoFigureHtml("https://www.youtube.com/embed/abcdefghijk", `<img src=x onerror=alert(1)>"`);
  assert.ok(!h.includes("<img"));
  assert.ok(h.includes("&lt;img src=x onerror=alert(1)&gt;"));
  assert.ok(!/title="[^"]*"[^ ]*onerror/.test(h));
  assert.match(h, /title="&lt;img src=x onerror=alert\(1\)&gt;&quot;"/);
});
test("safeUrl derruba javascript:, vbscript: e data: não-imagem", () => {
  for (const u of ["javascript:alert(1)", " JaVaScRiPt:x", "java\tscript:x", "&#106;avascript:x", "javascript&colon;x", "vbscript:x", "data:text/html,<b>"]) {
    assert.equal(safeUrl(u), "", u);
  }
  for (const u of ["https://a.com/x", "/autor/x", "#sec", "mailto:a@b.c", "data:image/png;base64,AAA"]) assert.equal(safeUrl(u), u, u);
});
test("stripUnsafeUrls troca hrefs perigosos por #", () => {
  const h = stripUnsafeUrls(`<a href="javascript:alert(1)">a</a><a href='https://ok'>b</a><a href=javascript:x>c</a><img src="data:text/html,x">`);
  assert.equal(h, `<a href="#">a</a><a href='https://ok'>b</a><a href="#">c</a><img src="#">`);
});
