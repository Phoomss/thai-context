export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/thai_context',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  tts: {
    activeProvider: process.env.TTS_ACTIVE_PROVIDER || 'AI_SERVICE', // 'AI_SERVICE' | 'LOCAL_MOCK'
    voiceThai: process.env.TTS_VOICE_THAI || 'th-TH-PremwadeeNeural',
    timeoutMs: parseInt(process.env.TTS_TIMEOUT_MS || '12000', 10),
    cacheDir: process.env.TTS_CACHE_DIR || '/tmp/thai-context/tts-cache',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    fastModel: process.env.GEMINI_FAST_MODEL || 'gemini-2.5-flash-lite',
    standardModel: process.env.GEMINI_STANDARD_MODEL || 'gemini-2.5-flash',
    reasoningModel: process.env.GEMINI_REASONING_MODEL || 'gemini-2.5-pro',
    maxRetries: parseInt(process.env.GEMINI_MAX_RETRIES || '3', 10),
    timeoutMs: parseInt(process.env.GEMINI_TIMEOUT_MS || '30000', 10),
    temperatureDefault: parseFloat(process.env.GEMINI_TEMPERATURE_DEFAULT || '0.2'),
    enableFallback: process.env.GEMINI_ENABLE_FALLBACK !== 'false',
    pricing: {
      fastInputPrice: process.env.GEMINI_FAST_INPUT_PRICE ? parseFloat(process.env.GEMINI_FAST_INPUT_PRICE) : 0.000000075,
      fastOutputPrice: process.env.GEMINI_FAST_OUTPUT_PRICE ? parseFloat(process.env.GEMINI_FAST_OUTPUT_PRICE) : 0.0000003,
      standardInputPrice: process.env.GEMINI_STANDARD_INPUT_PRICE ? parseFloat(process.env.GEMINI_STANDARD_INPUT_PRICE) : 0.00000015,
      standardOutputPrice: process.env.GEMINI_STANDARD_OUTPUT_PRICE ? parseFloat(process.env.GEMINI_STANDARD_OUTPUT_PRICE) : 0.0000006,
      reasoningInputPrice: process.env.GEMINI_REASONING_INPUT_PRICE ? parseFloat(process.env.GEMINI_REASONING_INPUT_PRICE) : 0.00000125,
      reasoningOutputPrice: process.env.GEMINI_REASONING_OUTPUT_PRICE ? parseFloat(process.env.GEMINI_REASONING_OUTPUT_PRICE) : 0.000005,
    },
  },
});

