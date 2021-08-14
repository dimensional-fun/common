import type { Dictionary } from "../types";

/**
 * Determines whether a value in an object.
 *
 * @param input The value to test
 */
export function isObject(input: unknown): input is Dictionary {
    return input !== null && typeof input === "object";
}
