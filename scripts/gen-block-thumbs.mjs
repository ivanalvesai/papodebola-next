// Gera public/cms-blocks/{slug}.svg (480x320, 3:2) pra galeria de blocos do /cms.
// Wireframes simples: fundo claro, título do bloco, e formas que sugerem o layout.
import { mkdirSync, writeFileSync } from "node:fs";
const OUT = "public/cms-blocks";
mkdirSync(OUT, { recursive: true });
const G = "#00965E", B = "#F2F3F5", T = "#1F2937", M = "#9CA3AF", W = "#FFFFFF";
const rect = (x, y, w, h, f = M, r = 6) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}"/>`;
const lines = (x, y, w, n, gap = 18, f = M) => Array.from({ length: n }, (_, i) => rect(x, y + i * gap, i === n - 1 ? w * 0.6 : w, 8, f, 4)).join("");
const card = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${W}" stroke="#E5E7EB"/>`;
const shapes = {
  richText: lines(40, 90, 400, 8),
  heading: rect(40, 130, 300, 26, T) + lines(40, 180, 400, 3),
  image: rect(60, 70, 360, 190, "#D1D5DB", 12) + `<circle cx="150" cy="140" r="22" fill="${W}"/>`,
  gallery: [0,1,2,3,4,5].map(i => rect(40 + (i % 3) * 140, 70 + Math.floor(i / 3) * 110, 120, 95, "#D1D5DB", 10)).join(""),
  youtube: rect(60, 70, 360, 200, "#111827", 12) + `<polygon points="220,130 220,210 290,170" fill="${W}"/>`,
  quote: rect(40, 90, 6, 140, G, 3) + lines(64, 95, 360, 5),
  list: [0,1,2,3].map(i => `<circle cx="52" cy="${100 + i * 40}" r="5" fill="${G}"/>` + rect(70, 95 + i * 40, 330 - i * 40, 10, M, 4)).join(""),
  table: [0,1,2,3,4].map(i => rect(40, 80 + i * 40, 400, 30, i === 0 ? "#D1D5DB" : W, 4)).join("") ,
  note: rect(40, 230, 400, 10, M, 4) + rect(40, 250, 260, 10, M, 4),
  columns: [0,1,2].map(i => card(40 + i * 140, 80, 120, 170) + lines(52 + i * 140, 100, 96, 5, 16)).join(""),
  button: rect(150, 130, 180, 56, G, 12) + rect(190, 152, 100, 12, W, 4),
  infoCard: card(60, 100, 360, 120) + rect(80, 120, 160, 12, T, 4) + rect(80, 150, 260, 12, M, 4),
  linkCards: [0,1,2,3,4,5].map(i => card(40 + (i % 3) * 140, 80 + Math.floor(i / 3) * 90, 120, 70) + rect(52 + (i % 3) * 140, 105 + Math.floor(i / 3) * 90, 80, 10, G, 4)).join(""),
  section: rect(20, 60, 440, 220, "#E5E7EB", 14) + card(40, 90, 200, 160) + card(260, 90, 180, 160) + lines(52, 110, 170, 4) + lines(272, 110, 150, 4),
  todayGames: [0,1,2].map(i => card(40 + i * 140, 110, 120, 90) + `<circle cx="${70 + i * 140}" cy="140" r="12" fill="#D1D5DB"/><circle cx="${130 + i * 140}" cy="140" r="12" fill="#D1D5DB"/>` + rect(85 + i * 140, 170, 30, 10, G, 4)).join(""),
  teamWidget: card(60, 70, 360, 200) + `<circle cx="120" cy="130" r="28" fill="#D1D5DB"/>` + rect(170, 110, 200, 14, T, 4) + rect(170, 140, 140, 10, M, 4) + rect(80, 200, 320, 40, B, 8),
  standings: [0,1,2,3,4,5].map(i => rect(40, 80 + i * 32, 400, 24, i === 0 ? "#D1D5DB" : W, 4) + (i ? `<circle cx="70" cy="${92 + i * 32}" r="8" fill="${i < 3 ? G : "#D1D5DB"}"/>` : "")).join(""),
  scorers: [0,1,2,3].map(i => `<circle cx="70" cy="${100 + i * 46}" r="16" fill="#D1D5DB"/>` + rect(100, 94 + i * 46, 220, 12, T, 4) + rect(380, 94 + i * 46, 40, 12, G, 4)).join(""),
  newsFeed: [0,1,2].map(i => card(40 + i * 140, 70, 120, 190) + rect(40 + i * 140, 70, 120, 90, "#D1D5DB", 10) + lines(52 + i * 140, 175, 96, 3, 16)).join(""),
  liveMatch: card(60, 70, 360, 200) + `<circle cx="140" cy="150" r="30" fill="#D1D5DB"/><circle cx="340" cy="150" r="30" fill="#D1D5DB"/>` + rect(210, 130, 60, 40, T, 8) + rect(200, 210, 80, 18, "#E8312A", 9),
  teamTodayMatch: card(60, 70, 360, 200) + `<circle cx="140" cy="150" r="30" fill="#D1D5DB"/><circle cx="340" cy="150" r="30" fill="#D1D5DB"/>` + rect(215, 140, 50, 24, T, 6),
  teamUpcoming: [0,1,2,3].map(i => rect(40, 80 + i * 46, 400, 36, W, 6) + rect(60, 92 + i * 46, 120, 10, T, 4) + rect(300, 92 + i * 46, 120, 10, M, 4)).join(""),
  teamResults: [0,1,2,3].map(i => rect(40, 80 + i * 46, 400, 36, W, 6) + rect(60, 92 + i * 46, 100, 10, T, 4) + rect(220, 90 + i * 46, 40, 14, G, 4) + rect(320, 92 + i * 46, 100, 10, T, 4)).join(""),
  teamStanding: card(60, 70, 360, 200) + rect(90, 110, 90, 60, G, 8) + lines(220, 110, 160, 4, 22),
  teamNews: [0,1,2,3].map(i => rect(40, 80 + i * 48, 400, 12, T, 4) + rect(40, 100 + i * 48, 120, 8, M, 4)).join(""),
  teamScorers: [0,1,2,3,4,5].map(i => card(40 + (i % 3) * 140, 80 + Math.floor(i / 3) * 100, 120, 80) + `<circle cx="${70 + (i % 3) * 140}" cy="${120 + Math.floor(i / 3) * 100}" r="16" fill="#D1D5DB"/>`).join(""),
  teamWhereToWatch: card(60, 70, 360, 200) + [0,1,2].map(i => rect(90, 110 + i * 44, 300, 28, B, 6)).join(""),
  teamLineup: rect(60, 60, 360, 220, "#1F8A4C", 12) + [0,1,2,3,4,5,6,7,8,9,10].map(i => `<circle cx="${120 + (i % 4) * 80}" cy="${100 + Math.floor(i / 4) * 60}" r="12" fill="${W}"/>`).join(""),
  teamClusterLinks: [0,1,2,3,4].map(i => rect(40 + i * 82, 140, 70, 40, i ? W : G, 8)).join(""),
  teamAutoText: lines(40, 90, 400, 7),
  teamClassic: rect(20, 50, 440, 240, "#E5E7EB", 14) + card(40, 70, 200, 100) + card(260, 70, 180, 100) + card(40, 190, 400, 80),
  // ── blocos ricos (estilo Elementor) ──
  hero: rect(30, 50, 420, 220, T, 14) + rect(120, 100, 240, 22, W, 6) + rect(150, 136, 180, 10, M, 4) + rect(140, 180, 90, 34, G, 10) + `<rect x="250" y="180" width="90" height="34" rx="10" fill="none" stroke="${W}" stroke-width="2"/>`,
  cards: [0,1,2].map(i => card(40 + i * 140, 70, 120, 190) + rect(40 + i * 140, 70, 120, 80, "#D1D5DB", 10) + rect(52 + i * 140, 165, 90, 12, T, 4) + lines(52 + i * 140, 190, 96, 2, 16) + rect(52 + i * 140, 232, 50, 8, G, 4)).join(""),
  cta: rect(30, 90, 420, 140, G, 14) + rect(110, 120, 260, 20, W, 6) + rect(150, 152, 180, 10, "#D1FAE5", 4) + rect(185, 180, 110, 32, W, 10),
  faq: [0,1,2,3].map(i => rect(40, 76 + i * 50, 400, 40, W, 8) + rect(58, 92 + i * 50, 240 - i * 20, 10, T, 4) + `<polyline points="${410},${92 + i * 50} ${418},${100 + i * 50} ${426},${92 + i * 50}" fill="none" stroke="${G}" stroke-width="3"/>`).join(""),
  testimonials: [0,1].map(i => card(40 + i * 210, 80, 190, 170) + `<text x="${56 + i * 210}" y="122" font-family="Georgia, serif" font-size="40" fill="${G}">“</text>` + lines(56 + i * 210, 130, 150, 3, 16) + `<circle cx="${72 + i * 210}" cy="${222}" r="14" fill="#D1D5DB"/>` + rect(94 + i * 210, 216, 80, 10, T, 4)).join(""),
  stats: [0,1,2].map(i => card(40 + i * 140, 90, 120, 130) + `<text x="${100 + i * 140}" y="160" text-anchor="middle" font-family="Open Sans, Arial, sans-serif" font-size="34" font-weight="800" fill="${G}">${["1.2k", "98%", "57"][i]}</text>` + rect(60 + i * 140, 182, 80, 10, M, 4)).join(""),
  mediaText: rect(40, 70, 190, 190, "#D1D5DB", 12) + `<circle cx="100" cy="130" r="18" fill="${W}"/>` + rect(255, 90, 180, 18, T, 6) + lines(255, 130, 185, 5) + rect(255, 230, 90, 26, G, 8),
  iconList: [0,1,2,3].map(i => `<circle cx="64" cy="${100 + i * 44}" r="13" fill="${G}"/><polyline points="57,${100 + i * 44} 62,${105 + i * 44} 71,${95 + i * 44}" fill="none" stroke="${W}" stroke-width="3"/>` + rect(90, 95 + i * 44, 300 - i * 30, 10, M, 4)).join(""),
  tabs: [0,1,2].map(i => rect(40 + i * 110, 70, 100, 34, i ? "#E5E7EB" : G, 8)).join("") + card(40, 110, 400, 150) + lines(60, 135, 360, 5),
  divider: rect(40, 100, 400, 10, M, 4) + rect(40, 160, 400, 3, G, 2) + rect(40, 210, 260, 10, M, 4),
  carousel: [0,1,2].map(i => rect(60 + i * 125, 90, 110, 140, i === 1 ? "#9CA3AF" : "#D1D5DB", 10)).join("") + `<circle cx="44" cy="160" r="16" fill="${W}"/><polyline points="48,152 40,160 48,168" fill="none" stroke="${T}" stroke-width="3"/><circle cx="436" cy="160" r="16" fill="${W}"/><polyline points="432,152 440,160 432,168" fill="none" stroke="${T}" stroke-width="3"/>`,
  buttons: rect(50, 140, 120, 42, G, 10) + `<rect x="185" y="140" width="120" height="42" rx="10" fill="none" stroke="${G}" stroke-width="3"/>` + rect(320, 140, 120, 42, W, 10),
  social: [0,1,2,3,4].map(i => `<circle cx="${100 + i * 70}" cy="160" r="26" fill="${[G, T, "#E8312A", "#3B82F6", "#25D366"][i]}"/><circle cx="${100 + i * 70}" cy="160" r="9" fill="none" stroke="${W}" stroke-width="3"/>`).join(""),
  people: [0,1,2].map(i => card(40 + i * 140, 70, 120, 190) + `<circle cx="${100 + i * 140}" cy="125" r="32" fill="#D1D5DB"/>` + rect(62 + i * 140, 172, 76, 12, T, 4) + rect(72 + i * 140, 194, 56, 8, M, 4) + lines(56 + i * 140, 216, 88, 2, 14)).join(""),
  timeline: rect(98, 70, 4, 200, "#D1D5DB", 2) + [0,1,2,3].map(i => `<circle cx="100" cy="${86 + i * 56}" r="10" fill="${G}"/>` + rect(124, 80 + i * 56, 60, 10, T, 4) + rect(200, 80 + i * 56, 220 - i * 30, 10, M, 4)).join(""),
  instagram: card(110, 60, 260, 215) + `<circle cx="138" cy="86" r="14" fill="#E1306C"/>` + rect(162, 80, 100, 10, T, 4) + rect(124, 110, 232, 130, "#D1D5DB", 6) + rect(124, 250, 140, 8, M, 4),
  xPost: card(80, 70, 320, 190) + `<circle cx="112" cy="104" r="18" fill="${T}"/>` + rect(140, 94, 120, 10, T, 4) + rect(140, 110, 80, 8, M, 4) + lines(100, 140, 280, 4) + `<text x="360" y="112" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="${T}">X</text>`,
  embed: card(60, 70, 360, 200) + `<text x="240" y="190" text-anchor="middle" font-family="Consolas, monospace" font-size="64" font-weight="700" fill="${G}">&lt;/&gt;</text>`,
  formBlock: card(80, 60, 320, 215) + [0,1,2].map(i => rect(100, 76 + i * 50, 80, 8, T, 4) + `<rect x="100" y="${90 + i * 50}" width="280" height="26" rx="6" fill="${W}" stroke="#D1D5DB" stroke-width="2"/>`).join("") + rect(100, 236, 110, 30, G, 8),
  countdown: [0,1,2,3].map(i => rect(60 + i * 95, 100, 80, 90, T, 10) + `<text x="${100 + i * 95}" y="160" text-anchor="middle" font-family="Open Sans, Arial, sans-serif" font-size="36" font-weight="800" fill="${W}">${["02", "14", "35", "08"][i]}</text>` + rect(80 + i * 95, 204, 40, 8, M, 4)).join(""),
  snippet: card(90, 80, 300, 170) + lines(120, 150, 240, 4) + `<path d="M 330 60 L 330 120 a 18 18 0 0 1 -36 0 L 294 76 a 10 10 0 0 1 20 0 L 314 116" fill="none" stroke="${G}" stroke-width="6" stroke-linecap="round"/>`,
};
const titles = {
  richText: "Texto", heading: "Título", image: "Imagem", gallery: "Galeria", youtube: "Vídeo (YouTube/Vimeo)", quote: "Citação", list: "Lista", table: "Tabela", note: "Nota",
  columns: "Colunas", button: "Botão", infoCard: "Card de info", linkCards: "Cards de link", section: "Seção",
  todayGames: "Jogos de hoje", teamWidget: "Widget de time", standings: "Classificação", scorers: "Artilharia", newsFeed: "Feed de notícias", liveMatch: "Jogo ao vivo",
  teamTodayMatch: "Jogo de hoje", teamUpcoming: "Próximos jogos", teamResults: "Resultados", teamStanding: "Posição na tabela", teamNews: "Notícias do time", teamScorers: "Artilheiros", teamWhereToWatch: "Onde assistir", teamLineup: "Escalação", teamClusterLinks: "Links do cluster", teamAutoText: "Texto automático", teamClassic: "Página padrão do time",
  hero: "Destaque (hero)", cards: "Cards", cta: "Chamada (CTA)", faq: "Perguntas frequentes", testimonials: "Depoimentos", stats: "Números", mediaText: "Imagem + texto",
  iconList: "Lista com ícones", tabs: "Abas", divider: "Divisor / espaço", carousel: "Carrossel de imagens", buttons: "Botões", social: "Redes sociais", people: "Pessoas / equipe",
  timeline: "Linha do tempo", instagram: "Post do Instagram", xPost: "Post do X", embed: "HTML personalizado", formBlock: "Formulário", countdown: "Contagem regressiva", snippet: "Trecho reutilizável",
};
for (const [slug, body] of Object.entries(shapes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320"><rect width="480" height="320" fill="${B}"/>${body}<rect x="0" y="284" width="480" height="36" fill="${W}"/><text x="16" y="308" font-family="Open Sans, Arial, sans-serif" font-size="16" font-weight="700" fill="${T}">${titles[slug]}</text><circle cx="456" cy="302" r="6" fill="${G}"/></svg>`;
  writeFileSync(`${OUT}/${slug}.svg`, svg);
}
console.log(`[thumbs] ${Object.keys(shapes).length} SVGs em ${OUT}`);
