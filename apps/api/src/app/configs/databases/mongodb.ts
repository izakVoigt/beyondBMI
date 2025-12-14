import type { ConnectOptions } from 'mongoose';

import { NodeEnv } from '@libs/common/enums/node-env';
import mongoose from 'mongoose';

import { env } from '../envs/env';
import { logger } from '../logger/logger';

export type MongoClient = typeof mongoose;

let client: MongoClient | null = null;
let listenersRegistered = false;

/**
 * Registers MongoDB connection lifecycle listeners.
 *
 * @remarks
 * - Listeners are registered exactly once to avoid duplicated logs.
 * - Connection events are logged to improve observability and debugging.
 *
 * This function is idempotent and safe to call multiple times.
 */
const registerMongoListeners = (): void => {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', error => {
    logger.error({ error }, 'MongoDB connection error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('close', () => {
    logger.info('MongoDB connection closed');
  });
};

/**
 * Establishes and memoise a MongoDB connection using Mongoose.
 *
 * @remarks
 * - The connection is created once and reused across the entire process.
 * - Subsequent calls return the existing client, preventing duplicate
 *   connections.
 * - Connection behavior is adjusted based on the current runtime
 *   environment.
 *
 * The function should be invoked during application bootstrap.
 *
 * @returns A connected {@link MongoClient} instance.
 *
 * @throws {Error}
 * Thrown when the initial connection attempt fails.
 */
export const mongoDbConnect = async (): Promise<MongoClient> => {
  if (client) return client;

  registerMongoListeners();

  const options: ConnectOptions = {
    autoIndex: env.NODE_ENV !== NodeEnv.PRODUCTION,
    connectTimeoutMS: 10_000,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  };

  logger.info('Connecting to MongoDB...');

  client = await mongoose.connect(env.MONGODB_URI, options);

  return client;
};

/**
 * Gracefully closes the MongoDB connection, if one is currently active.
 *
 * @remarks
 * - Safely handles repeated calls by returning early when no active
 *   connection exists.
 * - Resets the cached client reference after disconnection.
 */
export const mongoDbDisconnect = async (): Promise<void> => {
  if (!client) return;

  await mongoose.disconnect();
  logger.info('MongoDB disconnected successfully');

  client = null;
};
