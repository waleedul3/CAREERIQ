import cookieParser from 'cookie-parser';
import express from 'express';
import { isDatabaseConfigured } from './config/db.ts';
import adminRoutes from './routes/admin.ts';
import authRoutes from './routes/auth.ts';
import studentRoutes from './routes/student.ts';

export function createApiApp() {
  const app = express();
  app.set('trust proxy', 1);

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(cookieParser());
  app.use(express.json({ limit: '8mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      databaseConfigured: isDatabaseConfigured(),
      modelPath: '/models/employability_model.onnx',
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api', studentRoutes);
  app.use('/api/admin', adminRoutes);

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  return app;
}
