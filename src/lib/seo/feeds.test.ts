import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRss, buildNewsSitemap } from "./feeds.ts";

const site = { title: "Papo de Bola", url: "https://www.papodebola.com.br", description: "Futebol" };

test("rss escapa XML e lista itens", () => {
  const xml = buildRss([{ title: "Fla & Flu <hoje>", url: "https://www.papodebola.com.br/a", date: "2026-10-25T12:00:00Z" }], site);
  assert.match(xml, /<rss version="2.0"/);
  assert.match(xml, /Fla &amp; Flu &lt;hoje&gt;/);
  assert.match(xml, /<pubDate>Sun, 25 Oct 2026 12:00:00 GMT<\/pubDate>/);
});

test("rss vazio continua válido", () => {
  assert.match(buildRss([], site), /<channel>[\s\S]*<\/channel>/);
});

test("rss ignora data inválida em vez de quebrar", () => {
  const xml = buildRss([{ title: "x", url: "https://x/a", date: "lixo" }], site);
  assert.doesNotMatch(xml, /Invalid Date/);
});

test("news sitemap só com as últimas 48h", () => {
  const now = Date.parse("2026-10-25T12:00:00Z");
  const xml = buildNewsSitemap([
    { title: "novo", url: "https://x/novo", date: "2026-10-25T08:00:00Z" },
    { title: "velho", url: "https://x/velho", date: "2026-10-20T08:00:00Z" },
  ], now, "Papo de Bola");
  assert.match(xml, /https:\/\/x\/novo/);
  assert.doesNotMatch(xml, /velho/);
  assert.match(xml, /<news:language>pt<\/news:language>/);
});
