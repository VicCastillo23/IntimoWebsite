#!/usr/bin/env python3
"""Genera QR de carta digital con branding Íntimo (PNG listo para imprimir)."""
from __future__ import annotations

import argparse
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont
from qrcode.constants import ERROR_CORRECT_H

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
DEFAULT_URL = "https://cafeintimo.mx/carta.html"
LOGO_PATH = IMAGES / "logo-intimo.png"

# Paleta Íntimo (styles.css / carta-digital.css)
INK = "#0a0a0a"
CREAM = "#f5f5f5"
MUTED = "#525252"


def load_font(size: int, serif: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = (
        [
            "/System/Library/Fonts/Supplemental/Georgia.ttf",
            "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
            "/Library/Fonts/Georgia.ttf",
        ]
        if serif
        else [
            "/System/Library/Fonts/Supplemental/Helvetica.ttc",
            "/System/Library/Fonts/Helvetica.ttc",
            "/System/Library/Fonts/SFNSText.ttf",
        ]
    )
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size, index=0)
            except OSError:
                continue
    return ImageFont.load_default()


def make_qr_matrix(url: str, box_size: int = 24, border: int = 4) -> Image.Image:
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=box_size,
        border=border,
    )
    qr.add_data(url)
    qr.make(fit=True)
    return qr.make_image(fill_color=INK, back_color=CREAM).convert("RGBA")


def paste_centered(base: Image.Image, overlay: Image.Image, top: int) -> None:
    x = (base.width - overlay.width) // 2
    base.paste(overlay, (x, top), overlay if overlay.mode == "RGBA" else None)


def build_poster(url: str, variant: str = "light") -> Image.Image:
    is_dark = variant == "dark"
    bg_color = INK if is_dark else CREAM
    fg_color = CREAM if is_dark else INK
    sub_color = "rgba(255,255,255,0.72)" if is_dark else MUTED

    W, H = 1800, 2200
    canvas = Image.new("RGB", (W, H), bg_color)
    draw = ImageDraw.Draw(canvas)

    frame = 72
    draw.rounded_rectangle(
        [frame, frame, W - frame, H - frame],
        radius=36,
        outline=fg_color,
        width=3,
    )

    title_font = load_font(92, serif=True)
    sub_font = load_font(38, serif=False)
    url_font = load_font(30, serif=False)
    foot_font = load_font(28, serif=False)

    title = "Íntimo"
    subtitle = "Escanea la carta"
    hint = "Menú digital · cafeintimo.mx"

    draw.text((W // 2, 150), title, font=title_font, fill=fg_color, anchor="mm")
    draw.text((W // 2, 248), subtitle, font=sub_font, fill=sub_color if not is_dark else "#d4d4d4", anchor="mm")

    qr = make_qr_matrix(url)
    qr_size = 1180
    qr = qr.resize((qr_size, qr_size), Image.Resampling.NEAREST)
    qr_top = 310
    paste_centered(canvas, qr, qr_top)

    if LOGO_PATH.exists():
        logo = Image.open(LOGO_PATH).convert("RGBA")
        logo_side = 168
        logo = logo.resize((logo_side, logo_side), Image.Resampling.LANCZOS)
        pad = 28
        badge = Image.new("RGBA", (logo_side + pad * 2, logo_side + pad * 2), (0, 0, 0, 0))
        badge_draw = ImageDraw.Draw(badge)
        badge_fill = INK if is_dark else CREAM
        badge_draw.rounded_rectangle(
            [0, 0, badge.width, badge.height],
            radius=28,
            fill=badge_fill,
            outline=fg_color,
            width=2,
        )
        badge.paste(logo, (pad, pad), logo)
        bx = (W - badge.width) // 2
        by = qr_top + (qr_size - badge.height) // 2
        canvas.paste(badge, (bx, by), badge)

    url_y = qr_top + qr_size + 56
    draw.text((W // 2, url_y), url.replace("https://", ""), font=url_font, fill=sub_color if not is_dark else "#a3a3a3", anchor="mm")
    draw.text((W // 2, H - 120), hint, font=foot_font, fill=sub_color if not is_dark else "#737373", anchor="mm")

    return canvas


def main() -> None:
    parser = argparse.ArgumentParser(description="QR carta Íntimo")
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--out", type=Path, default=IMAGES / "qr-carta-intimo.png")
    parser.add_argument("--dark", action="store_true", help="Variante fondo oscuro")
    args = parser.parse_args()

    variant = "dark" if args.dark else "light"
    poster = build_poster(args.url, variant=variant)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    poster.save(args.out, format="PNG", optimize=True)
    print(f"OK → {args.out} ({poster.width}×{poster.height})")


if __name__ == "__main__":
    main()
