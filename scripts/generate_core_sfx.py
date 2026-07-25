#!/usr/bin/env python3
"""Generate AdventureWedding v0.9.6.4 placeholder core SFX.

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
COMPANION_PEAK = 10 ** (-6 / 20)
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "audio" / "sfx"
VOICE_OUT = OUT / "voices"


def env(index: int, total: int, attack: float = 0.01, release: float = 0.08) -> float:
    t = index / SAMPLE_RATE
    duration = total / SAMPLE_RATE
    if t < attack:
        return t / max(attack, 0.001)
    if t > duration - release:
        return max(0.0, (duration - t) / max(release, 0.001))
    return 1.0


def write_wav(name: str, samples: list[float], *, peak_target: float = PEAK, output_dir: Path = OUT) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    peak = max(0.001, max(abs(sample) for sample in samples))
    scale = peak_target / peak
    path = output_dir / name
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


def one_pole_lowpass(samples: list[float], cutoff: float) -> list[float]:
    rc = 1 / (math.tau * cutoff)
    dt = 1 / SAMPLE_RATE
    alpha = dt / (rc + dt)
    value = 0.0
    filtered = []
    for sample in samples:
        value += alpha * (sample - value)
        filtered.append(value)
    return filtered


def companion_voice(
    name: str,
    duration: float,
    syllables: list[dict[str, float]],
    seed: int,
    *,
    formants: tuple[float, float],
    brightness: float,
    texture: float,
) -> None:
    random.seed(seed)
    total = int(duration * SAMPLE_RATE)
    samples = []
    f1, f2 = formants
    for index in range(total):
        t = index / SAMPLE_RATE
        sample = 0.0
        for syllable in syllables:
            start = syllable["start"]
            length = syllable["length"]
            if t < start or t > start + length:
                continue
            local = t - start
            ratio = local / max(length, 0.001)
            carrier = syllable["pitch"] * (1 + syllable["rise"] * math.sin(ratio * math.pi))
            syllable_env = min(1.0, ratio / 0.18, (1 - ratio) / 0.24)
            syllable_env = max(0.0, syllable_env) ** 0.75
            phase = math.tau * carrier * local
            voiced = (
                math.sin(phase) * 0.55
                + math.sin(phase * 2.01) * 0.18
                + math.sin(phase * 3.02) * 0.08
            )
            mouth = (
                math.sin(math.tau * f1 * local) * 0.18
                + math.sin(math.tau * f2 * local) * 0.07
            )
            consonant = 0.0
            if local < 0.018:
                consonant = (random.random() * 2 - 1) * brightness * (1 - local / 0.018)
            breath = (random.random() * 2 - 1) * texture * syllable_env
            sample += (voiced + mouth + consonant + breath) * syllable_env
        samples.append(sample * env(index, total, 0.004, 0.035))
    samples = one_pole_lowpass(samples, 3400)
    write_wav(name, samples, peak_target=COMPANION_PEAK, output_dir=VOICE_OUT)


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
        (0.13, [{"start": 0.000, "length": 0.060, "pitch": 760, "rise": 0.015}, {"start": 0.064, "length": 0.058, "pitch": 880, "rise": -0.010}]),
        (0.15, [{"start": 0.000, "length": 0.070, "pitch": 820, "rise": 0.010}, {"start": 0.076, "length": 0.064, "pitch": 720, "rise": 0.008}]),
        (0.14, [{"start": 0.000, "length": 0.055, "pitch": 900, "rise": -0.006}, {"start": 0.062, "length": 0.066, "pitch": 790, "rise": 0.012}]),
        (0.17, [{"start": 0.000, "length": 0.075, "pitch": 700, "rise": 0.014}, {"start": 0.084, "length": 0.070, "pitch": 840, "rise": 0.006}]),
        (0.16, [{"start": 0.000, "length": 0.064, "pitch": 860, "rise": 0.008}, {"start": 0.074, "length": 0.068, "pitch": 940, "rise": -0.009}])
    ]
    dazhi_patterns = [
        (0.17, [{"start": 0.000, "length": 0.075, "pitch": 440, "rise": 0.006}, {"start": 0.084, "length": 0.070, "pitch": 392, "rise": -0.004}]),
        (0.19, [{"start": 0.000, "length": 0.080, "pitch": 415, "rise": 0.004}, {"start": 0.092, "length": 0.076, "pitch": 470, "rise": 0.006}]),
        (0.18, [{"start": 0.000, "length": 0.072, "pitch": 360, "rise": 0.006}, {"start": 0.084, "length": 0.078, "pitch": 430, "rise": -0.003}]),
        (0.21, [{"start": 0.000, "length": 0.088, "pitch": 390, "rise": 0.004}, {"start": 0.102, "length": 0.086, "pitch": 350, "rise": 0.005}]),
        (0.20, [{"start": 0.000, "length": 0.082, "pitch": 470, "rise": -0.003}, {"start": 0.096, "length": 0.080, "pitch": 410, "rise": 0.004}])
    ]
    for i, (duration, syllables) in enumerate(tuotuo_patterns, start=1):
        companion_voice(
            f"tuotuo-{i:02}.wav",
            duration,
            syllables,
            130 + i,
            formants=(950, 2200),
            brightness=0.055,
            texture=0.010
        )
    for i, (duration, syllables) in enumerate(dazhi_patterns, start=1):
        companion_voice(
            f"dazhi-{i:02}.wav",
            duration,
            syllables,
            150 + i,
            formants=(620, 1550),
            brightness=0.032,
            texture=0.014
        )

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
