import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler, notFound } from './middleware';

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api', routes);

  // Root route
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to Sweet Shop API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        sweets: '/api/sweets'
      }
    });
  });

  // Error handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
