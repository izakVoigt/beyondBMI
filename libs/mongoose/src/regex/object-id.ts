/**
 * Regular expression used to validate a MongoDB ObjectId.
 *
 * @remarks
 * A valid MongoDB ObjectId is represented as a 24-character hexadecimal string
 * (characters `0–9`, `a–f`, or `A–F`).
 */
export const objectIdRegex = /^[a-fA-F0-9]{24}$/;
