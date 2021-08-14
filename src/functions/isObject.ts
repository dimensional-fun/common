import type { Dictionary } from "../types";

export function isObject(input: unknown): input is Dictionary {
    return input !== null && typeof input === "object";
}
