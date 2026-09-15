export interface TtsSynthesizeOptions {
  voice?: string;
  speed?: number;
}

export interface TtsSynthesizeResult {
  audioBase64: string;
  format: string;
  provider: string;
  cached: boolean;
  durationMs?: number;
}

export interface ITtsProvider {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  synthesize(text: string, options?: TtsSynthesizeOptions): Promise<TtsSynthesizeResult>;
}
