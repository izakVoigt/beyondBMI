/**
 * Defines the runtime environment in which the application is executed.
 *
 * @remarks
 * This enum is typically derived from the `NODE_ENV` environment variable
 * and is used to toggle environment-specific behavior such as logging,
 * feature flags, error handling, and external service configuration.
 */
export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  STAGING = 'staging',
}
