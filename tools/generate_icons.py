from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "site" / "icons"


def font(size: int, bold: bool = False):
    names = ["C:/Windows/Fonts/seguisb.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()


def create_icon(size: int):
    image = Image.new("RGB", (size, size), "#07111f")
    draw = ImageDraw.Draw(image)
    margin = int(size * 0.12)
    radius = int(size * 0.18)
    draw.rounded_rectangle((margin, margin, size - margin, size - margin), radius=radius, fill="#0e2236", outline="#38bdf8", width=max(3, size // 80))
    draw.text((size / 2, size * 0.39), "ICT", anchor="mm", font=font(int(size * 0.13), True), fill="#91ddff")
    draw.text((size / 2, size * 0.58), "600", anchor="mm", font=font(int(size * 0.23), True), fill="#e8f2ff")
    line = max(5, size // 45)
    points = [(size * 0.34, size * 0.72), (size * 0.45, size * 0.81), (size * 0.68, size * 0.64)]
    draw.line(points, fill="#34d399", width=line, joint="curve")
    for point in points:
        draw.ellipse((point[0] - line / 2, point[1] - line / 2, point[0] + line / 2, point[1] + line / 2), fill="#34d399")
    image.save(OUTPUT / f"icon-{size}.png", optimize=True)


if __name__ == "__main__":
    OUTPUT.mkdir(parents=True, exist_ok=True)
    create_icon(192)
    create_icon(512)
