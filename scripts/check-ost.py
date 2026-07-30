#!/usr/bin/env python3
"""Validate AdventureWedding RC2 OST outputs."""

from __future__ import annotations

import json
import subprocess
import wave
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


def read_wav(path: Path) -> dict:
    with wave.open(str(path), "rb") as wav:
        frames = wav.getnframes()
        rate = wav.getframerate()
        channels = wav.getnchannels()
        width = wav.getsampwidth()
        raw = wav.readframes(min(frames, rate * 20))
    silent = not raw or all(byte == 0 for byte in raw)
    return {
        "frames": frames,
        "rate": rate,
        "channels": channels,
        "width": width,
        "duration": frames / rate,
        "silent": silent,
    }


def midi_has_notes(path: Path) -> bool:
    data = path.read_bytes()
    return any((byte & 0xF0) == 0x90 for byte in data)


def afinfo_ok(path: Path) -> bool:
    try:
        subprocess.run(["afinfo", str(path)], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except Exception:
        return False


def main() -> None:
    errors: list[str] = []
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
        if mid.exists() and not midi_has_notes(mid):
            errors.append(f"{file_id}.mid has no note events")
        if ogg.exists() and not afinfo_ok(ogg):
            errors.append(f"{file_id}.ogg failed afinfo decode check")

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

    if errors:
        print("OST check failed:")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)
    print("OST check passed.")


if __name__ == "__main__":
    main()
