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
});
