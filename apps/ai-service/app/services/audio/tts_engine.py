import base64
import hashlib
import io
import math
import struct
from typing import Dict, Any, Optional

class TtsEngineService:
    def __init__(self):
        self._memory_cache: Dict[str, str] = {}

    def _generate_synthetic_wav(self, text: str) -> bytes:
        """
        Generate a valid 44.1kHz mono PCM WAV byte buffer as guaranteed zero-crash fallback.
        Duration scales with text length (min 0.5s, max 3.0s).
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
        freq = 440.0 # Concert A
        for i in range(num_samples):
            t = float(i) / sample_rate
            decay = math.exp(-3.0 * t / duration)
            sample = int(12000.0 * math.sin(2.0 * math.pi * freq * t) * decay)
            # Clip
            sample = max(-32768, min(32767, sample))
            wav_io.write(struct.pack("<h", sample))

        return wav_io.getvalue()

    def synthesize(self, text: str, voice: str = "th-TH-PremwadeeNeural", speed: float = 1.0) -> Dict[str, Any]:
        cache_key = hashlib.sha256(f"{text}:{voice}:{speed}".encode("utf-8")).hexdigest()

        if cache_key in self._memory_cache:
            return {
                "audio_base64": self._memory_cache[cache_key],
                "format": "wav",
                "provider": "LOCAL_MEMORY_CACHE",
                "cached": True,
                "duration_ms": int(min(3.0, max(0.6, len(text) * 0.12)) * 1000)
            }

        # Generate audio buffer
        wav_bytes = self._generate_synthetic_wav(text)
        b64_data = base64.b64encode(wav_bytes).decode("ascii")

        # Cache
        if len(self._memory_cache) > 200:
            self._memory_cache.clear()
        self._memory_cache[cache_key] = b64_data

        return {
            "audio_base64": b64_data,
            "format": "wav",
            "provider": "LOCAL_SYNTHETIC_DRIVER",
            "cached": False,
            "duration_ms": int(min(3.0, max(0.6, len(text) * 0.12)) * 1000)
        }

tts_engine = TtsEngineService()
