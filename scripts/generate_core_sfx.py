#!/usr/bin/env python3
"""Generate AdventureWedding v0.9.6.2 placeholder core SFX.

These are tiny original synthesized WAVs: warm, low-tech, and intentionally
easy to replace when final recorded assets arrive.
"""

from __future__ import annotations

import math
import random
import wave
from pathlib import Path

SAMPLE_RATE = 44100
PEAK = 10 ** (-3 / 20)
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "audio" / "sfx"


def env(index: int, total: int, attack: float = 0.01, release: float = 0.08) -> float:
    t = index / SAMPLE_RATE
    duration = total / SAMPLE_RATE
    if t < attack:
        return t / max(attack, 0.001)
    if t > duration - release:
        return max(0.0, (duration - t) / max(release, 0.001))
    return 1.0


def write_wav(name: str, samples: list[float]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    peak = max(0.001, max(abs(sample) for sample in samples))
    scale = PEAK / peak
    path = OUT / name
    with wave.open(str(path), "w") as file:
        file.setnchannels(1)
        file.setsampwidth(2)
        file.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for sample in samples:
            value = int(max(-1.0, min(1.0, sample * scale)) * 32767)
            frames.extend(value.to_bytes(2, "little", signed=True))
        file.writeframes(frames)


def tone(
    name: str,
    duration: float,
    freqs: list[float],
    *,
    attack: float = 0.008,
    release: float = 0.08,
    decay: float = 3.0,
    tremble: float = 0.0,
    noise: float = 0.0,
    seed: int = 1,
) -> None:
    random.seed(seed)
    total = int(duration * SAMPLE_RATE)
    samples: list[float] = []
    phases = [random.random() * math.tau for _ in freqs]
    for index in range(total):
        t = index / SAMPLE_RATE
        body = 0.0
        for harmonic, freq in enumerate(freqs):
            wobble = math.sin(t * math.tau * 5.2 + harmonic) * tremble
            body += math.sin((freq + wobble) * math.tau * t + phases[harmonic]) / (harmonic + 1)
        body *= math.exp(-decay * t) * env(index, total, attack, release)
        if noise:
            body += (random.random() * 2 - 1) * noise * env(index, total, attack, release) * math.exp(-decay * 0.8 * t)
        samples.append(body)
    write_wav(name, samples)


def wood(name: str, duration: float, pitch: float, seed: int) -> None:
    random.seed(seed)
    total = int(duration * SAMPLE_RATE)
    samples = []
    for index in range(total):
        t = index / SAMPLE_RATE
        click = (random.random() * 2 - 1) * math.exp(-42 * t)
        body = math.sin(pitch * math.tau * t) * math.exp(-18 * t)
        low = math.sin(pitch * 0.5 * math.tau * t) * math.exp(-10 * t)
        samples.append((click * 0.9 + body * 0.55 + low * 0.35) * env(index, total, 0.002, duration * 0.55))
    write_wav(name, samples)


def paper(name: str, duration: float, seed: int, fold: bool = False) -> None:
    random.seed(seed)
    total = int(duration * SAMPLE_RATE)
    samples = []
    for index in range(total):
        t = index / SAMPLE_RATE
        sweep = math.sin((400 + t * (900 if not fold else -240)) * math.tau * t) * 0.08
        grain = (random.random() * 2 - 1) * (0.55 + 0.45 * math.sin(t * math.tau * 18))
        samples.append((grain * 0.55 + sweep) * env(index, total, 0.006, duration * 0.45) * math.exp(-2.3 * t))
    write_wav(name, samples)


def companion_voice(name: str, duration: float, notes: list[float], seed: int, *, brightness: float) -> None:
    random.seed(seed)
    total = int(duration * SAMPLE_RATE)
    samples = []
    phases = [random.random() * math.tau for _ in notes]
    for index in range(total):
        t = index / SAMPLE_RATE
        body = 0.0
        for note_index, note in enumerate(notes):
            start = note_index * duration / max(1, len(notes) + 1)
            if t < start:
                continue
            local = t - start
            chirp = note + math.sin(local * math.tau * 18) * brightness
            body += math.sin(chirp * math.tau * local + phases[note_index]) * math.exp(-10.5 * local)
            body += 0.18 * math.sin(chirp * 2.02 * math.tau * local + phases[note_index]) * math.exp(-14 * local)
        bead = (random.random() * 2 - 1) * 0.018 * math.exp(-18 * t)
        samples.append((body + bead) * env(index, total, 0.006, 0.045))
    write_wav(name, samples)


def shimmer(name: str, duration: float, seed: int) -> None:
    random.seed(seed)
    total = int(duration * SAMPLE_RATE)
    notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
    samples = []
    for index in range(total):
        t = index / SAMPLE_RATE
        body = 0.0
        for note_index, note in enumerate(notes):
            start = note_index * duration / (len(notes) + 1)
            if t >= start:
                local = t - start
                body += math.sin(note * math.tau * local) * math.exp(-2.0 * local) * 0.28
        samples.append(body * env(index, total, 0.01, 0.22))
    write_wav(name, samples)


def noise_gesture(name: str, duration: float, seed: int, colour: str) -> None:
    random.seed(seed)
    total = int(duration * SAMPLE_RATE)
    last = 0.0
    samples = []
    for index in range(total):
        t = index / SAMPLE_RATE
        raw = random.random() * 2 - 1
        if colour == "wind":
            last = last * 0.96 + raw * 0.04
            sample = last * 0.9
        elif colour == "water":
            last = last * 0.72 + raw * 0.28
            sample = last * 0.65 + math.sin(260 * math.tau * t) * math.exp(-12 * t) * 0.1
        elif colour == "vinyl":
            sample = raw * 0.035
            if random.random() < 0.018:
                sample += (random.random() * 2 - 1) * 0.9
        else:
            sample = raw * 0.5
        samples.append(sample * env(index, total, 0.01, 0.12))
    write_wav(name, samples)


def main() -> None:
    tone("press-start.wav", 0.30, [659.25, 987.77, 1318.5], decay=5.5, noise=0.025, seed=10)
    wood("ui-move.wav", 0.045, 520, 11)
    tone("ui-confirm.wav", 0.12, [783.99, 1174.66], decay=7.2, seed=12)
    wood("ui-back.wav", 0.08, 260, 13)
    paper("menu-open.wav", 0.15, 14)
    paper("menu-close.wav", 0.12, 15, fold=True)
    tone("dialogue-next.wav", 0.09, [587.33, 880.0], decay=8.4, seed=17)
    wood("mori-voice.wav", 0.08, 210, 18)
    tone("lele-voice.wav", 0.09, [880.0, 1320.0], decay=9.0, seed=19)

    tuotuo_patterns = [
        (0.12, [1046.5, 1318.5]),
        (0.14, [987.77, 1174.66, 1396.91]),
        (0.13, [1174.66, 1567.98]),
        (0.16, [880.0, 1046.5, 1318.5]),
        (0.15, [1318.5, 1174.66])
    ]
    dazhi_patterns = [
        (0.16, [392.0, 493.88]),
        (0.18, [349.23, 440.0, 392.0]),
        (0.17, [440.0, 523.25]),
        (0.20, [329.63, 392.0]),
        (0.19, [392.0, 349.23, 440.0])
    ]
    for i, (duration, notes) in enumerate(tuotuo_patterns, start=1):
        companion_voice(f"tuotuo-voice-{i}.wav", duration, notes, 30 + i, brightness=9)
    for i, (duration, notes) in enumerate(dazhi_patterns, start=1):
        companion_voice(f"dazhi-voice-{i}.wav", duration, notes, 40 + i, brightness=5)

    wood("interaction.wav", 0.10, 360, 50)
    wood("object-inspect.wav", 0.10, 360, 51)
    tone("npc-interaction.wav", 0.12, [698.46, 1046.5], decay=7.0, seed=52)
    shimmer("memory-unlock.wav", 0.62, 53)
    shimmer("chapter-complete.wav", 1.50, 54)
    paper("album-open.wav", 0.22, 55)
    paper("album-close.wav", 0.18, 56, fold=True)
    paper("album-page.wav", 0.16, 57)
    wood("photo-added.wav", 0.12, 300, 58)
    tone("cg-fade-in.wav", 0.22, [1046.5, 1567.98], decay=7.5, seed=59)
    noise_gesture("cg-fade-out.wav", 0.28, 60, "wind")
    wood("door-wood.wav", 0.20, 135, 61)
    wood("bridge-creak.wav", 0.24, 100, 62)
    noise_gesture("flower-rustle.wav", 0.20, 63, "leaf")
    tone("shrine-wind-bell.wav", 0.42, [987.77, 1480.0], decay=4.8, tremble=1.5, seed=64)
    noise_gesture("river-touch.wav", 0.22, 65, "water")
    noise_gesture("blueworks-vinyl.wav", 0.55, 66, "vinyl")


if __name__ == "__main__":
    main()
