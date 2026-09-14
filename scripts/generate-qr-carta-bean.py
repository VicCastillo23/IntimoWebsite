#!/usr/bin/env python3
"""QR carta Íntimo — luxury minimal, optimizado para impresión."""
from __future__ import annotations

import argparse
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont
from qrcode.constants import ERROR_CORRECT_H

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
FONTS = ROOT / "fonts"
DEFAULT_URL = "https://cafeintimo.mx/carta.html"
LOGO_PATH = IMAGES / "logo-intimo.png"

# Tipografía de marca (tickets POS): Cinzel SemiBold + Montserrat Light
FONT_BRAND = FONTS / "cinzel_semibold.ttf"
FONT_TAG = FONTS / "montserrat_light.ttf"
BRAND_TRACKING_EM = 0.14
TAG_TRACKING_EM = 0.22

# Luxury palette — imprime limpio (sin marrones sucios)
BLACK = "#000000"
CHAMPAGNE = "#D4B483"
CHAMPAGNE_MUTED = "#9A8468"
IVORY = "#F3EDE3"
IVORY_SOFT = "#E8E0D4"


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def load_font(size: int, style: str = "brand") -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    paths = {
        "brand": [FONT_BRAND, "/System/Library/Fonts/Supplemental/Didot.ttc"],
        "tag": [FONT_TAG, "/System/Library/Fonts/Supplemental/HelveticaNeueLight.ttf"],
        "sans": [
            FONT_TAG,
            "/System/Library/Fonts/Supplemental/HelveticaNeue.ttc",
            "/System/Library/Fonts/Supplemental/Helvetica.ttc",
        ],
    }
    for path in paths.get(style, paths["brand"]):
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size, index=0)
            except OSError:
                pass
    return ImageFont.load_default()


def tracking_px(font_size: int, em: float) -> int:
    """Mismo criterio que Android Paint.letterSpacing (ems)."""
    return max(0, round(font_size * em))


def draw_tracked(
    draw: ImageDraw.ImageDraw,
    xy: tuple[float, float],
    text: str,
    font: ImageFont.ImageFont,
    fill: str,
    tracking: int,
    anchor: str = "lm",
) -> None:
    """Texto con tracking (espaciado entre letras) — look editorial."""
    if anchor.endswith("m"):
        total = sum(
            draw.textbbox((0, 0), ch, font=font)[2] - draw.textbbox((0, 0), ch, font=font)[0] + tracking
            for ch in text
        ) - tracking
        x = xy[0] - total / 2 if "m" in anchor else xy[0]
        y = xy[1]
    else:
        x, y = xy

    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill, anchor="lm")
        x += draw.textbbox((0, 0), ch, font=font)[2] + tracking


def make_scannable_qr(url: str, fg: tuple[int, int, int], bg: tuple[int, int, int], box_size: int = 18) -> Image.Image:
    qr = qrcode.QRCode(version=None, error_correction=ERROR_CORRECT_H, box_size=box_size, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    return qr.make_image(fill_color=fg, back_color=bg).convert("RGBA")


def add_center_logo(qr_img: Image.Image, logo_path: Path, scale: float = 0.09) -> Image.Image:
    if not logo_path.exists():
        return qr_img
    out = qr_img.copy()
    side = int(min(out.size) * scale)
    logo = Image.open(logo_path).convert("RGBA")
    logo = logo.resize((side, side), Image.Resampling.LANCZOS)
    pad = max(8, int(side * 0.22))
    badge = Image.new("RGBA", (side + pad * 2, side + pad * 2), (0, 0, 0, 255))
    badge.paste(logo, (pad, pad), logo)
    x = (out.width - badge.width) // 2
    y = (out.height - badge.height) // 2
    out.paste(badge, (x, y), badge)
    return out


def build_qr_block(url: str, qr_side: int) -> Image.Image:
    """QR estándar (negro sobre marfil) en placa mínima — escaneable en cualquier teléfono."""
    pad = max(20, int(qr_side * 0.04))
    qr = make_scannable_qr(url, hex_rgb(BLACK), hex_rgb(IVORY), box_size=16)
    qr = qr.resize((qr_side, qr_side), Image.Resampling.NEAREST)
    qr = add_center_logo(qr, LOGO_PATH, scale=0.09)

    block = Image.new("RGBA", (qr_side + pad * 2, qr_side + pad * 2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(block)
    draw.rectangle([0, 0, block.width - 1, block.height - 1], fill=hex_rgb(IVORY))
    draw.rectangle([0, 0, block.width - 1, block.height - 1], outline=hex_rgb(CHAMPAGNE), width=1)
    block.paste(qr, (pad, pad), qr)
    return block


def build_luxury_icon(url: str, size: int = 1200) -> Image.Image:
    """Luxury minimal: negro puro, placa marfil mínima, mucho aire negativo."""
    canvas = Image.new("RGB", (size, size), hex_rgb(BLACK))
    draw = ImageDraw.Draw(canvas)

    margin = int(size * 0.09)

    draw.rectangle([margin, margin, size - margin, size - margin], outline=hex_rgb(CHAMPAGNE), width=1)

    title_y = margin + int(size * 0.07)
    title_size = int(size * 0.088)
    title_font = load_font(title_size, "brand")
    draw_tracked(
        draw,
        (size / 2, title_y),
        "ÍNTIMO",
        title_font,
        IVORY,
        tracking=tracking_px(title_size, BRAND_TRACKING_EM),
        anchor="mm",
    )

    sub_size = int(size * 0.021)
    sub_font = load_font(sub_size, "tag")
    sub_y = title_y + int(size * 0.075)
    draw_tracked(
        draw,
        (size / 2, sub_y),
        "CAFETERÍA DE ESPECIALIDAD",
        sub_font,
        IVORY,
        tracking=tracking_px(sub_size, TAG_TRACKING_EM),
        anchor="mm",
    )

    sep_y = sub_y + int(size * 0.04)
    sep_w = int(size * 0.22)
    draw.line([(size // 2 - sep_w, sep_y), (size // 2 + sep_w, sep_y)], fill=hex_rgb(CHAMPAGNE), width=1)

    qr_side = int(size * 0.52)
    block = build_qr_block(url, qr_side)
    block_x = (size - block.width) // 2
    block_y = sep_y + int(size * 0.06)
    canvas.paste(block, (block_x, block_y), block)

    foot_y = block_y + block.height + int(size * 0.06)
    foot_size = int(size * 0.024)
    foot_font = load_font(foot_size, "tag")
    draw_tracked(
        draw,
        (size / 2, foot_y),
        "MENÚ DIGITAL",
        foot_font,
        CHAMPAGNE,
        tracking=tracking_px(foot_size, TAG_TRACKING_EM),
        anchor="mm",
    )
    url_size = int(size * 0.022)
    draw.text(
        (size / 2, foot_y + int(size * 0.042)),
        "cafeintimo.mx/carta",
        font=load_font(url_size, "tag"),
        fill=IVORY_SOFT,
        anchor="mm",
    )

    return canvas


def build_luxury_poster(url: str) -> Image.Image:
    W, H = 1800, 2400
    canvas = Image.new("RGB", (W, H), hex_rgb(BLACK))
    draw = ImageDraw.Draw(canvas)
    margin = 100
    draw.rectangle([margin, margin, W - margin, H - margin], outline=hex_rgb(CHAMPAGNE), width=1)

    draw_tracked(
        draw, (W / 2, 220), "ÍNTIMO", load_font(118, "brand"), IVORY, tracking=tracking_px(118, BRAND_TRACKING_EM), anchor="mm"
    )
    draw_tracked(
        draw,
        (W / 2, 310),
        "CAFETERÍA DE ESPECIALIDAD",
        load_font(28, "tag"),
        IVORY,
        tracking=tracking_px(28, TAG_TRACKING_EM),
        anchor="mm",
    )
    draw.line([(W // 2 - 220, 360), (W // 2 + 220, 360)], fill=hex_rgb(CHAMPAGNE), width=1)
    draw_tracked(
        draw, (W / 2, 430), "ESCANEA PARA VER LA CARTA", load_font(32, "tag"), CHAMPAGNE, tracking=tracking_px(32, TAG_TRACKING_EM), anchor="mm"
    )

    qr_side = 880
    block = build_qr_block(url, qr_side)
    block_y = 500
    canvas.paste(block, ((W - block.width) // 2, block_y), block)

    draw.text((W / 2, block_y + block.height + 80), "cafeintimo.mx/carta", font=load_font(34, "tag"), fill=IVORY_SOFT, anchor="mm")
    return canvas


def verify_decode(path: Path, expected: str) -> bool:
    try:
        import cv2
        import numpy as np

        data, _, _ = cv2.QRCodeDetector().detectAndDecode(np.array(Image.open(path).convert("RGB")))
        ok = data == expected
        print(f"Verificación escaneo: {'OK' if ok else 'FALLO'} → {data!r}")
        return ok
    except Exception as e:
        print(f"Verificación omitida ({e})")
        return True


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--icon-out", type=Path, default=IMAGES / "qr-carta-grano.png")
    parser.add_argument("--poster-out", type=Path, default=IMAGES / "qr-carta-grano-poster.png")
    parser.add_argument("--icon-only", action="store_true")
    args = parser.parse_args()

    icon = build_luxury_icon(args.url, size=1800)
    args.icon_out.parent.mkdir(parents=True, exist_ok=True)
    icon.save(args.icon_out, format="PNG", optimize=True)
    print(f"Icono → {args.icon_out} ({icon.width}×{icon.height})")
    verify_decode(args.icon_out, args.url)

    if not args.icon_only:
        poster = build_luxury_poster(args.url)
        poster.save(args.poster_out, format="PNG", optimize=True)
        print(f"Poster → {args.poster_out} ({poster.width}×{poster.height})")
        verify_decode(args.poster_out, args.url)


if __name__ == "__main__":
    main()
