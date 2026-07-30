#!/usr/bin/env python3
"""Generate AdventureWedding RC2 original soundtrack.

The renderer is deliberately self-contained: every timbre is synthesized in
code from original additive / plucked / filtered-noise tones. No external
samples or SoundFonts are used.
"""

from __future__ import annotations

import json
import math
import shutil
import struct
import subprocess
import wave
from dataclasses import dataclass
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "audio" / "bgm"
SR = 48_000
TPQ = 480
MOTIF = [67, 71, 76, 74]  # G4, B4, E5, D5 — original four-note AdventureWedding cell.


@dataclass(frozen=True)
class Note:
    instrument: str
    start: float
    duration: float
    pitch: int
    velocity: float = 0.75
    pan: float = 0.5


@dataclass(frozen=True)
class TrackSpec:
    file_id: str
    title: str
    tempo: int
    key: str
    bars: int
    loop: bool
    arrangement: str
    min_seconds: float

    @property
    def seconds(self) -> float:
        return self.bars * 4 * 60 / self.tempo


TRACKS = [
    TrackSpec("adventurewedding-main", "AdventureWedding Main Theme", 72, "G major", 44, True, "main", 140),
    TrackSpec("tokyo-spring", "Tokyo Spring", 88, "G major", 64, True, "tokyo", 160),
    TrackSpec("sydney-together", "Sydney Together", 80, "G major / E minor colour", 68, True, "sydney", 180),
    TrackSpec("longnan-homecoming", "Longnan Homecoming", 68, "G major / E minor", 56, True, "longnan", 180),
    TrackSpec("xiaoyuan-wedding", "Xiaoyuan Wedding", 72, "G major with D major lift", 54, True, "wedding", 170),
    TrackSpec("tokyo-to-forever", "Tokyo to Forever", 72, "G major journey suite", 76, False, "credits", 220),
]


CHORDS_G = {
    "G": [55, 59, 62, 67],
    "C": [48, 55, 60, 64],
    "D": [50, 57, 62, 66],
    "Em": [52, 55, 59, 64],
    "Am": [45, 52, 57, 60],
    "Bm": [47, 54, 59, 62],
    "A": [45, 52, 57, 61],
}


PROGRESSIONS = {
    "main": ["G", "D", "Em", "C", "G", "C", "D", "G"],
    "tokyo": ["G", "C", "D", "G", "Em", "C", "Am", "D"],
    "sydney": ["G", "Em", "C", "D", "G", "Bm", "C", "D"],
    "longnan": ["Em", "C", "G", "D", "Em", "C", "Am", "D"],
    "wedding": ["G", "C", "D", "G", "Em", "C", "A", "D"],
    "credits": ["G", "D", "Em", "C", "G", "Bm", "C", "D"],
}


def freq(midi: int) -> float:
    return 440.0 * (2 ** ((midi - 69) / 12))


def envelope(n: int, attack: float, decay: float, sustain: float, release: float) -> np.ndarray:
    if n <= 0:
        return np.zeros(0, dtype=np.float32)
    a = min(n, int(attack * SR))
    r = min(max(0, n - a), int(release * SR))
    body = max(0, n - a - r)
    env = np.empty(n, dtype=np.float32)
    if a:
        env[:a] = np.linspace(0, 1, a, endpoint=False)
    if body:
        if decay > 0:
            curve = sustain + (1 - sustain) * np.exp(-np.linspace(0, body / SR, body) / decay)
        else:
            curve = np.full(body, sustain)
        env[a:a + body] = curve
    if r:
        start = env[a + body - 1] if a + body > 0 else sustain
        env[a + body:] = np.linspace(start, 0, r)
    return env


def lowpass_noise(n: int, seed: int, cutoff: float = 0.08) -> np.ndarray:
    rng = np.random.default_rng(seed)
    noise = rng.normal(0, 1, n).astype(np.float32)
    # Gentle one-pole smoothing creates brush / felt texture.
    out = np.empty_like(noise)
    acc = 0.0
    for i, sample in enumerate(noise):
        acc += cutoff * (sample - acc)
        out[i] = acc
    return out


def synth_note(instrument: str, midi: int, seconds: float, velocity: float, seed: int = 0) -> np.ndarray:
    n = max(1, int(seconds * SR))
    t = np.arange(n, dtype=np.float32) / SR
    f = freq(midi)
    if instrument == "piano":
        tone = (
            0.80 * np.sin(2 * np.pi * f * t)
            + 0.28 * np.sin(2 * np.pi * f * 2.01 * t)
            + 0.13 * np.sin(2 * np.pi * f * 3.0 * t)
            + 0.06 * np.sin(2 * np.pi * f * 4.03 * t)
        )
        env = envelope(n, 0.012, 1.6, 0.18, 0.55)
        hammer = lowpass_noise(min(n, int(0.025 * SR)), seed, 0.22)
        tone[: len(hammer)] += 0.035 * hammer
    elif instrument == "guitar":
        tone = (
            0.68 * np.sin(2 * np.pi * f * t)
            + 0.18 * np.sin(2 * np.pi * f * 2.0 * t + 0.3)
            + 0.09 * np.sin(2 * np.pi * f * 3.0 * t + 0.8)
        )
        env = envelope(n, 0.006, 0.75, 0.04, 0.38)
        pluck = lowpass_noise(min(n, int(0.018 * SR)), seed + 7, 0.34)
        tone[: len(pluck)] += 0.055 * pluck
    elif instrument == "glock":
        tone = (
            0.88 * np.sin(2 * np.pi * f * t)
            + 0.28 * np.sin(2 * np.pi * f * 2.72 * t)
            + 0.16 * np.sin(2 * np.pi * f * 4.18 * t)
        )
        env = envelope(n, 0.004, 1.9, 0.02, 1.1)
    elif instrument == "strings":
        vib = 1 + 0.0025 * np.sin(2 * np.pi * 5.2 * t)
        tone = (
            0.54 * np.sin(2 * np.pi * f * vib * t)
            + 0.24 * np.sin(2 * np.pi * f * 2 * vib * t)
            + 0.09 * np.sin(2 * np.pi * f * 3 * vib * t)
        )
        env = envelope(n, 0.42, 1.8, 0.72, 0.72)
    elif instrument == "rhodes":
        mod = 0.18 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 1.9)
        tone = 0.72 * np.sin(2 * np.pi * f * t + mod) + 0.18 * np.sin(2 * np.pi * f * 1.5 * t)
        env = envelope(n, 0.025, 1.4, 0.28, 0.75)
    elif instrument == "bass":
        tone = 0.75 * np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * f * 2 * t)
        env = envelope(n, 0.018, 0.7, 0.55, 0.22)
    elif instrument == "brush":
        tone = lowpass_noise(n, seed, 0.045)
        env = envelope(n, 0.006, 0.09, 0.0, 0.05)
    else:
        tone = np.sin(2 * np.pi * f * t)
        env = envelope(n, 0.02, 0.7, 0.2, 0.2)
    return (tone * env * velocity).astype(np.float32)


def add_note(audio: np.ndarray, note: Note, seed: int) -> None:
    start = int(note.start * SR)
    if start >= audio.shape[0]:
        return
    samples = synth_note(note.instrument, note.pitch, note.duration, note.velocity, seed)
    end = min(audio.shape[0], start + len(samples))
    samples = samples[: end - start]
    pan = max(0.0, min(1.0, note.pan))
    left = math.cos(pan * math.pi / 2)
    right = math.sin(pan * math.pi / 2)
    audio[start:end, 0] += samples * left
    audio[start:end, 1] += samples * right


def beat_seconds(tempo: int) -> float:
    return 60.0 / tempo


def add_chord(events: list[Note], instrument: str, chord: str, beat: float, dur: float, vel: float, pan: float = 0.5, spread: float = 0.0) -> None:
    for i, pitch in enumerate(CHORDS_G[chord]):
        events.append(Note(instrument, beat, dur, pitch + (12 if i > 1 else 0), vel, pan + spread * (i - 1.5)))


def add_motif(events: list[Note], instrument: str, beat: float, dur_unit: float, transpose: int, vel: float, pan: float = 0.5, rhythm: tuple[float, ...] = (1, 1, 1, 1)) -> None:
    cursor = beat
    for idx, pitch in enumerate(MOTIF):
        d = dur_unit * rhythm[idx]
        events.append(Note(instrument, cursor, d * 0.94, pitch + transpose, vel, pan))
        cursor += d


def arrange(spec: TrackSpec) -> list[Note]:
    events: list[Note] = []
    prog = PROGRESSIONS[spec.arrangement]
    total_bars = spec.bars
    # Shared harmonic bed.
    for bar in range(total_bars):
        chord = prog[bar % len(prog)]
        b = bar * 4
        if spec.arrangement == "sydney":
            add_chord(events, "rhodes", chord, b, 3.8, 0.25, 0.5, 0.04)
            for step in [0, 1.5, 2.5, 3.25]:
                events.append(Note("guitar", b + step, 0.55, CHORDS_G[chord][step != 0] + 12, 0.18, 0.42))
            events.append(Note("bass", b, 1.6, CHORDS_G[chord][0] - 12, 0.22, 0.5))
            events.append(Note("brush", b + 1, 0.16, 42, 0.045, 0.38))
            events.append(Note("brush", b + 3, 0.16, 42, 0.038, 0.62))
        elif spec.arrangement == "longnan":
            add_chord(events, "piano", chord, b, 3.6, 0.18, 0.48, 0.02)
            if bar % 2 == 0:
                events.append(Note("guitar", b + 2.0, 1.4, CHORDS_G[chord][0] + 12, 0.15, 0.56))
            events.append(Note("bass", b, 2.4, CHORDS_G[chord][0] - 12, 0.14, 0.5))
        elif spec.arrangement == "wedding":
            add_chord(events, "piano", chord, b, 3.7, 0.22, 0.48, 0.03)
            if bar >= 12:
                add_chord(events, "strings", chord, b, 3.9, 0.18 + min(0.12, bar / total_bars * 0.12), 0.52, 0.06)
            if bar % 2 == 0:
                events.append(Note("guitar", b + 1.5, 1.0, CHORDS_G[chord][2] + 12, 0.12, 0.4))
        elif spec.arrangement == "tokyo":
            add_chord(events, "piano", chord, b, 3.4, 0.17, 0.48, 0.03)
            if bar % 2 == 1:
                add_chord(events, "strings", chord, b, 3.6, 0.08, 0.57, 0.08)
            events.append(Note("bass", b, 1.5, CHORDS_G[chord][0] - 12, 0.11, 0.5))
        elif spec.arrangement == "credits":
            if bar < 12:
                add_chord(events, "piano", chord, b, 3.8, 0.20, 0.48, 0.02)
            elif bar < 28:
                add_chord(events, "piano", chord, b, 3.5, 0.18, 0.47, 0.03)
                add_chord(events, "strings", chord, b, 3.8, 0.11, 0.58, 0.06)
                events.append(Note("glock", b + 2.5, 0.8, CHORDS_G[chord][2] + 24, 0.12, 0.62))
            elif bar < 44:
                add_chord(events, "rhodes", chord, b, 3.8, 0.22, 0.52, 0.04)
                for step in [0, 1.5, 2.5, 3.25]:
                    events.append(Note("guitar", b + step, 0.55, CHORDS_G[chord][1] + 12, 0.13, 0.42))
                events.append(Note("bass", b, 1.8, CHORDS_G[chord][0] - 12, 0.16, 0.5))
            elif bar < 60:
                add_chord(events, "strings", chord, b, 3.9, 0.24, 0.53, 0.06)
                add_chord(events, "piano", chord, b + 1.0, 2.8, 0.16, 0.45, 0.03)
            else:
                add_chord(events, "piano", chord, b, 3.9, 0.18, 0.5, 0.02)
        else:  # main
            if bar < 4:
                continue
            add_chord(events, "piano", chord, b, 3.7, 0.21, 0.48, 0.03)
            if bar >= 12:
                add_chord(events, "strings", chord, b, 3.8, 0.11 + min(0.10, bar / total_bars * 0.10), 0.56, 0.05)
            if bar >= 20 and bar % 2 == 0:
                events.append(Note("guitar", b + 2.0, 1.1, CHORDS_G[chord][2] + 12, 0.13, 0.42))

    # Melodic identity and variations.
    if spec.arrangement == "main":
        add_motif(events, "glock", 0, 1.0, 12, 0.32, 0.58)
        for b in [4, 12, 28, 36]:
            add_motif(events, "piano", b, 1.0, 0, 0.36, 0.48)
            add_motif(events, "piano", b + 4, 1.0, 2, 0.30, 0.52)
        add_motif(events, "strings", 32, 1.4, 0, 0.20, 0.55, (1, 1, 1.5, 0.5))
    elif spec.arrangement == "tokyo":
        for b in range(0, total_bars * 4, 16):
            add_motif(events, "piano", b, 0.75, 12, 0.28, 0.48, (0.75, 0.75, 1.0, 1.5))
            add_motif(events, "glock", b + 4, 0.5, 24, 0.18, 0.62)
        for b in range(8, total_bars * 4, 16):
            add_motif(events, "piano", b, 0.75, 7, 0.22, 0.47)
    elif spec.arrangement == "sydney":
        for b in range(0, total_bars * 4, 16):
            add_motif(events, "guitar", b + 2, 0.8, 0, 0.20, 0.43, (1, 0.5, 1, 1.5))
            add_motif(events, "piano", b + 8, 0.75, 12, 0.18, 0.58, (0.5, 1, 0.5, 2))
    elif spec.arrangement == "longnan":
        for b in range(4, total_bars * 4, 24):
            add_motif(events, "piano", b, 1.45, -12, 0.25, 0.48, (1, 1, 1.25, 0.75))
            add_motif(events, "strings", b + 8, 1.6, -12, 0.14, 0.56)
    elif spec.arrangement == "wedding":
        for b in range(0, total_bars * 4, 16):
            add_motif(events, "piano", b, 1.0, 0 if b < 96 else 2, 0.25, 0.48)
            if b >= 48:
                add_motif(events, "strings", b + 4, 1.0, 0 if b < 96 else 2, 0.17, 0.58)
            if b >= 96:
                add_motif(events, "glock", b + 8, 0.75, 14, 0.13, 0.61)
    elif spec.arrangement == "credits":
        sections = [(0, "piano", 0), (16, "glock", 12), (32, "guitar", 0), (48, "strings", -12), (60, "piano", 2), (68, "piano", 0)]
        for bar, inst, tr in sections:
            add_motif(events, inst, bar * 4, 1.1 if inst != "glock" else 0.7, tr, 0.26 if inst != "strings" else 0.18, 0.5)
            add_motif(events, inst, bar * 4 + 8, 1.1 if inst != "glock" else 0.7, tr + 7, 0.20, 0.52)
        add_motif(events, "glock", (total_bars - 4) * 4, 1.0, 12, 0.14, 0.55)
    return events


def render(spec: TrackSpec, events: list[Note]) -> np.ndarray:
    duration = spec.seconds
    audio = np.zeros((int(duration * SR), 2), dtype=np.float32)
    beat = beat_seconds(spec.tempo)
    for idx, event in enumerate(events):
        add_note(
            audio,
            Note(event.instrument, event.start * beat, event.duration * beat, event.pitch, event.velocity, event.pan),
            idx + spec.tempo,
        )
    # Gentle safety shaping and conservative peak normalization.
    audio = np.tanh(audio * 0.9)
    peak = float(np.max(np.abs(audio))) or 1.0
    audio *= min(0.70 / peak, 1.0)
    # Very short fade avoids file-edge clicks. Looping tracks use harmonic closure and near-identical boundaries.
    fade = int(0.012 * SR)
    ramp = np.linspace(0, 1, fade, dtype=np.float32)
    audio[:fade] *= ramp[:, None]
    if not spec.loop:
        end_fade = int(2.4 * SR)
        audio[-end_fade:] *= np.linspace(1, 0, end_fade, dtype=np.float32)[:, None]
    return audio


def write_wav24(path: Path, audio: np.ndarray) -> None:
    clipped = np.clip(audio, -0.999999, 0.999999)
    ints = (clipped * 8_388_607).astype(np.int32)
    raw = bytearray()
    for sample in ints.reshape(-1):
        if sample < 0:
            sample += 1 << 24
        raw.extend(struct.pack("<I", int(sample))[:3])
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(3)
        wav.setframerate(SR)
        wav.writeframes(raw)


def vlq(value: int) -> bytes:
    stack = [value & 0x7F]
    value >>= 7
    while value:
        stack.append((value & 0x7F) | 0x80)
        value >>= 7
    return bytes(reversed(stack))


def midi_event(delta: int, data: bytes) -> bytes:
    return vlq(delta) + data


def write_midi(path: Path, spec: TrackSpec, events: list[Note]) -> None:
    channels = {
        "piano": 0,
        "guitar": 1,
        "glock": 2,
        "strings": 3,
        "rhodes": 4,
        "bass": 5,
        "brush": 9,
    }
    programs = {
        "piano": 0,
        "guitar": 24,
        "glock": 9,
        "strings": 48,
        "rhodes": 4,
        "bass": 32,
        "brush": 0,
    }
    tracks: list[bytes] = []
    meta = bytearray()
    tempo_us = int(60_000_000 / spec.tempo)
    meta += midi_event(0, b"\xff\x03" + bytes([len(spec.title)]) + spec.title.encode())
    meta += midi_event(0, b"\xff\x51\x03" + tempo_us.to_bytes(3, "big"))
    meta += midi_event(0, b"\xff\x58\x04\x04\x02\x18\x08")
    meta += midi_event(0, b"\xff\x2f\x00")
    tracks.append(bytes(meta))

    for inst, ch in channels.items():
        inst_events = [e for e in events if e.instrument == inst]
        if not inst_events:
            continue
        stream: list[tuple[int, bytes]] = []
        name = inst.title().encode()
        stream.append((0, b"\xff\x03" + bytes([len(name)]) + name))
        if ch != 9:
            stream.append((0, bytes([0xC0 | ch, programs[inst]])))
        for e in inst_events:
            start = int(round(e.start * TPQ))
            end = int(round((e.start + e.duration) * TPQ))
            vel = max(1, min(127, int(e.velocity * 110)))
            pitch = 42 if inst == "brush" else max(0, min(127, e.pitch))
            stream.append((start, bytes([0x90 | ch, pitch, vel])))
            stream.append((end, bytes([0x80 | ch, pitch, 0])))
        stream.sort(key=lambda item: (item[0], item[1][0] & 0xF0))
        data = bytearray()
        last = 0
        for tick, payload in stream:
            data += midi_event(max(0, tick - last), payload)
            last = tick
        data += midi_event(0, b"\xff\x2f\x00")
        tracks.append(bytes(data))

    header = b"MThd" + struct.pack(">IHHH", 6, 1, len(tracks), TPQ)
    body = b"".join(b"MTrk" + struct.pack(">I", len(track)) + track for track in tracks)
    path.write_bytes(header + body)


def convert_ogg(wav_path: Path, ogg_path: Path) -> tuple[bool, str]:
    ffmpeg = ROOT / "node_modules" / ".pnpm" / "ffmpeg-static@5.3.0" / "node_modules" / "ffmpeg-static" / "ffmpeg"
    if ffmpeg.exists():
        cmd = [
            str(ffmpeg),
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(wav_path),
            "-ar",
            "48000",
            "-ac",
            "2",
            "-c:a",
            "libvorbis",
            "-q:a",
            "5",
            str(ogg_path),
        ]
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if ogg_path.exists() and ogg_path.stat().st_size > 1024:
                return True, "ffmpeg-static libvorbis"
        except subprocess.CalledProcessError:
            pass

    afconvert = shutil.which("afconvert")
    if not afconvert:
        return False, "afconvert unavailable"
    attempts = [
        [afconvert, "-f", "Oggf", "-d", "vorb", str(wav_path), str(ogg_path)],
        [afconvert, "-f", "Oggf", "-d", "opus", str(wav_path), str(ogg_path)],
    ]
    for cmd in attempts:
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if ogg_path.exists() and ogg_path.stat().st_size > 1024:
                return True, " ".join(cmd[:5])
        except subprocess.CalledProcessError:
            continue
    return False, "afconvert Ogg encode failed"


def file_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as wav:
        return wav.getnframes() / wav.getframerate()


def write_docs(metadata: dict[str, dict]) -> None:
    (ROOT / "assets" / "audio").mkdir(parents=True, exist_ok=True)
    notes = [
        "# AdventureWedding Original Soundtrack — RC2",
        "",
        "All six tracks are original compositions generated by `scripts/generate-ost.py`.",
        "The shared four-note leitmotif is G–B–E–D, varied per chapter.",
        "",
        "| ID | Title | Key | Tempo | Duration | Loop |",
        "| --- | --- | --- | ---: | ---: | --- |",
    ]
    for spec in TRACKS:
        item = metadata[spec.file_id]
        notes.append(
            f"| `{spec.file_id}` | {spec.title} | {spec.key} | {spec.tempo} BPM | "
            f"{item['durationSeconds']:.3f}s | {'yes' if spec.loop else 'no'} |"
        )
    notes += [
        "",
        "Rendering method: original Python additive synthesis, plucked envelopes, soft filtered-noise brush percussion, and 24-bit stereo WAV export at 48 kHz. OGG files are encoded with macOS `afconvert` when available.",
        "",
        "No external samples, SoundFonts, copyrighted melodies, or third-party musical recordings are used.",
    ]
    (OUT / "OST_NOTES.md").write_text("\n".join(notes) + "\n", encoding="utf-8")
    (ROOT / "assets" / "audio" / "OST_LICENSES.md").write_text(
        "# AdventureWedding OST Licenses\n\n"
        "RC2 soundtrack source: original programmatic synthesis generated in this repository.\n\n"
        "- External SoundFonts: none\n"
        "- External samples: none\n"
        "- Third-party musical recordings: none\n"
        "- Python dependency: NumPy, used only for numerical synthesis and file rendering\n\n"
        "All melodies, arrangements, and synthesized timbres were created for AdventureWedding.\n",
        encoding="utf-8",
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    loop_metadata: dict[str, dict] = {}
    render_report: dict[str, dict] = {}
    for spec in TRACKS:
        print(f"Rendering {spec.title}...")
        events = arrange(spec)
        audio = render(spec, events)
        wav_path = OUT / f"{spec.file_id}.wav"
        mid_path = OUT / f"{spec.file_id}.mid"
        ogg_path = OUT / f"{spec.file_id}.ogg"
        write_wav24(wav_path, audio)
        write_midi(mid_path, spec, events)
        ok, method = convert_ogg(wav_path, ogg_path)
        if not ok:
            # Leave no fake OGG file behind. The game registry can fall back to WAV.
            if ogg_path.exists():
                ogg_path.unlink()
            print(f"  OGG warning: {method}")
        duration = file_duration(wav_path)
        loop_metadata[spec.file_id] = {"loop": spec.loop}
        if spec.loop:
            loop_metadata[spec.file_id]["loopStartSeconds"] = 0.0
            loop_metadata[spec.file_id]["loopEndSeconds"] = round(duration, 6)
        render_report[spec.file_id] = {
            "title": spec.title,
            "key": spec.key,
            "tempoBPM": spec.tempo,
            "durationSeconds": round(duration, 6),
            "loop": spec.loop,
            "loopStartSeconds": 0.0 if spec.loop else None,
            "loopEndSeconds": round(duration, 6) if spec.loop else None,
            "wavBytes": wav_path.stat().st_size,
            "oggBytes": ogg_path.stat().st_size if ogg_path.exists() else 0,
            "midiBytes": mid_path.stat().st_size,
            "oggEncoding": method if ok else None,
        }
    (OUT / "loop-metadata.json").write_text(json.dumps(loop_metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "render-report.json").write_text(json.dumps(render_report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_docs(render_report)
    print("OST complete.")


if __name__ == "__main__":
    main()
