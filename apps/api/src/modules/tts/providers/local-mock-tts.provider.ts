import { Injectable, Logger } from '@nestjs/common';
import { ITtsProvider, TtsSynthesizeOptions, TtsSynthesizeResult } from '../tts.interface';

@Injectable()
export class LocalMockTtsProvider implements ITtsProvider {
  readonly name = 'LOCAL_MOCK_FALLBACK';
  private readonly logger = new Logger(LocalMockTtsProvider.name);

  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  private generateWavBuffer(text: string): Buffer {
    const sampleRate = 22050;
    const duration = Math.min(3.0, Math.max(0.6, text.length * 0.12));
    const numSamples = Math.floor(sampleRate * duration);
    const dataSize = numSamples * 2;
    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF Chunk
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);

    // Subchunk 1 (fmt )
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // PCM subchunk size
    buffer.writeUInt16LE(1, 20);  // PCM format
    buffer.writeUInt16LE(1, 22);  // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);  // Block align
    buffer.writeUInt16LE(16, 34); // Bits per sample

    // Subchunk 2 (data)
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    const freq = 440.0;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const decay = Math.exp((-3.0 * t) / duration);
      const sample = Math.floor(10000 * Math.sin(2.0 * Math.PI * freq * t) * decay);
      const clamped = Math.max(-32768, Math.min(32767, sample));
      buffer.writeInt16LE(clamped, 44 + i * 2);
    }

    return buffer;
  }

  async synthesize(text: string, options?: TtsSynthesizeOptions): Promise<TtsSynthesizeResult> {
    this.logger.log(`Synthesizing synthetic audio via LocalMockTtsProvider for text "${text}"`);
    const wavBuffer = this.generateWavBuffer(text);
    return {
      audioBase64: wavBuffer.toString('base64'),
      format: 'wav',
      provider: this.name,
      cached: false,
      durationMs: Math.floor(Math.min(3.0, Math.max(0.6, text.length * 0.12)) * 1000),
    };
  }
}
