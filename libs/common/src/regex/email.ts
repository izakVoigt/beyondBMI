/**
 * Regular expression used to validate email addresses.
 *
 * @remarks
 * - Provides a pragmatic validation suitable for most web applications.
 * - Ensures the presence of a local part, an `@` symbol, and a domain with a TLD.
 * - Intentionally avoids full RFC 5322 compliance to reduce false negatives
 *   and keep validation predictable.
 *
 * This regex should be used for basic format validation only.
 * Final email validity should be confirmed via verification workflows
 * (e.g. confirmation emails).
 */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
