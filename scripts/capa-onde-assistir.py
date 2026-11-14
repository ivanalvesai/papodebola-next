# Capa 1200x675 dos posts "onde assistir": foto de estádio escurecida ao fundo, as duas
# bandeiras em círculo (borda branca + sombra), "X" no meio, selo verde no topo e a linha
# "dia · hora · canal". Tudo entre y≈30 e y≈420: a faixa de baixo fica livre pro título
# sobreposto nos cards da home (regra da área segura da capa).
#
# Uso: python scripts/capa-onde-assistir.py --bg foto.jpg --home flagA.png --away flagB.png \
#        --home-name "Moldávia" --away-name "Cazaquistão" \
#        --info "Sexta, 13/11 · 14h · ESPN 4 e Disney+" --seal "LIGA DAS NAÇÕES · ONDE ASSISTIR" \
#        --out capa.png [--preview preview.png] [--crest]   (--crest = escudo de clube inteiro)
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


def flag_circle(path, d, crest=False):
    src = Image.open(path).convert("RGBA")
    if crest:
        # Escudo de clube: inteiro (sem corte), centralizado num círculo branco com respiro.
        flag = Image.new("RGBA", (d, d), (255, 255, 255, 255))
        c = ImageOps.contain(src, (int(d * 0.74), int(d * 0.74)), Image.LANCZOS)
        flag.alpha_composite(c, ((d - c.width) // 2, (d - c.height) // 2))
    else:
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


def paste_flag(canvas, path, cx, cy, d=220, border=8, crest=False):
    # sombra
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    r = d // 2 + border
    ImageDraw.Draw(sh).ellipse((cx - r + 6, cy - r + 12, cx + r + 6, cy + r + 12), fill=(0, 0, 0, 150))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)))
    ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 255, 255, 255))
    canvas.alpha_composite(ring)
    canvas.alpha_composite(flag_circle(path, d, crest), (cx - d // 2, cy - d // 2))


def text_center(draw, cx, y, text, f, fill, shadow=True):
    w = draw.textlength(text, font=f)
    if shadow:
        draw.text((cx - w / 2 + 2, y + 3), text, font=f, fill=(0, 0, 0, 160))
    draw.text((cx - w / 2, y), text, font=f, fill=fill)


def render_faixa(o):
    # Estilo "faixa" (desde 14/11/2026): as duas bandeiras ocupam o fundo, divididas por um corte
    # diagonal com filete branco; nomes grandes em cima; faixa verde do site atravessando em
    # leve diagonal com dia e hora; canal numa etiqueta escura embaixo. Tudo até y≈425.
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    # Recorta metade esquerda/direita da própria bandeira (cada uma centralizada no seu lado)
    lp = ImageOps.fit(Image.open(o.home).convert("RGB"), (700, H), Image.LANCZOS)
    rp = ImageOps.fit(Image.open(o.away).convert("RGB"), (700, H), Image.LANCZOS)
    left = flag_panel_img(lp)
    right = flag_panel_img(rp)
    canvas.paste(left, (0, 0))
    mask = Image.new("L", (W * 2, H * 2), 0)
    ImageDraw.Draw(mask).polygon([(1340, 0), (W * 2, 0), (W * 2, H * 2), (1060, H * 2)], fill=255)
    mask = mask.resize((W, H), Image.LANCZOS)
    rlayer = Image.new("RGBA", (W, H))
    rlayer.paste(right, (500, 0))
    canvas.paste(rlayer, (0, 0), mask)
    # filete branco no corte
    fl = Image.new("RGBA", (W * 2, H * 2), (0, 0, 0, 0))
    ImageDraw.Draw(fl).line([(1340, 0), (1060, H * 2)], fill=(255, 255, 255, 230), width=12)
    canvas.alpha_composite(fl.resize((W, H), Image.LANCZOS))
    # vinheta suave nas bordas
    vg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vg)
    for i in range(60):
        vd.rectangle((i, i, W - i, H - i), outline=(0, 0, 0, int(110 * (1 - i / 60) ** 2)))
    canvas.alpha_composite(vg)
    draw = ImageDraw.Draw(canvas)

    # Selo branco com texto verde (y 34–80)
    fs = font("OpenSans-ExtraBold.ttf", 24)
    sw = draw.textlength(o.seal, font=fs) + 52
    sx = (W - sw) / 2
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((sx + 3, 40, sx + sw + 3, 86), radius=23, fill=(0, 0, 0, 120))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)))
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((sx, 34, sx + sw, 80), radius=23, fill=(255, 255, 255))
    draw.text((sx + 26, 41), o.seal, font=fs, fill=GREEN)

    # Nomes grandes de cada lado (ajusta o corpo pra caber em ~470px)
    def big_name(cx, name):
        size = 74
        while size > 40 and draw.textlength(name, font=font("OpenSans-ExtraBold.ttf", size)) > 470:
            size -= 2
        f = font("OpenSans-ExtraBold.ttf", size)
        w = draw.textlength(name, font=f)
        y = 168 - size // 2
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(glow).text((cx - w / 2, y + 4), name, font=f, fill=(0, 0, 0, 220))
        canvas.alpha_composite(glow.filter(ImageFilter.GaussianBlur(8)))
        ImageDraw.Draw(canvas).text((cx - w / 2, y), name, font=f, fill=(255, 255, 255))

    big_name(300, o.home_name.upper())
    big_name(W - 300, o.away_name.upper())

    # "X" num disco branco sobre o corte
    cx, cy, r = 600, 178, 46
    sd = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sd).ellipse((cx - r + 3, cy - r + 8, cx + r + 3, cy + r + 8), fill=(0, 0, 0, 150))
    canvas.alpha_composite(sd.filter(ImageFilter.GaussianBlur(8)))
    draw = ImageDraw.Draw(canvas)
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 255, 255))
    fx = font("OpenSans-ExtraBold.ttf", 54)
    xw = draw.textlength("X", font=fx)
    draw.text((cx - xw / 2, cy - 40), "X", font=fx, fill=GREEN)

    # Faixa verde em diagonal (-5°) com dia e hora
    BW, BH = 1700, 118
    band = Image.new("RGBA", (BW, BH + 40), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    top = 20
    bd.rectangle((0, top, BW, top + BH), fill=GREEN + (255,))
    # listras finas de textura
    tex = Image.new("RGBA", band.size, (0, 0, 0, 0))
    td = ImageDraw.Draw(tex)
    for x in range(-BH, BW, 30):
        td.line([(x, top + BH), (x + BH, top)], fill=(255, 255, 255, 16), width=10)
    tmask = Image.new("L", band.size, 0)
    ImageDraw.Draw(tmask).rectangle((0, top, BW, top + BH), fill=255)
    band.paste(Image.alpha_composite(band, tex), (0, 0), tmask)
    bd = ImageDraw.Draw(band)
    bd.rectangle((0, top, BW, top + 6), fill=(70, 205, 145, 255))
    bd.rectangle((0, top + BH - 6, BW, top + BH), fill=(0, 105, 66, 255))
    fd = font("OpenSans-ExtraBold.ttf", 60)
    tw = bd.textlength(o.info, font=fd)
    bd.text((BW / 2 - tw / 2 + 3, top + 18 + 4), o.info, font=fd, fill=(0, 70, 44, 200))
    bd.text((BW / 2 - tw / 2, top + 18), o.info, font=fd, fill=(255, 255, 255))
    band = band.rotate(5, resample=Image.BICUBIC, expand=True)
    shadow = Image.new("RGBA", band.size, (0, 0, 0, 0))
    shadow.putalpha(band.getchannel("A").point(lambda a: int(a * 0.55)))
    bx, by = 600 - band.width // 2, 332 - band.height // 2
    sl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sl.paste(shadow, (bx + 6, by + 14), shadow)
    canvas.alpha_composite(sl.filter(ImageFilter.GaussianBlur(12)))
    bl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bl.paste(band, (bx, by), band)
    canvas.alpha_composite(bl)

    # Canal numa etiqueta escura logo abaixo da faixa, à direita (y ≈ 392–430)
    if o.channel:
        draw = ImageDraw.Draw(canvas)
        fc = font("OpenSans-Bold.ttf", 27)
        cw = draw.textlength(o.channel, font=fc) + 44
        x1 = W - 90 - cw
        draw.rounded_rectangle((x1, 396, x1 + cw, 438), radius=21, fill=(10, 18, 15, 225), outline=(255, 255, 255, 90), width=2)
        draw.text((x1 + 22, 400), o.channel, font=fc, fill=(255, 255, 255))
    return canvas


def flag_panel_img(img):
    w, h = img.size
    dark = Image.new("RGB", (w, h), (6, 12, 10))
    shade = Image.new("L", (1, h))
    for y in range(h):
        shade.putpixel((0, y), int(55 + 150 * (y / h)))
    return Image.composite(dark, img, shade.resize((w, h))).convert("RGBA")


def main():
    ap = argparse.ArgumentParser()
    for a in ("home", "away", "home-name", "away-name", "info", "out"):
        ap.add_argument(f"--{a}", required=True)
    ap.add_argument("--bg", help="foto de fundo (estilo padrão)")
    ap.add_argument("--seal", default="LIGA DAS NAÇÕES · ONDE ASSISTIR")
    ap.add_argument("--preview")
    ap.add_argument("--crest", action="store_true", help="escudos de clube (sem cortar)")
    ap.add_argument("--style", default="padrao", choices=["padrao", "faixa"],
                    help="faixa = bandeiras no fundo + faixa verde diagonal (bandeiras em alta, flagcdn)")
    ap.add_argument("--channel", help="estilo faixa: etiqueta do canal (ex.: 'AO VIVO NO SPORTV')")
    o = ap.parse_args()

    if o.style == "faixa":
        canvas = render_faixa(o)
        canvas.convert("RGB").save(o.out, "PNG", optimize=True)
        if o.preview:
            save_preview(canvas, o)
        return

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
    paste_flag(canvas, o.home, 330, cy, crest=o.crest)
    paste_flag(canvas, o.away, W - 330, cy, crest=o.crest)
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
        save_preview(canvas, o)


def save_preview(canvas, o):
    if True:
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
