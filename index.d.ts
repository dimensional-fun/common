declare global {
        interface Array<T> {
                isEmpty: boolean;
                removeFirst(value: T): T | undefined;
        }
}

export class Collection<K, V> extends Map<K, V> {
    ["constructor"]: typeof Collection;
    static from<K, V>(tupleArrayOrObject: Dictionary<V> | Tuple<K, V>[]): Collection<K, V>;
    static from<V>(values: V[]): Collection<number, V>;
    first(): Tuple<K, V> | null;
    first(amount: number): Tuple<K, V>[];
    last(): Tuple<K, V> | null;
    last(amount: number): Tuple<K, V>[];
    array(): V[];
    some(predicate: (value: V, key: K, col: this) => unknown, thisArg?: unknown): boolean;
    slice(from?: number, end?: number): Collection<K, V>;
    each(fn: (value: V, key: K, col: this) => unknown, thisArg?: unknown): this;
    ensure(key: K, value: ((key: K) => V) | V): V;
    random(): V;
    randomKey(): K;
    randomEntry(): Tuple<K, V>;
    sweep(fn: (value: V, key: K, col: this) => boolean, thisArg?: unknown): number;
    find(fn: (value: V, key: K, col: this) => boolean, thisArg?: unknown): V | null;
    reduce<A>(fn: (acc: A, value: V, key: K, col: this) => A, acc: A, thisArg?: unknown): A;
    partition(predicate: (value: V, key: K, col: this) => boolean, thisArg?: unknown): Tuple<Collection<K, V>, Collection<K, V>>;
    filter(fn: (value: V, key: K, col: this) => boolean, thisArg?: unknown): Collection<K, V>;
    map<T>(fn: (value: V, key: K, col: this) => T, thisArg?: unknown): T[];
    sort(compareFunction?: (firstValue: V, secondValue: V, firstKey?: K, secondKey?: K) => number): this;
    sorted(compareFunction?: (firstValue: V, secondValue: V, firstKey?: K, secondKey?: K) => number): Collection<K, V>;
    clone(): Collection<K, V>;
    toString(): string;
}

export const _subscriptions: unique symbol;
export const _subscriptionsLimit: unique symbol;
export class EventBus<M extends SubscriptionMap = empty> implements EventEmitterLike {
    static DEFAULT_SUBSCRIPTION_LIMIT: number;
    protected [_subscriptions]: Map<event, SubscriptionMethod<any>[]>;
    protected [_subscriptionsLimit]: number;
    get subscriptionLimit(): number;
    set subscriptionLimit(newLimit: number);
    emit<E extends keyof M>(event: E, ...args: M[E]): boolean;
    on<E extends keyof M>(event: E, func: SubscriptionMethod<M[E]>): this;
    off<E extends keyof M>(event: E, func: SubscriptionMethod<M[E]>): boolean;
    getSubscriptionCount(event: keyof M): number;
    getSubscriptions<E extends keyof M>(event: E): SubscriptionMethod<M[E]>[];
    addListener<E extends keyof M>(event: E, listener: SubscriptionMethod<M[E]>): any;
    removeListener<E extends keyof M>(event: E, listener: SubscriptionMethod<M[E]>): any;
}
export class SubscriptionLimitReached extends Error {
    readonly event: event;
    readonly limit: number;
    constructor(event: event, limit: number);
}
type empty = SubscriptionMap<Dictionary>;
type event = symbol | string;
type customEvents = {
    "flow.error": [error: Error, eventName: event, args: Array<any>];
    "flow.warn": [message: string];
};
export type SubscriptionMethod<A extends any[] = any[]> = (...args: A) => void;
export type SubscriptionMap<T extends Record<event, any[]> = empty> = T & customEvents;

export type Tuple<A = any, B = any> = [A, B];
export type Dictionary<V = any, K extends PropertyKey = string> = Record<K, V>;
export type Class<T = any> = {
    new (...args: any[]): T;
};
export interface EventEmitterLike {
    emit(event: string, ...args: any[]): boolean | void;
    addListener(event: string, listener: (...args: any[]) => void): EventEmitterLike | any;
    removeListener(event: string, listener: (...args: any[]) => void): EventEmitterLike | any;
}

export function isObject(input: unknown): input is Dictionary;

export function mergeObject<O extends Record<PropertyKey, any> = Record<PropertyKey, any>>(...objects: Partial<O>[]): O;

export function safeRequire<T>(name: string): T | undefined;

