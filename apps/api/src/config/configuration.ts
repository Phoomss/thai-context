export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/thai_context',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
});
