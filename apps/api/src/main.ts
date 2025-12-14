import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './app/configs/envs/env';
import { httpLogger } from './app/configs/logger/http-logger';
import { logger } from './app/configs/logger/logger';

const { PORT } = env;

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(httpLogger);

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api!' });
});

app.use((_req, res) => {
  res.status(400).json({ message: 'Route not found' });
});

const server = app.listen(PORT, () => {
  logger.info(`Listening at http://localhost:${PORT}`);
});

server.on('error', error => logger.error({ error }, 'Server error'));
