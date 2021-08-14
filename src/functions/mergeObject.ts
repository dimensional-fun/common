/**
 * Merges objects into one.
 *
 * @param {Dictionary} objects The objects to merge.
 */
export function mergeObject<O extends Record<PropertyKey, any> = Record<PropertyKey, any>>(...objects: Partial<O>[]): O {
    const o: Record<PropertyKey, any> = {};
    for (const object of objects) {
        for (const key of Reflect.ownKeys(object)) {
            const def = Reflect.get(object, key);
            if (!Reflect.has(o, key)) {
                Reflect.set(o, key, def);
            } else {
                let cur = Reflect.get(o, key);
                if (typeof cur === "object") {
                    cur = mergeObject(cur, def);
                } else if (cur instanceof Map) {
                    for (const [ k, v ] of def) {
                        if (!cur.has(k)) {
                            cur.set(k, v);
                        }
                    }
                } else if (cur instanceof Set) {
                    const _new = new Set([ ...cur, ...def ]);
                    cur = _new;
                } else if (Array.isArray(cur)) {
                    cur = cur.concat(def);
                } else if (cur == undefined) {
                    cur = def;
                }

                Reflect.set(o, key, cur);
            }
        }
    }

    return o as O;
}
