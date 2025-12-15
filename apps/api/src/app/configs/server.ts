import { initServer } from '@ts-rest/express';

/**
 * ts-rest Express server instance.
 *
 * @remarks
 * This server acts as the bridge between:
 * - ts-rest contracts (shared API definitions)
 * - Express route implementations
 *
 * It is responsible for:
 * - Mapping contract routes to their concrete handlers
 * - Enforcing request/response typing at compile time
 *
 * The server instance should be reused across all routers
 * to ensure consistent behavior and type safety.
 */
export const server = initServer();
