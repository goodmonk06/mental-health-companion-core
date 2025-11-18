import express from 'express';
import { config } from './config';
import routes from './api/routes';
import routesPhase3 from './api/routes-phase3';
import { errorHandler } from './api/middleware';
import logger from './lib/logger';

const app = express();

// Middleware
app.use(express.json());

// CORS (本番環境では適切に設定してください)
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Routes
app.use('/api', routes);
app.use('/api/v2', routesPhase3); // Phase 3 expanded API

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    name: 'Mental Health Companion Core',
    version: '0.1.0',
    status: 'running',
    disclaimer: 'このシステムは医療行為ではありません。専門的な治療が必要な場合は、必ず医療機関にご相談ください。',
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = config.server.port;

app.listen(PORT, () => {
  logger.info(`Mental Health Companion Core API started`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    llmProvider: config.llm.provider,
  });
  console.log(`🚀 Mental Health Companion Core API running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 LLM Provider: ${config.llm.provider}`);
  console.log(`🔗 API v1: http://localhost:${PORT}/api`);
  console.log(`🔗 API v2 (Phase 3): http://localhost:${PORT}/api/v2`);
  console.log(`\n⚠️  DISCLAIMER: このシステムは医療行為ではありません。`);
});

export default app;
