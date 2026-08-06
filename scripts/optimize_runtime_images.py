#!/usr/bin/env python3
"""Build optimized WebP files for AdventureWedding runtime assets."""

from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
MAX_STORY_EDGE = 1920

LOSSLESS_MAPS = (
    "assets/tokyo-story-map.png",
    "assets/maps/sydney-harbour-lookout.png",
    "assets/sydney/sydney-harbour-night.png",
    "assets/maps/coles-interior-v0.8.2.png",
    "assets/maps/longnan-lookout-pixel.png",
    "assets/maps/longnan/longnan-town.png",
    "assets/maps/wedding/xiaoyuan-wedding-map.png",
)

STORY_CGS = (
    "assets/cg/coles-piaozi-story.png",
    "assets/cg/sydney/cg-cooking-together.png",
    "assets/cg/sydney/cg-seaside-jump.png",
    "assets/cg/sydney/cg-tasmania-trip.png",
    "assets/cg/sydney/cg-blueworks.png",
    "assets/cg/sydney/cg-sydney-airport.png",
    "assets/cg/memory-album/tokyo-memory-album.png",
    "assets/cg/memory-album/tokyo-street-night.png",
    "assets/cg/memory-album/tokyo-first-selfie.png",
    "assets/cg/memory-album/tokyo-one-dian-zhang.png",
    "assets/cg/memory-album/kyoto-shaved-ice.png",
    "assets/cg/longnan/cg-kangxian-hometown.png",
    "assets/cg/longnan/cg-lele-childhood-drawing.png",
    "assets/cg/longnan/cg-piaozi-berries.png",
    "assets/cg/longnan/cg-mori-lele-longnan.png",
    "assets/cg/memory-album/tokyo-wild-fruit.png",
    "assets/cg/memory-album/longnan-piaozi.png",
    "assets/cg/memory-album/sydney-moment.png",
    "assets/cg/memory-album/wedding-portrait.png",
)

LOSSLESS_STORY = (
    "assets/cg/wedding/wedding-invitation.png",
)


def resize_story(image: Image.Image) -> Image.Image:
    width, height = image.size
    longest = max(width, height)
    if longest <= MAX_STORY_EDGE:
        return image
    scale = MAX_STORY_EDGE / longest
    size = (round(width * scale), round(height * scale))
    return image.resize(size, Image.Resampling.LANCZOS)


def convert(relative_path: str, *, lossless: bool, resize: bool) -> None:
    source = ROOT / relative_path
    destination = source.with_suffix(".webp")
    with Image.open(source) as original:
        image = resize_story(original) if resize else original.copy()
        save_options = {
            "format": "WEBP",
            "method": 6,
            "lossless": lossless,
        }
        if not lossless:
            save_options["quality"] = 90
        if original.info.get("icc_profile"):
            save_options["icc_profile"] = original.info["icc_profile"]
        image.save(destination, **save_options)

    before = source.stat().st_size
    after = destination.stat().st_size
    with Image.open(destination) as optimized:
        dimensions = f"{optimized.width}x{optimized.height}"
    saving = 100 * (before - after) / before
    print(f"{relative_path}: {dimensions}, {before} -> {after} bytes ({saving:.1f}% smaller)")


def main() -> None:
    for path in LOSSLESS_MAPS:
        convert(path, lossless=True, resize=False)
    for path in STORY_CGS:
        convert(path, lossless=False, resize=True)
    for path in LOSSLESS_STORY:
        convert(path, lossless=True, resize=True)


if __name__ == "__main__":
    main()
