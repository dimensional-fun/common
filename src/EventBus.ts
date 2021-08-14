import type { Dictionary, EventEmitterLike } from "./types";

export const _subscriptions: unique symbol = Symbol.for("Subscriptions");
export const _subscriptionsLimit: unique symbol = Symbol.for("SubscriptionsLimit");

export class EventBus<M extends SubscriptionMap = empty> implements EventEmitterLike {
    static DEFAULT_SUBSCRIPTION_LIMIT = 10;

    protected [_subscriptions]: Map<event, SubscriptionMethod<any>[]> = new Map();
    protected [_subscriptionsLimit]: number = EventBus.DEFAULT_SUBSCRIPTION_LIMIT;

    get subscriptionLimit(): number {
        return this[_subscriptionsLimit];
    }

    set subscriptionLimit(newLimit: number) {
        if (newLimit === -1) {
            this.emit("flow.warn", "Setting subscription limit to -1, memory leaks may pop up.");
        }

        this[_subscriptionsLimit] = newLimit;
    }

    emit<E extends keyof M>(event: E, ...args: M[E]): boolean {
        const subscriptions = this.getSubscriptions(event);
        if (subscriptions.isEmpty) {
            return false;
        }

        for (const subscription of subscriptions) {
            try {
                subscription(...args);
            } catch (e: any) {
                if (!this.getSubscriptionCount("flow.error")) {
                    throw e;
                }

                this.emit("flow.error", e, event as event, args);
            }
        }

        return true;
    }

    on<E extends keyof M>(event: E, func: SubscriptionMethod<M[E]>): this {
        const subscriptions = this.getSubscriptions(event);
        if (this.subscriptionLimit !== -1 && subscriptions.length + 1 >= this.subscriptionLimit) {
            /* we've reached the total number of subscriptions for an event, throw an error. */
            throw new SubscriptionLimitReached(event as event, this[_subscriptionsLimit]);
        }

        subscriptions.push(func);
        this[_subscriptions].set(event as event, subscriptions);

        return this;
    }

    off<E extends keyof M>(event: E, func: SubscriptionMethod<M[E]>): boolean {
        const subscriptions = this.getSubscriptions(event);
        if (subscriptions.isEmpty) {
            return false;
        }

        const removed = !!subscriptions.removeFirst(func);
        if (subscriptions.isEmpty) {
            this[_subscriptions].delete(event as event);
        } else {
            this[_subscriptions].set(event as event, subscriptions);
        }

        return removed;
    }

    getSubscriptionCount(event: keyof M): number {
        return this.getSubscriptions(event).length;
    }

    getSubscriptions<E extends keyof M>(event: E): SubscriptionMethod<M[E]>[] {
        return this[_subscriptions].get(event as event) ?? [];
    }

    addListener<E extends keyof M>(event: E, listener: SubscriptionMethod<M[E]>): any {
        this.on(event, listener);
        return this;
    }

    removeListener<E extends keyof M>(event: E, listener: SubscriptionMethod<M[E]>): any {
        this.off(event, listener);
        return this;
    }
}

export class SubscriptionLimitReached extends Error {
    readonly event: event;
    readonly limit: number;

    constructor(event: event, limit: number) {
        super(`Reached the total number of subscriptions for event "${event.toString()}", limit: ${limit}`);

        this.event = event;
        this.limit = limit;
    }
}

type empty = SubscriptionMap<Dictionary>;
type event = symbol | string;
type customEvents = {
    "flow.error": [ error: Error, eventName: event, args: Array<any> ];
    "flow.warn": [ message: string ];
}

export type SubscriptionMethod<A extends any[] = any[]> = (...args: A) => void;
export type SubscriptionMap<T extends Record<event, any[]> = empty> = T & customEvents
