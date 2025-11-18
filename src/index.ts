import express from 'express';
import { config } from './config';
import routes from './api/routes';

const app = express();

// Middleware
app.use(express.json());

// CORS (本番環境では適切に設定してください)
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Mental Health Companion Core',
    version: '0.1.0',
    status: 'running',
    disclaimer: 'このシステムは医療行為ではありません。専門的な治療が必要な場合は、必ず医療機関にご相談ください。',
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀 Mental Health Companion Core API running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 LLM Provider: ${config.llm.provider}`);
  console.log(`\n⚠️  DISCLAIMER: このシステムは医療行為ではありません。`);
});

export default app;
