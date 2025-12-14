import { NodeEnv } from '@libs/common/enums/node-env';
import pino from 'pino';

import { env } from '../envs/env';

/**
 * Application-wide logger instance.
 *
 * @remarks
 * This logger is built on top of {@link pino} and provides structured,
 * high-performance logging for the application.
 *
 * Behavior varies by environment:
 * - In **production**, logs are emitted as JSON for optimal ingestion
 *   by log aggregation and observability platforms.
 * - In **non-production** environments, logs are prettified using
 *   `pino-pretty` to improve local development readability.
 *
 * Log level selection:
 * - `info` in production to reduce noise.
 * - `debug` in non-production environments for improved diagnostics.
 *
 * This logger should be used throughout the application instead of
 * `console.log` to ensure consistency, performance, and structured output.
 */
export const logger = pino({
  level: env.NODE_ENV === NodeEnv.PRODUCTION ? 'info' : 'debug',
  transport:
    env.NODE_ENV !== 'production'
      ? {
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
          },
          target: 'pino-pretty',
        }
      : undefined,
});
