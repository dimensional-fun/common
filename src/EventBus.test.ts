import defaultTest, { TestInterface } from "ava";
import { EventBus, SubscriptionLimitReached } from "./index";

const test = defaultTest as TestInterface<EventBus>;

/* stuff we need */

const testEvent = "testing_event";
const testSubscription = function test() {
};
const testSubscriptionThrowing = function test() {
    throw new Error("testing");
};

test.beforeEach(t => {
    t.context = new EventBus();
});

//<editor-fold desc="EventBus">

test("EventBus#subscriptionLimit: warns about unlimited subscriptions", t => {
    t.plan(1);

    t.context.on("flow.warn", msg => {
        t.truthy(msg.includes("-1"));
    });

    t.context.subscriptionLimit = -1;
});

test("EventBus#getSubscriptions: returns all subscriptions for the supplied event", t => {
    t.context.on(testEvent, testSubscription);
    t.context.on(testEvent, testSubscription);
    t.context.on(testEvent, testSubscription);

    const subscriptions = t.context.getSubscriptions(testEvent);
    t.deepEqual(subscriptions, [ testSubscription, testSubscription, testSubscription ]);
});

test("EventBus#getSubscriptionsCount: returns the total number of subscriptions for the supplied event", t => {
    t.context.on(testEvent, testSubscription);
    t.context.on(testEvent, testSubscription);
    t.context.on(testEvent, testSubscription);

    t.is(t.context.getSubscriptionCount(testEvent), 3);
});

//</editor-fold>

//<editor-fold desc="EventBus#subscribe">

test("EventBus#subscribe: returns the flow instance.", t => {
    const returned = t.context.on(testEvent, testSubscription);
    t.is(returned, t.context);
});

test("EventBus#subscribe: adds the subscription", t => {
    t.context.on(testEvent, testSubscription);
    const subscriptions = t.context.getSubscriptions(testEvent);
    t.is(subscriptions[0], testSubscription);
});

test("EventBus#subscribe: throws error when max subscriptions is reached", t => {
    const creation = () => {
        let i = 0;
        while (i !== 10) {
            t.context.on(testEvent, testSubscription);
            i++;
        }
    };

    t.throws<SubscriptionLimitReached>(creation, {
        instanceOf: SubscriptionLimitReached,
    });
});

//</editor-fold>

//<editor-fold desc="EventBus#send">

test("EventBus#send: returns the whether the emit was emitted.", t => {

    t.context.on(testEvent, testSubscription);
    t.context.on(testEvent, testSubscriptionThrowing);

    t.context.on("flow.error", () => {
    });  // we dont care about the error.

    const emitted = t.context.emit(testEvent);
    t.is(emitted, true);

});

test("EventBus#send: returns false if nothing was emitted", t => {
    const tuple = t.context.emit(testEvent);
    t.deepEqual(tuple, false);
});

test("EventBus#send: sends error event if subscription fails", t => {
    t.plan(1);

    t.context.on("flow.error", e => t.truthy(e instanceof Error));
    t.context.on(testEvent, testSubscriptionThrowing);
    t.context.emit(testEvent);
});

test("EventBus#send: throws error if subscription fails", t => {
    t.context.on(testEvent, testSubscriptionThrowing);
    t.throws(() => t.context.emit(testEvent));
});

//</editor-fold>

//<editor-fold desc="EventBus#unsubscribe">

test("EventBus#unsubscribe: returns false if no subscriptions exist", t => {
    const removed = t.context.off(testEvent, testSubscription);
    t.is(removed, false);
});

test("EventBus#off removes the subscription", t => {
    t.context.on(testEvent, testSubscription);

    const removed = t.context.off(testEvent, testSubscription);
    t.truthy(removed);
    t.truthy(t.context.getSubscriptions(testEvent).isEmpty);

});

test("EventBus#unsubscribe: event subscriptions get updated", t => {
    t.context.on(testEvent, testSubscription);
    t.context.on(testEvent, testSubscription);

    t.context.off(testEvent, testSubscription);
    t.is(t.context.getSubscriptionCount(testEvent), 1);
});

//</editor-fold>
