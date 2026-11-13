# Capa 1200x675 dos posts "onde assistir": foto de estádio escurecida ao fundo, as duas
# bandeiras em círculo (borda branca + sombra), "X" no meio, selo verde no topo e a linha
# "dia · hora · canal". Tudo entre y≈30 e y≈420: a faixa de baixo fica livre pro título
# sobreposto nos cards da home (regra da área segura da capa).
#
# Uso: python scripts/capa-onde-assistir.py --bg foto.jpg --home flagA.png --away flagB.png \
#        --home-name "Moldávia" --away-name "Cazaquistão" \
#        --info "Sexta, 13/11 · 14h · ESPN 4 e Disney+" --seal "LIGA DAS NAÇÕES · ONDE ASSISTIR" \
#        --out capa.png [--preview preview.png]
# As bandeiras vêm do volume (/app/data/team-images/{id}.png).
import argparse
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

W, H = 1200, 675
GREEN = (0, 150, 94)
FONTS = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "Windows", "Fonts")


def font(name, size):
    for base in (FONTS, r"C:\Windows\Fonts", "/usr/share/fonts/truetype/open-sans"):
        p = os.path.join(base, name)
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.truetype("arialbd.ttf", size)


def background(path):
    img = Image.open(path).convert("RGB")
    img = ImageOps.fit(img, (W, H), Image.LANCZOS)
    img = img.filter(ImageFilter.GaussianBlur(3))
    # Escurece com gradiente: mais escuro em cima e embaixo, um pouco de luz no meio.
    shade = Image.new("L", (1, H))
    for y in range(H):
        t = y / H
        a = 150 + int(70 * abs(t - 0.45) * 2)
        shade.putpixel((0, y), min(a, 235))
    shade = shade.resize((W, H))
    dark = Image.new("RGB", (W, H), (8, 14, 12))
    return Image.composite(dark, img, shade)


def flag_circle(path, d):
    src = Image.open(path).convert("RGBA")
    # Bandeira preenche o círculo (crop central); fundo branco atrás de PNG com transparência.
    base = Image.new("RGBA", src.size, (255, 255, 255, 255))
    base.alpha_composite(src)
    flag = ImageOps.fit(base, (d, d), Image.LANCZOS)
    mask = Image.new("L", (d * 4, d * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, d * 4, d * 4), fill=255)
    mask = mask.resize((d, d), Image.LANCZOS)
    out = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    out.paste(flag, (0, 0), mask)
    return out


def paste_flag(canvas, path, cx, cy, d=220, border=8):
    # sombra
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    r = d // 2 + border
    ImageDraw.Draw(sh).ellipse((cx - r + 6, cy - r + 12, cx + r + 6, cy + r + 12), fill=(0, 0, 0, 150))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)))
    ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 255, 255, 255))
    canvas.alpha_composite(ring)
    canvas.alpha_composite(flag_circle(path, d), (cx - d // 2, cy - d // 2))


def text_center(draw, cx, y, text, f, fill, shadow=True):
    w = draw.textlength(text, font=f)
    if shadow:
        draw.text((cx - w / 2 + 2, y + 3), text, font=f, fill=(0, 0, 0, 160))
    draw.text((cx - w / 2, y), text, font=f, fill=fill)


def main():
    ap = argparse.ArgumentParser()
    for a in ("bg", "home", "away", "home-name", "away-name", "info", "out"):
        ap.add_argument(f"--{a}", required=True)
    ap.add_argument("--seal", default="LIGA DAS NAÇÕES · ONDE ASSISTIR")
    ap.add_argument("--preview")
    o = ap.parse_args()

    canvas = background(o.bg).convert("RGBA")
    draw = ImageDraw.Draw(canvas)

    # Selo verde no topo (y 40–88)
    fs = font("OpenSans-ExtraBold.ttf", 26)
    sw = draw.textlength(o.seal, font=fs) + 56
    sx = (W - sw) / 2
    draw.rounded_rectangle((sx, 40, sx + sw, 88), radius=24, fill=GREEN + (255,))
    draw.text((sx + 28, 47), o.seal, font=fs, fill=(255, 255, 255))

    # Bandeiras (centro y=215, raio 118 → 97..333)
    cy = 215
    paste_flag(canvas, o.home, 330, cy)
    paste_flag(canvas, o.away, W - 330, cy)
    draw = ImageDraw.Draw(canvas)
    text_center(draw, W / 2, cy - 62, "X", font("OpenSans-ExtraBold.ttf", 96), (255, 255, 255))

    # Nomes (y≈342)
    fn = font("OpenSans-ExtraBold.ttf", 34)
    text_center(draw, 330, 336, o.home_name.upper(), fn, (255, 255, 255))
    text_center(draw, W - 330, 336, o.away_name.upper(), fn, (255, 255, 255))

    # Linha de data/hora/canal numa faixa escura (y 392–434)
    fi = font("OpenSans-Bold.ttf", 28)
    iw = draw.textlength(o.info, font=fi) + 48
    pill = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(pill).rounded_rectangle(((W - iw) / 2, 392, (W + iw) / 2, 434), radius=21, fill=(0, 0, 0, 150))
    canvas.alpha_composite(pill)
    draw = ImageDraw.Draw(canvas)
    text_center(draw, W / 2, 395, o.info, fi, (255, 255, 255), shadow=False)

    canvas.convert("RGB").save(o.out, "PNG", optimize=True)

    if o.preview:
        # Simula o card da home: gradiente escuro embaixo + título sobreposto.
        pv = canvas.copy()
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        g = ImageDraw.Draw(ov)
        for y in range(int(H * 0.6), H):
            g.line([(0, y), (W, y)], fill=(0, 0, 0, int(230 * (y - H * 0.6) / (H * 0.4))))
        pv.alpha_composite(ov)
        d2 = ImageDraw.Draw(pv)
        d2.text((40, H - 150), f"{o.home_name} x {o.away_name}: onde assistir,", font=font("OpenSans-Bold.ttf", 46), fill=(255, 255, 255))
        d2.text((40, H - 90), "horário e escalações", font=font("OpenSans-Bold.ttf", 46), fill=(255, 255, 255))
        pv.convert("RGB").save(o.preview, "PNG")


if __name__ == "__main__":
    main()
