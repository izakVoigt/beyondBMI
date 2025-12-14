import pinoHttp from 'pino-http';

import { logger } from './logger';

/**
 * HTTP request/response logging middleware for Express.
 *
 * @remarks
 * This middleware integrates {@link pino-http} with the shared application
 * logger, producing structured logs for each incoming request and outgoing
 * response.
 *
 * - Automatically logs request lifecycle events (start/end).
 * - Enriches logs with HTTP metadata such as method, URL, status code,
 *   and response time.
 * - Uses the shared {@link logger} instance to ensure consistent log
 *   formatting and transport across the application.
 *
 * This middleware should be registered early in the Express middleware
 * chain, after security-related middleware (e.g. `helmet`, `cors`) and
 * before route handlers.
 */
export const httpLogger = pinoHttp({
  autoLogging: true,
  logger,
});
