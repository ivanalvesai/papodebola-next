// Gera GIF (e WebP animado) de um banner HTML com animações CSS.
// Congela todas as animações em cada instante (document.getAnimations → currentTime),
// tira o print do frame e monta com ffmpeg (paleta otimizada).
//
// Uso:
//   node scripts/banners/render-anim.mjs <arquivo.html?query> <saida-sem-extensao> <largura> <altura> [duracaoMs=3000] [fps=15] [escala=0.5]
// O HTML é desenhado em 2x (ex.: 2400×600) e o frame sai reduzido pela escala (1200×300).
// Requer: puppeteer-core (CHROMIUM_PATH ou Chrome padrão do Windows) e ffmpeg no PATH.
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const [src, out, W, H, durArg, fpsArg, scaleArg] = process.argv.slice(2);
if (!src || !out || !W || !H) {
  console.error("uso: render-anim.mjs <html?query> <saida> <w> <h> [durMs] [fps] [escala]");
  process.exit(1);
}
const w = +W, h = +H, dur = +(durArg || 3000), fps = +(fpsArg || 15), scale = +(scaleArg || 0.5);

// puppeteer-core pode estar fora do projeto (PUPPETEER_DIR aponta pro node_modules dele).
const req = createRequire(process.env.PUPPETEER_DIR ? join(process.env.PUPPETEER_DIR, "x.js") : import.meta.url);
const puppeteer = req("puppeteer-core");

const [file, query] = src.split("?");
const url = pathToFileURL(resolve(file)).href + (query ? `?${query}` : "");
const executablePath = process.env.CHROMIUM_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox", "--font-render-hinting=none"] });
const dir = await mkdtemp(join(tmpdir(), "banner-"));
try {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: scale });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  const frames = Math.round((dur / 1000) * fps);
  for (let i = 0; i < frames; i++) {
    const t = (i * 1000) / fps;
    await page.evaluate((t) => {
      for (const a of document.getAnimations()) { a.pause(); a.currentTime = t; }
    }, t);
    await page.screenshot({ path: join(dir, `f${String(i).padStart(4, "0")}.png`), clip: { x: 0, y: 0, width: w, height: h } });
  }
  const ow = Math.round(w * scale), oh = Math.round(h * scale);
  const input = ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", join(dir, "f%04d.png")];
  execFileSync("ffmpeg", [...input, "-vf",
    `scale=${ow}:${oh}:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a`,
    "-loop", "0", `${out}.gif`]);
  execFileSync("ffmpeg", [...input, "-vf", `scale=${ow}:${oh}:flags=lanczos`, "-c:v", "libwebp_anim", "-lossless", "0", "-q:v", "82", "-loop", "0", `${out}.webp`]);
  // primeiro frame também em PNG (prévia estática / fallback)
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", join(dir, "f0000.png"), "-vf", `scale=${ow}:${oh}:flags=lanczos`, `${out}.png`]);
  for (const ext of ["gif", "webp"]) console.log(`${out}.${ext}  ${((await stat(`${out}.${ext}`)).size / 1024).toFixed(0)} KB  ${ow}x${oh}  ${frames} frames`);
} finally {
  await browser.close();
  await rm(dir, { recursive: true, force: true });
}
