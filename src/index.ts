import express from 'express';
import helmet from 'helmet';
import { populateDatabase } from './setup';
import { logger } from './utils/pino';
import asyncHandler from 'express-async-handler';
import { producersHandler } from './api/producers';

export const app = express();
app.use(helmet());
app.use(express.json());

async function startServer(): Promise<void> {
  if (process.env.NODE_ENV !== 'test') {
    await populateDatabase();
  }

  const PORT = process.env.PORT || 3000;

  app.get('/producers', asyncHandler(producersHandler));

  app.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}...`);
  });
}

startServer();
