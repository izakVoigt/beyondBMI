import express from 'express';

import { env } from './app/configs/envs/env';
import { httpLogger } from './app/configs/logger/http-logger';
import { logger } from './app/configs/logger/logger';

const { PORT } = env;

const app = express();

app.use(httpLogger);

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api!' });
});

const server = app.listen(PORT, () => {
  logger.info(`Listening at http://localhost:${PORT}`);
});

server.on('error', error => logger.error({ error }, 'Server error'));
