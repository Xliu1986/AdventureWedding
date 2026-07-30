#!/usr/bin/env python3
"""Validate AdventureWedding RC2.1 OST outputs."""

from __future__ import annotations

import json
import subprocess
import wave
from array import array
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "audio" / "bgm"

EXPECTED = {
    "adventurewedding-main": {"min": 140, "loop": True},
    "tokyo-spring": {"min": 160, "loop": True},
    "sydney-together": {"min": 180, "loop": True},
    "longnan-homecoming": {"min": 180, "loop": True},
    "xiaoyuan-wedding": {"min": 170, "loop": True},
    "tokyo-to-forever": {"min": 220, "loop": False},
}

MAX_OGG_TOTAL_BYTES = 24 * 1024 * 1024
MAX_PEAK_RATIO = 0.999
MIN_PEAK_RATIO = 0.02


def read_wav(path: Path) -> dict:
    with wave.open(str(path), "rb") as wav:
        frames = wav.getnframes()
        rate = wav.getframerate()
        channels = wav.getnchannels()
        width = wav.getsampwidth()
        peak = 0
        silent = True
        while True:
            raw = wav.readframes(rate)
            if not raw:
                break
            if any(byte != 0 for byte in raw):
                silent = False
            if width == 2:
                samples = array("h")
                samples.frombytes(raw)
                if samples:
                    peak = max(peak, max(abs(sample) for sample in samples))
            elif width == 3:
                for index in range(0, len(raw) - 2, 3):
                    sample = int.from_bytes(raw[index:index + 3], "little", signed=True)
                    peak = max(peak, abs(sample))
    full_scale = float((1 << (width * 8 - 1)) - 1) if width in (2, 3) else 1.0
    return {
        "frames": frames,
        "rate": rate,
        "channels": channels,
        "width": width,
        "duration": frames / rate,
        "silent": silent,
        "peak": peak / full_scale,
    }


def midi_has_notes(path: Path) -> bool:
    data = path.read_bytes()
    return any((byte & 0xF0) == 0x90 for byte in data)


def ogg_decode_ok(path: Path) -> bool:
    ffmpeg = ROOT / "node_modules" / ".pnpm" / "ffmpeg-static@5.3.0" / "node_modules" / "ffmpeg-static" / "ffmpeg"
    if ffmpeg.exists():
        try:
            subprocess.run(
                [str(ffmpeg), "-v", "error", "-i", str(path), "-f", "null", "-"],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            return True
        except Exception:
            return False
    try:
        subprocess.run(["afinfo", str(path)], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except Exception:
        return False


def main() -> None:
    errors: list[str] = []
    registry_path = ROOT / "audio" / "audio-registry.js"
    registry_text = registry_path.read_text(encoding="utf-8") if registry_path.exists() else ""
    if not registry_text:
        errors.append("missing audio/audio-registry.js")

    loop_path = OUT / "loop-metadata.json"
    if not loop_path.exists():
        errors.append("missing loop-metadata.json")
        loop_meta = {}
    else:
        loop_meta = json.loads(loop_path.read_text(encoding="utf-8"))

    for file_id, expected in EXPECTED.items():
        wav = OUT / f"{file_id}.wav"
        ogg = OUT / f"{file_id}.ogg"
        mid = OUT / f"{file_id}.mid"
        for path in [wav, ogg, mid]:
            if not path.exists():
                errors.append(f"missing {path.relative_to(ROOT)}")
        if wav.exists():
            info = read_wav(wav)
            if info["rate"] != 48_000:
                errors.append(f"{file_id}.wav sample rate is {info['rate']}, expected 48000")
            if info["channels"] != 2:
                errors.append(f"{file_id}.wav is not stereo")
            if info["width"] not in (2, 3):
                errors.append(f"{file_id}.wav is not 16/24-bit PCM")
            if info["duration"] < expected["min"]:
                errors.append(f"{file_id}.wav too short: {info['duration']:.3f}s")
            if info["silent"]:
                errors.append(f"{file_id}.wav appears silent")
            if info["peak"] >= MAX_PEAK_RATIO:
                errors.append(f"{file_id}.wav may be clipping: peak {info['peak']:.4f}")
            if info["peak"] <= MIN_PEAK_RATIO:
                errors.append(f"{file_id}.wav peak too low: {info['peak']:.4f}")
        if mid.exists() and not midi_has_notes(mid):
            errors.append(f"{file_id}.mid has no note events")
        if ogg.exists() and not ogg_decode_ok(ogg):
            errors.append(f"{file_id}.ogg failed decode check")
        if registry_text and f"{file_id}.ogg" not in registry_text:
            errors.append(f"{file_id}.ogg is not referenced by audio/audio-registry.js")

        meta = loop_meta.get(file_id)
        if not meta:
            errors.append(f"missing loop metadata for {file_id}")
        else:
            if bool(meta.get("loop")) != expected["loop"]:
                errors.append(f"{file_id} loop flag mismatch")
            if expected["loop"]:
                start = meta.get("loopStartSeconds")
                end = meta.get("loopEndSeconds")
                if start is None or end is None or end <= start:
                    errors.append(f"{file_id} invalid loop boundaries")
            elif "loopStartSeconds" in meta or "loopEndSeconds" in meta:
                errors.append(f"{file_id} should not have loop boundaries")

    for extra in [OUT / "OST_NOTES.md", ROOT / "assets" / "audio" / "OST_LICENSES.md"]:
        if not extra.exists():
            errors.append(f"missing {extra.relative_to(ROOT)}")

    total_ogg_bytes = sum((OUT / f"{file_id}.ogg").stat().st_size for file_id in EXPECTED if (OUT / f"{file_id}.ogg").exists())
    if total_ogg_bytes > MAX_OGG_TOTAL_BYTES:
        errors.append(f"OGG total size too large: {total_ogg_bytes / (1024 * 1024):.2f} MB")

    if errors:
        print("OST check failed:")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)
    print("OST check passed.")


if __name__ == "__main__":
    main()
