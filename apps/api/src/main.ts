import express from 'express';

import { env } from './app/configs/envs/env';

const { PORT } = env;

const app = express();

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api!' });
});

const server = app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}/api`);
});
server.on('error', console.error);
