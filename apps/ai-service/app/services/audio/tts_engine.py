import asyncio
import base64
import hashlib
import io
import logging
import math
import re
import struct
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

try:
    import edge_tts
    HAS_EDGE_TTS = True
except ImportError:
    HAS_EDGE_TTS = False


class TtsEngineService:
    def __init__(self):
        self._memory_cache: Dict[str, Dict[str, Any]] = {}

    def _clean_text_for_speech(self, text: str) -> str:
        """
        Clean dictionary notation and symbols for natural spoken Thai.
        e.g., 'สวัสดิ-, สวัสดิ์ ๑, สวัสดี' -> 'สวัสดิ, สวัสดิ์, สวัสดี'
        """
        # Remove sense counter numbers (e.g. ๑, ๒, 1, 2) following dictionary words
        cleaned = re.sub(r'\s+[๑-๙\d]+', '', text)
        # Remove trailing or isolated hyphens
        cleaned = re.sub(r'[-–—]', '', cleaned)
        # Clean redundant punctuation and multiple spaces
        cleaned = re.sub(r'\s*,\s*', ', ', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        return cleaned if cleaned else text

    def _generate_synthetic_wav(self, text: str) -> bytes:
        """
        Generate a valid 22.05kHz mono PCM WAV byte buffer as guaranteed zero-crash fallback.
        Duration scales with text length (min 0.6s, max 3.0s).
        Generates pleasant low-volume multi-harmonic chime tones for the words.
        """
        sample_rate = 22050
        duration = min(3.0, max(0.6, len(text) * 0.12))
        num_samples = int(sample_rate * duration)

        wav_io = io.BytesIO()
        # RIFF Header
        wav_io.write(b"RIFF")
        wav_io.write(struct.pack("<I", 36 + num_samples * 2))
        wav_io.write(b"WAVE")
        # fmt subchunk
        wav_io.write(b"fmt ")
        wav_io.write(struct.pack("<I", 16))          # Subchunk1Size (16 for PCM)
        wav_io.write(struct.pack("<H", 1))           # AudioFormat (1 = PCM)
        wav_io.write(struct.pack("<H", 1))           # NumChannels (1 = Mono)
        wav_io.write(struct.pack("<I", sample_rate)) # SampleRate
        wav_io.write(struct.pack("<I", sample_rate * 2)) # ByteRate
        wav_io.write(struct.pack("<H", 2))           # BlockAlign
        wav_io.write(struct.pack("<H", 16))          # BitsPerSample
        # data subchunk
        wav_io.write(b"data")
        wav_io.write(struct.pack("<I", num_samples * 2))

        # Synthesize gentle soft frequency chime
        freq = 440.0  # Concert A
        for i in range(num_samples):
            t = float(i) / sample_rate
            decay = math.exp(-3.0 * t / duration)
            sample = int(12000.0 * math.sin(2.0 * math.pi * freq * t) * decay)
            sample = max(-32768, min(32767, sample))
            wav_io.write(struct.pack("<h", sample))

        return wav_io.getvalue()

    async def _synthesize_edge_tts(self, text: str, voice: str, speed: float) -> Optional[bytes]:
        if not HAS_EDGE_TTS:
            return None
        try:
            rate_percent = int((speed - 1.0) * 100)
            rate_str = f"+{rate_percent}%" if rate_percent >= 0 else f"{rate_percent}%"
            communicate = edge_tts.Communicate(text, voice, rate=rate_str)
            audio_buffer = bytearray()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_buffer.extend(chunk["data"])
            if audio_buffer:
                return bytes(audio_buffer)
        except Exception as e:
            logger.warning(f"Edge TTS synthesis error: {e}. Falling back to synthetic tone.")
        return None

    async def synthesize(self, text: str, voice: str = "th-TH-PremwadeeNeural", speed: float = 1.0) -> Dict[str, Any]:
        cache_key = hashlib.sha256(f"{text}:{voice}:{speed}".encode("utf-8")).hexdigest()

        if cache_key in self._memory_cache:
            cached_data = dict(self._memory_cache[cache_key])
            cached_data["cached"] = True
            return cached_data

        clean_text = self._clean_text_for_speech(text)

        # 1. Try real neural voice synthesis via edge-tts
        mp3_bytes = await self._synthesize_edge_tts(clean_text, voice, speed)
        if mp3_bytes:
            b64_data = base64.b64encode(mp3_bytes).decode("ascii")
            # Approx duration: 48kbps -> 6000 bytes/sec
            duration_ms = max(500, int((len(mp3_bytes) / 6000.0) * 1000))
            result = {
                "audio_base64": b64_data,
                "format": "mp3",
                "provider": "EDGE_TTS_PREMWADEE",
                "cached": False,
                "duration_ms": duration_ms,
            }
        else:
            # 2. Guaranteed zero-crash fallback: synthetic WAV chime
            wav_bytes = self._generate_synthetic_wav(clean_text)
            b64_data = base64.b64encode(wav_bytes).decode("ascii")
            result = {
                "audio_base64": b64_data,
                "format": "wav",
                "provider": "LOCAL_SYNTHETIC_DRIVER",
                "cached": False,
                "duration_ms": int(min(3.0, max(0.6, len(clean_text) * 0.12)) * 1000),
            }

        # Cache in memory
        if len(self._memory_cache) > 200:
            self._memory_cache.clear()
        self._memory_cache[cache_key] = result

        return dict(result)


tts_engine = TtsEngineService()
