"""Render a printable e-ticket PNG for a booking with Pillow.

The image is generated on demand from booking data, so route, dates, passenger
names and flight numbers always match the confirmation. Layout is a boarding
pass stub with a deterministic barcode derived from the booking reference.
"""

import hashlib
import io
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from .money import cents_to_units

ASSETS = Path(__file__).resolve().parent.parent / "assets"
REGULAR = ASSETS / "DejaVuSans.ttf"
BOLD = ASSETS / "DejaVuSans-Bold.ttf"

WIDTH, HEIGHT = 1800, 820
STUB_X = 1420
NAVY = (15, 28, 63)
SKY = (14, 165, 233)
SLATE = (108, 128, 160)
LIGHT = (244, 246, 252)
INK = (23, 38, 74)
LINE = (214, 222, 239)
WHITE = (255, 255, 255)


def _font(size: int, *, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = BOLD if bold else REGULAR
    return ImageFont.truetype(str(path), size)


def _draw_centered(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
) -> None:
    box = draw.textbbox((0, 0), text, font=font)
    width = box[2] - box[0]
    draw.text((xy[0] - width / 2, xy[1]), text, font=font, fill=fill)


def _short_date(iso: str) -> str:
    return iso[:10]


def _time(iso: str) -> str:
    return iso[11:16] if len(iso) >= 16 else iso


def _code(value: str) -> str:
    return value[:3].upper()


def _seat_and_gate(reference: str, index: int = 0) -> tuple[str, str]:
    digest = hashlib.sha256(f"{reference}-{index}".encode()).digest()
    seat = f"{digest[0] % 30 + 1}{chr(65 + digest[1] % 6)}"
    gate = f"{chr(65 + digest[2] % 6)}{digest[3] % 20 + 1}"
    return seat, gate


def _barcode(draw: ImageDraw.ImageDraw, reference: str, *, x: int, y: int, width: int, height: int) -> None:
    """Draw a deterministic barcode-like pattern (visual, not a real symbology)."""
    seed = hashlib.sha256(reference.encode()).digest()
    cursor = x
    i = 0
    while cursor < x + width - 4:
        bit = (seed[i % len(seed)] >> (i % 8)) & 1
        bar_width = 3 if bit else 2
        gap = 2 if (seed[(i + 1) % len(seed)] & 1) else 3
        if bit:
            draw.rectangle(
                (cursor, y, min(cursor + bar_width, x + width), y + height),
                fill=NAVY,
            )
        cursor += bar_width + gap
        i += 1


def _draw_leg(
    draw: ImageDraw.ImageDraw,
    *,
    y: int,
    label: str,
    flight: dict,
    passenger_names: list[str],
    reference: str,
    index: int,
) -> None:
    draw.text((80, y), label.upper(), font=_font(18, bold=True), fill=SKY)

    origin = flight["from"]
    destination = flight["to"]
    seat, gate = _seat_and_gate(reference, index)

    draw.text((80, y + 32), _code(origin["code"]), font=_font(78, bold=True), fill=INK)
    draw.text((88, y + 118), origin["city"][:22], font=_font(22), fill=SLATE)
    draw.text((80, y + 156), origin["name"][:30], font=_font(16), fill=SLATE)

    _draw_centered(draw, (620, y + 52), "→", _font(56, bold=True), SKY)
    _draw_centered(draw, (620, y + 122), f"{flight['durationMinutes']} min", _font(18), SLATE)

    draw.text((1060, y + 32), _code(destination["code"]), font=_font(78, bold=True), fill=INK)
    draw.text((1068, y + 118), destination["city"][:22], font=_font(22), fill=SLATE)
    draw.text((1068, y + 156), destination["name"][:30], font=_font(16), fill=SLATE)

    draw.text((80, y + 196), f"DATE  {_short_date(flight['departureAt'])}", font=_font(20, bold=True), fill=INK)
    draw.text(
        (420, y + 196),
        f"DEPART  {_time(flight['departureAt'])}",
        font=_font(20),
        fill=INK,
    )
    draw.text(
        (700, y + 196),
        f"ARRIVE  {_time(flight['arrivalAt'])}",
        font=_font(20),
        fill=INK,
    )
    draw.text((1000, y + 196), flight["flightNumber"], font=_font(20, bold=True), fill=INK)
    draw.text((1160, y + 196), f"GATE {gate}", font=_font(20), fill=SLATE)

    names = ", ".join(passenger_names)
    if len(names) > 62:
        names = names[:59] + "..."
    draw.text((80, y + 236), f"PASSENGER  {names}", font=_font(20), fill=INK)
    draw.text((1060, y + 236), f"SEAT  {seat}", font=_font(20, bold=True), fill=INK)


def render_ticket(booking: dict) -> bytes:
    """Return a PNG boarding pass for the given booking response dict."""
    image = Image.new("RGB", (WIDTH, HEIGHT), WHITE)
    draw = ImageDraw.Draw(image)

    # Header
    draw.rectangle((0, 0, WIDTH, 104), fill=NAVY)
    draw.text((80, 30), "AEROTRIP", font=_font(36, bold=True), fill=WHITE)
    draw.text((80, 74), "E-TICKET / BOARDING PASS", font=_font(16), fill=(186, 205, 240))

    reference = booking["reference"]
    _draw_centered(draw, (STUB_X + (WIDTH - STUB_X) // 2, 26), reference, _font(38, bold=True), WHITE)
    _draw_centered(draw, (STUB_X + (WIDTH - STUB_X) // 2, 72), "BOOKING REFERENCE", _font(14), (186, 205, 240))

    passenger_names = [p["fullName"] for p in booking["passengers"]]
    legs: list[tuple[str, dict]] = [("Outbound", booking["outboundFlight"])]
    if booking.get("returnFlight"):
        legs.append(("Return", booking["returnFlight"]))

    y = 132
    for index, (label, flight) in enumerate(legs):
        _draw_leg(
            draw,
            y=y,
            label=label,
            flight=flight,
            passenger_names=passenger_names,
            reference=reference,
            index=index,
        )
        y += 300
        if index < len(legs) - 1:
            draw.line((80, y - 12, STUB_X - 48, y - 12), fill=LINE, width=2)

    # Footer note
    total = cents_to_units(round(float(booking["total"]) * 100))
    draw.text(
        (80, HEIGHT - 34),
        f"{booking['tripType'].upper()}  ·  {len(passenger_names)} TRAVELER(S)  ·  TOTAL ${total:.0f} {booking['currency']}",
        font=_font(16),
        fill=SLATE,
    )
    draw.text(
        (80, HEIGHT - 60),
        "DEMO TICKET — GENERATED FOR THIS SAMPLE BOOKING, NOT VALID FOR TRAVEL.",
        font=_font(15, bold=True),
        fill=SKY,
    )

    # Stub separator with notches
    draw.line((STUB_X, 104, STUB_X, HEIGHT), fill=LINE, width=2)
    notch_color = WHITE
    draw.ellipse((STUB_X - 14, 92, STUB_X + 14, 120), fill=notch_color, outline=LINE, width=2)
    draw.ellipse((STUB_X - 14, HEIGHT - 28, STUB_X + 14, HEIGHT), fill=notch_color, outline=LINE, width=2)

    _barcode(draw, reference, x=STUB_X + 60, y=200, width=260, height=300)
    _draw_centered(draw, (STUB_X + (WIDTH - STUB_X) // 2, 545), reference, _font(26, bold=True), INK)
    _draw_centered(draw, (STUB_X + (WIDTH - STUB_X) // 2, 590), "SCAN AT GATE", _font(15), SLATE)
    _draw_centered(draw, (STUB_X + (WIDTH - STUB_X) // 2, 640), "AEROTRIP", _font(18, bold=True), NAVY)

    output = io.BytesIO()
    image.save(output, format="PNG", optimize=True)
    return output.getvalue()


__all__ = ["render_ticket"]
