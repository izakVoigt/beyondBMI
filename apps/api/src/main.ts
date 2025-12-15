import { bookingContract } from '@libs/booking/common/contracts/booking';
import { createExpressEndpoints } from '@ts-rest/express';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { mongoDbConnect, mongoDbDisconnect } from './app/configs/databases/mongodb';
import { env } from './app/configs/envs/env';
import { httpLogger } from './app/configs/logger/http-logger';
import { logger } from './app/configs/logger/logger';
import { bookingRouter } from './app/routes/booking';

const { PORT } = env;

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(httpLogger);

createExpressEndpoints(bookingContract, bookingRouter, app);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const bootstrap = async (): Promise<void> => {
  await mongoDbConnect();

  const server = app.listen(PORT, () => {
    logger.info(`Listening at http://localhost:${PORT}`);
  });

  server.on('error', error => logger.error({ error }, 'Server error'));

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received shutdown signal: ${signal}`);

    server.close(async () => {
      await mongoDbDisconnect();

      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

bootstrap();
