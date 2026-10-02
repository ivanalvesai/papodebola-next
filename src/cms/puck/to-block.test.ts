import { test } from "node:test";
import assert from "node:assert/strict";
import { puckPropsToBlock } from "./to-block.ts";

test("Heading/Text/Button viram blocos da biblioteca", () => {
  assert.deepEqual(puckPropsToBlock("Heading", { text: "Oi", level: "h3" }), { blockType: "heading", text: "Oi", level: "h3" });
  assert.deepEqual(puckPropsToBlock("Button", { label: "Ver", url: "/x", style: "outline" }), { blockType: "button", label: "Ver", url: "/x", style: "outline" });
  assert.equal(puckPropsToBlock("Text", { text: "a\nb" })?.blockType, "richText");
});
test("Text vira Lexical com um parágrafo por linha", () => {
  const b = puckPropsToBlock("Text", { text: "a\nb" });
  assert.equal(b.content.root.children.length, 2);
  assert.equal(b.content.root.children[1].children[0].text, "b");
});
test("TeamWidget usa o id do time escolhido", () => {
  assert.deepEqual(puckPropsToBlock("TeamWidget", { team: { id: 7, name: "Cruzeiro" }, widget: "news", limit: 4 }), { blockType: "teamWidget", team: 7, widget: "news", title: undefined, limit: 4 });
  assert.equal(puckPropsToBlock("TeamWidget", { widget: "news" }), null);
});
test("desconhecido é null", () => { assert.equal(puckPropsToBlock("Nope", {}), null); });

// ── 21 blocos novos ─────────────────────────────────────────────────────────
const img = { id: 9, url: "/cms-api/media/file/a.jpg", alt: "A", filename: "a.jpg" };
test("Hero: título, botões e imagem de fundo vira {url,alt}", () => {
  const b = puckPropsToBlock("Hero", { title: "Oi", bgColor: "dark", bgImage: img, buttons: [{ label: "Ver", href: "/x", style: "white" }] });
  assert.equal(b.blockType, "hero");
  assert.equal(b.title, "Oi");
  assert.deepEqual(b.bgImage, { url: img.url, alt: "A" });
  assert.equal(b.buttons[0].style, "white");
});
test("Cards: imagem de cada item vira {url,alt}", () => {
  const b = puckPropsToBlock("Cards", { columns: "2", items: [{ title: "C", image: img }, { title: "D" }] });
  assert.equal(b.blockType, "cards");
  assert.equal(b.columns, "2");
  assert.deepEqual(b.items[0].image, { url: img.url, alt: "A" });
  assert.equal(b.items[1].image, undefined);
});
test("Cta", () => {
  const b = puckPropsToBlock("Cta", { title: "T", background: "image", bgImage: img });
  assert.equal(b.blockType, "cta");
  assert.equal(b.bgImage.url, img.url);
});
test("Faq: schema booleano", () => {
  const b = puckPropsToBlock("Faq", { items: [{ question: "Q", answer: "A" }], schema: false });
  assert.equal(b.blockType, "faq");
  assert.equal(b.schema, false);
  assert.equal(b.items[0].question, "Q");
  assert.equal(puckPropsToBlock("Faq", { items: [] }).schema, true);
});
test("Testimonials: foto vira {url,alt}", () => {
  const b = puckPropsToBlock("Testimonials", { layout: "carousel", items: [{ quote: "q", name: "N", photo: img }] });
  assert.equal(b.blockType, "testimonials");
  assert.equal(b.items[0].photo.url, img.url);
});
test("Stats", () => {
  const b = puckPropsToBlock("Stats", { items: [{ value: "10", label: "L", suffix: "%" }] });
  assert.equal(b.blockType, "stats");
  assert.equal(b.items[0].suffix, "%");
});
test("MediaText: textarea vira Lexical", () => {
  const b = puckPropsToBlock("MediaText", { image: img, title: "T", text: "a\nb", button: { label: "L", href: "/h" } });
  assert.equal(b.blockType, "mediaText");
  assert.equal(b.text.root.children.length, 2);
  assert.equal(b.image.url, img.url);
  assert.equal(b.button.href, "/h");
});
test("IconList", () => {
  const b = puckPropsToBlock("IconList", { columns: "2", items: [{ icon: "star", text: "x" }] });
  assert.equal(b.blockType, "iconList");
  assert.equal(b.items[0].icon, "star");
});
test("Tabs: conteúdo de cada aba vira Lexical", () => {
  const b = puckPropsToBlock("Tabs", { items: [{ label: "A", content: "um" }, { label: "B", content: "dois\ntrês" }] });
  assert.equal(b.blockType, "tabs");
  assert.equal(b.items[1].content.root.children.length, 2);
});
test("Divider", () => {
  assert.deepEqual(puckPropsToBlock("Divider", { style: "space", size: "lg" }), { blockType: "divider", style: "space", size: "lg", hideOn: "none" });
});
test("Carousel: imagens viram {url,alt}, sem imagem some", () => {
  const b = puckPropsToBlock("Carousel", { aspect: "1:1", images: [{ image: img, caption: "c" }, { caption: "sem" }] });
  assert.equal(b.blockType, "carousel");
  assert.equal(b.images.length, 1);
  assert.equal(b.images[0].image.url, img.url);
});
test("Buttons", () => {
  const b = puckPropsToBlock("Buttons", { align: "center", items: [{ label: "a", href: "/a", style: "outline" }] });
  assert.equal(b.blockType, "buttons");
  assert.equal(b.align, "center");
});
test("Social", () => {
  const b = puckPropsToBlock("Social", { size: "lg", items: [{ network: "x", url: "https://x.com/a" }] });
  assert.equal(b.blockType, "social");
  assert.equal(b.items[0].network, "x");
});
test("People: foto e links", () => {
  const b = puckPropsToBlock("People", { items: [{ name: "N", photo: img, links: [{ label: "l", url: "/u" }] }] });
  assert.equal(b.blockType, "people");
  assert.equal(b.items[0].photo.url, img.url);
  assert.equal(b.items[0].links[0].url, "/u");
});
test("Timeline", () => {
  const b = puckPropsToBlock("Timeline", { items: [{ date: "2020", title: "T" }] });
  assert.equal(b.blockType, "timeline");
  assert.equal(b.items[0].date, "2020");
});
test("Instagram / XPost / Embed", () => {
  assert.equal(puckPropsToBlock("Instagram", { url: "https://instagram.com/p/x" }).blockType, "instagram");
  assert.equal(puckPropsToBlock("XPost", { url: "https://x.com/a/status/1", caption: "c" }).caption, "c");
  const e = puckPropsToBlock("Embed", { html: "<b>x</b>", height: 200 });
  assert.equal(e.blockType, "embed");
  assert.equal(e.height, 200);
  assert.equal(puckPropsToBlock("Instagram", {}), null);
});
test("FormBlock: form escolhido vira id e intro vira Lexical", () => {
  const b = puckPropsToBlock("FormBlock", { form: { id: 4, title: "Contato" }, intro: "Olá", compact: true });
  assert.equal(b.blockType, "formBlock");
  assert.equal(b.form, 4);
  assert.equal(b.compact, true);
  assert.equal(b.intro.root.children[0].children[0].text, "Olá");
  assert.equal(puckPropsToBlock("FormBlock", {}), null);
});
test("Countdown: time vira id", () => {
  const b = puckPropsToBlock("Countdown", { team: { id: 7, name: "X" }, showBroadcast: false });
  assert.equal(b.blockType, "countdown");
  assert.equal(b.team, 7);
  assert.equal(b.showBroadcast, false);
  assert.equal(puckPropsToBlock("Countdown", { matchId: "123" }).matchId, 123);
});
test("Snippet: trecho escolhido vira id", () => {
  assert.deepEqual(puckPropsToBlock("Snippet", { snippet: { id: 3 } }), { blockType: "snippet", snippet: 3 });
  assert.equal(puckPropsToBlock("Snippet", {}), null);
});
test("hideOn passa adiante", () => {
  assert.equal(puckPropsToBlock("Stats", { items: [], hideOn: "mobile" }).hideOn, "mobile");
});
