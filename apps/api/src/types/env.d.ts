/**
 * Eslint consistent type definition in only been disabled because interface merge type
 * instead of override/merge it, and for these specific case is necessary.
 */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string;
    NODE_ENV: string;
    PORT: string;
  }
}
