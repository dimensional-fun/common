import type { Dictionary, EventEmitterLike } from "./types";

export const SUBSCRIPTIONS: unique symbol = Symbol.for("Subscriptions");
export const SUBSCRIPTIONS_LIMIT: unique symbol = Symbol.for("SubscriptionsLimit");

/**
 * Handles event-related logic, implements {@link EventEmitterLike} interface for compatibility reasons.
 */
export class EventFlow<M extends SubscriptionMap = empty> implements EventEmitterLike {

    /**
     * The default number of subscriptions allowed for a single event.
     * @type {number}
     */
    static DEFAULT_SUBSCRIPTION_LIMIT = 10;

    /**
     * Map of events and their subscriptions.
     *
     * @protected
     */
    protected [SUBSCRIPTIONS]: Map<event, SubscriptionMethod<any>[]> = new Map();

    /**
     * The total number of subscriptions allowed for a single event.
     *
     * @protected
     */
    protected [SUBSCRIPTIONS_LIMIT]: number = EventFlow.DEFAULT_SUBSCRIPTION_LIMIT;

    /**
     * Returns the total number of subscriptions for a single event.
     *
     * @returns number of subscriptions that can be added for a single event.
     */
    get subscriptionLimit(): number {
        return this[SUBSCRIPTIONS_LIMIT];
    }

    /**
     * Sets the subscription limit to {@param newLimit}.
     *
     * @param newLimit The new subscription limit; or -1 for unlimited, however this is not recommended under any circumstances.
     */
    set subscriptionLimit(newLimit: number) {
        if (newLimit === -1) {
            /* warn about the unlimited subscription limit */
            this.publish("flow.warn", "Setting subscription limit to -1, memory leaks may pop up.");
        }

        this[SUBSCRIPTIONS_LIMIT] = newLimit;
    }

    /**
     * Sends all supplied args to each subscription for the supplied event.
     *
     * @param event The event
     * @param args The arguments to send.
     *
     * @returns {[ number, number ]}, where idx 0 is the number of successful sends and idx 1 is the total number of sends; successful or not.
     */
    publish<E extends keyof M>(event: E, ...args: M[E]): [ sent: number, total: number ] {
        const subscriptions = this.getSubscriptions(event);
        if (subscriptions.isEmpty) {
            return [ 0, 0 ];
        }

        let sent = 0;
        for (const subscription of subscriptions) {
            try {
                subscription(...args);
                sent++;
            } catch (e: any) {
                if (this.getSubscriptions("flow.error").isEmpty) {
                    throw e;
                }

                this.publish("flow.error", e, event as event, args);
            }
        }

        return [ sent, subscriptions.length ];
    }

    /**
     * Subscribes a function to the supplied event.
     *
     * @param event The event to subscribe to.
     * @param func The function that will be called whenever {@param event} is received.
     */
    subscribe<E extends keyof M>(event: E, func: SubscriptionMethod<M[E]>): this {
        /* add the subscription */
        const subscriptions = this.getSubscriptions(event);
        if (this.subscriptionLimit !== -1 && subscriptions.length + 1 >= this.subscriptionLimit) {
            /* we've reached the total number of subscriptions for an event, throw an error. */
            throw new SubscriptionLimitReached(event as event, this[SUBSCRIPTIONS_LIMIT]);
        }

        subscriptions.push(func);

        /* make sure to  */
        this[SUBSCRIPTIONS].set(event as event, subscriptions);

        /* return this, useful for chaining. */
        return this;
    }

    /**
     * Removes the provided {@param func} from the event subscriptions.
     *
     * @param event Event name
     * @param func The function to remove.
     */
    unsubscribe<E extends keyof M>(event: E, func: SubscriptionMethod<M[E]>): boolean {
        /* get all subscriptions for the provided event. */
        const subscriptions = this.getSubscriptions(event);
        if (subscriptions.isEmpty) {
            /* no point in continuing. */
            return false;
        }

        /* remove the func and save our changes. */
        const removed = !!subscriptions.removeFirst(func);
        if (subscriptions.isEmpty) {
            this[SUBSCRIPTIONS].delete(event as event);
        } else {
            this[SUBSCRIPTIONS].set(event as event, subscriptions);
        }

        /* return whether the func was removed */
        return removed;
    }

    /**
     * Returns the number of subscriptions for {@param event}
     *
     * @param event Event name
     *
     * @returns {number} of subscriptions
     */
    getSubscriptionCount(event: keyof M): number {
        return this.getSubscriptions(event).length;
    }

    /**
     * Get all subscriptions for the supplied event name.
     *
     * @param event Event name
     */
    getSubscriptions<E extends keyof M>(event: E): SubscriptionMethod<M[E]>[] {
        return this[SUBSCRIPTIONS].get(event as event) ?? [];
    }

    /* ↓ ↓ ↓ compat methods ↓ ↓ ↓ */

    emit<E extends keyof M>(event: E, ...args: M[E]): boolean {
        return !!this.publish(event, ...args)[0];
    }

    addListener<E extends keyof M>(event: E, listener: SubscriptionMethod<M[E]>): any {
        this.subscribe(event, listener);
        return this;
    }

    removeListener<E extends keyof M>(event: E, listener: SubscriptionMethod<M[E]>): any {
        this.unsubscribe(event, listener);
        return this;
    }

}

export class SubscriptionLimitReached extends Error {
    /**
     * The event that had reached the subscription limit.
     * @type {event}
     */
    readonly event: event;

    /**
     * The subscription limit that was reached.
     * @type {number}
     */
    readonly limit: number;

    /**
     * @param event Event name.
     * @param limit Configured subscription limit.
     */
    constructor(event: event, limit: number) {
        super(`Reached the total number of subscriptions for event "${event.toString()}", limit: ${limit}`);

        this.event = event;
        this.limit = limit;
    }
}

type empty = SubscriptionMap<Dictionary>;
type event = symbol | string;
type customEvents = {
    /* custom events by the event flow. */
    "flow.error": [ error: Error, eventName: event, args: Array<any> ];
    "flow.warn": [ message: string ];
}

export type SubscriptionMethod<A extends any[] = any[]> = (...args: A) => void;
export type SubscriptionMap<T extends Record<event, any[]> = empty> = T & customEvents
