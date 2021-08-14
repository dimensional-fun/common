import { isObject } from "./functions";
import { Type } from "./Type";

import type { Dictionary, Tuple } from "./types";

export class Collection<K, V> extends Map<K, V> {
    ["constructor"]: typeof Collection;

    static from<K, V>(tupleArrayOrObject: Dictionary<V> | Tuple<K, V>[]): Collection<K, V>;
    static from<V>(values: V[]): Collection<number, V>;
    static from<K, V>(
        value: Tuple[] | V[] | Dictionary
    ): Collection<K, V> {
        const col = new Collection<any, any>();
        if (Array.isArray(value) && value.length) {
            if (Array.isArray(value[0])) {
                for (const [ k, v ] of value as Tuple[]) {
                    col.set(k, v);
                }

                return col;
            }

            let i = 0;
            for (const v of value as V[]) {
                col.set(i, v);
                i++;
            }

            return col;
        } else if (isObject(value)) {
            return new Collection<any, any>(Object.entries(value));
        }

        throw new Error(
            `Collection#from: Expected an object or array, got "${typeof value}"`
        );
    }

    first(): Tuple<K, V> | null;
    first(amount: number): Tuple<K, V>[];
    first(amount?: number): Tuple<K, V> | Tuple<K, V>[] | null {
        const it = this.entries();
        if (amount) {
            return amount < 0
                ? this.last(amount * -1)
                : Array.from(
                    { length: Math.min(amount, this.size) },
                    () => it.next().value
                );
        }

        return it.next().value ?? null;
    }

    last(): Tuple<K, V> | null;
    last(amount: number): Tuple<K, V>[];
    last(amount?: number): Tuple<K, V> | Tuple<K, V>[] | null {
        const arr = Array.from(this.entries());
        if (amount) {
            return amount < 0 ? this.first(amount * -1) : arr.slice(-amount).reverse();
        }

        return arr[arr.length - 1] ?? null;
    }

    array(): V[] {
        return Array.from(this.values());
    }

    some(predicate: (value: V, key: K, col: this) => unknown, thisArg?: unknown): boolean {
        if (thisArg) {
            predicate = predicate.bind(thisArg);
        }

        for (const [ k, v ] of this) {
            if (predicate(v, k, this)) {
                return true;
            }
        }

        return false;
    }

    slice(from?: number, end?: number): Collection<K, V> {
        const col = new Collection<K, V>(),
            entries = Array.from(this.entries());

        for (const [ k, v ] of entries.slice(from, end)) {
            col.set(k, v);
        }

        return col;
    }

    each(fn: (value: V, key: K, col: this) => unknown, thisArg?: unknown): this {
        if (thisArg) {
            fn = fn.bind(thisArg);
        }

        for (const [ k, v ] of this) {
            fn(v, k, this);
        }

        return this;
    }

    ensure(key: K, value: ((key: K) => V) | V): V {
        let v = this.get(key);
        if (!v) {
            v = typeof value === "function" ? (value as any)(key) : value;

            this.set(key, v as V);
        }

        return v as V;
    }

    random(): V {
        const values = Array.from(this.values());
        return values[Math.floor(Math.random() * values.length)];
    }

    randomKey(): K {
        const keys = Array.from(this.keys());
        return keys[Math.floor(Math.random() * keys.length)];
    }

    randomEntry(): Tuple<K, V> {
        const entries = Array.from(this.entries());
        return entries[Math.floor(Math.random() * entries.length)];
    }

    sweep(fn: (value: V, key: K, col: this) => boolean, thisArg?: unknown): number {
        if (thisArg) {
            fn = fn.bind(thisArg);
        }

        const oldSize = this.size;
        for (const [ k, v ] of this) {
            if (fn(v, k, this)) this.delete(k);
        }

        return oldSize - this.size;
    }

    find(fn: (value: V, key: K, col: this) => boolean, thisArg?: unknown): V | null {
        if (thisArg) {
            fn = fn.bind(this);
        }

        for (const [ k, v ] of this) {
            if (fn(v, k, this)) {
                return v;
            }
        }

        return null;
    }

    reduce<A>(fn: (acc: A, value: V, key: K, col: this) => A, acc: A, thisArg?: unknown): A {
        if (thisArg) {
            fn = fn.bind(thisArg);
        }

        for (const [ k, v ] of this) {
            acc = fn(acc, v, k, this);
        }

        return acc;
    }

    partition(predicate: (value: V, key: K, col: this) => boolean, thisArg?: unknown): Tuple<Collection<K, V>, Collection<K, V>> {
        if (thisArg) {
            predicate = predicate.bind(thisArg);
        }

        const [ p1, p2 ] = [ new Collection<K, V>(), new Collection<K, V>() ];
        for (const [ k, v ] of this) {
            const partition = predicate(v, k, this) ? p1 : p2;

            partition.set(k, v);
        }

        return [ p1, p2 ];
    }

    filter(fn: (value: V, key: K, col: this) => boolean, thisArg?: unknown): Collection<K, V> {
        if (thisArg) fn = fn.bind(thisArg);

        const col = new this.constructor[Symbol.species]();
        for (const [ k, v ] of this) {
            if (fn(v, k, this)) col.set(k, v);
        }

        return col as Collection<K, V>;
    }

    map<T>(fn: (value: V, key: K, col: this) => T, thisArg?: unknown): T[] {
        if (thisArg) fn = fn.bind(thisArg);

        const arr = [];
        for (const [ k, v ] of this) {
            const value = fn(v, k, this);
            arr.push(value);
        }

        return arr;
    }

    sort(
        compareFunction: (
            firstValue: V,
            secondValue: V,
            firstKey?: K,
            secondKey?: K
        ) => number = (first, second): number =>
            +(first > second) || +(first === second) - 1
    ): this {
        const entries = Array.from(this.entries()).sort((a, b) =>
            compareFunction(a[1], b[1], a[0], b[0])
        );

        this.clear();
        for (const [ key, value ] of entries) {
            this.set(key, value);
        }

        return this;
    }

    sorted(
        compareFunction: (
            firstValue: V,
            secondValue: V,
            firstKey?: K,
            secondKey?: K
        ) => number = (first, second): number =>
            +(first > second) || +(first === second) - 1
    ): Collection<K, V> {
        const entries = Array.from(this.entries()).sort((a, b) =>
            compareFunction(a[1], b[1], a[0], b[0])
        );

        return new this.constructor(entries);
    }

    clone(): Collection<K, V> {
        return new this.constructor[Symbol.species](this.entries()) as Collection<K, V>;
    }

    toString(): string {
        if (this.size) {
            const [ k, v ] = this.first() as Tuple<K, V>;
            return `${this.constructor.name}<${new Type(k)}, ${new Type(v)}>`;
        }

        return "${this.constructor.name}<any, any>";
    }
}
