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
};
const titles = {
  richText: "Texto", heading: "Título", image: "Imagem", gallery: "Galeria", youtube: "Vídeo do YouTube", quote: "Citação", list: "Lista", table: "Tabela", note: "Nota",
  columns: "Colunas", button: "Botão", infoCard: "Card de info", linkCards: "Cards de link", section: "Seção",
  todayGames: "Jogos de hoje", teamWidget: "Widget de time", standings: "Classificação", scorers: "Artilharia", newsFeed: "Feed de notícias", liveMatch: "Jogo ao vivo",
  teamTodayMatch: "Jogo de hoje", teamUpcoming: "Próximos jogos", teamResults: "Resultados", teamStanding: "Posição na tabela", teamNews: "Notícias do time", teamScorers: "Artilheiros", teamWhereToWatch: "Onde assistir", teamLineup: "Escalação", teamClusterLinks: "Links do cluster", teamAutoText: "Texto automático", teamClassic: "Página padrão do time",
};
for (const [slug, body] of Object.entries(shapes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320"><rect width="480" height="320" fill="${B}"/>${body}<rect x="0" y="284" width="480" height="36" fill="${W}"/><text x="16" y="308" font-family="Open Sans, Arial, sans-serif" font-size="16" font-weight="700" fill="${T}">${titles[slug]}</text><circle cx="456" cy="302" r="6" fill="${G}"/></svg>`;
  writeFileSync(`${OUT}/${slug}.svg`, svg);
}
console.log(`[thumbs] ${Object.keys(shapes).length} SVGs em ${OUT}`);
