import { Collection } from "./Collection";

import type { Class, Dictionary } from "./types";

export class Extender<M extends Dictionary<Class>> {
    readonly structures = new Map<keyof M, Class>();

    /**
     * @param map The structure map.
     */
    constructor(map: M) {
        this.structures = Collection.from(map);
    }

    /**
     * Returns a structure that's assigned to the provided key.
     *
     * @param key Structure's key.
     */
    get<K extends keyof M>(key: K): M[K] {
        const struct = this.structures.get(key);
        if (!struct) {
            throw new Error(`Unknown structure "${key}"`);
        }

        return struct as M[K];
    }

    /**
     * Used to extend an existing structure.
     *
     * @param key Key of the structure to extend.
     * @param extender The extender
     */
    extend<K extends keyof M, E extends M[K]>(key: K, extender: (base: M[K]) => E): Extender<M> {
        const base = this.structures.get(key);
        if (!base) {
            throw new Error(`Unknown structure "${key}"`);
        }

        const extended = extender(base as M[K]);
        if (!(extended instanceof base)) {
            throw new TypeError("Returned class does not inherit base class.");
        }

        this.structures.set(key, extended);
        return this;
    }
}
