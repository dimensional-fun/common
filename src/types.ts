export type Tuple<A = any, B = any> = [ A, B ];
export type Dictionary<V = any, K extends PropertyKey = string> = Record<K, V>

export type Class<T = any> = {
    new(...args: any[]): T
}

/**
 * Used for compatibility between different types of event emitters.
 */
export interface EventEmitterLike {
    emit(event: string, ...args: any[]): boolean | void;

    addListener(event: string, listener: (...args: any[]) => void): EventEmitterLike | any;

    removeListener(event: string, listener: (...args: any[]) => void): EventEmitterLike | any;
}
