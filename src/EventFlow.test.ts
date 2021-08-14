import defaultTest, { TestInterface } from "ava";
import { EventFlow, SubscriptionLimitReached } from "./index";

const test = defaultTest as TestInterface<EventFlow>;

/* stuff we need */

const testEvent = "testing_event";
const testSubscription = function test() {
};
const testSubscriptionThrowing = function test() {
    throw new Error("testing");
};

test.beforeEach(t => {
    t.context = new EventFlow();
});

//<editor-fold desc="EventFlow">

test("EventFlow#subscriptionLimit: warns about unlimited subscriptions", t => {
    t.plan(1);

    t.context.subscribe("flow.warn", msg => {
        t.truthy(msg.includes("-1"));
    });

    t.context.subscriptionLimit = -1;
});

test("EventFlow#getSubscriptions: returns all subscriptions for the supplied event", t => {
    t.context.subscribe(testEvent, testSubscription);
    t.context.subscribe(testEvent, testSubscription);
    t.context.subscribe(testEvent, testSubscription);

    const subscriptions = t.context.getSubscriptions(testEvent);
    t.deepEqual(subscriptions, [ testSubscription, testSubscription, testSubscription ]);
});

test("EventFlow#getSubscriptionsCount: returns the total number of subscriptions for the supplied event", t => {
    t.context.subscribe(testEvent, testSubscription);
    t.context.subscribe(testEvent, testSubscription);
    t.context.subscribe(testEvent, testSubscription);

    t.is(t.context.getSubscriptionCount(testEvent), 3);
});

//</editor-fold>

//<editor-fold desc="EventFlow#subscribe">

test("EventFlow#subscribe: returns the flow instance.", t => {
    const returned = t.context.subscribe(testEvent, testSubscription);
    t.is(returned, t.context);
});

test("EventFlow#subscribe: adds the subscription", t => {
    t.context.subscribe(testEvent, testSubscription);
    const subscriptions = t.context.getSubscriptions(testEvent);
    t.is(subscriptions[0], testSubscription);
});

test("EventFlow#subscribe: throws error when max subscriptions is reached", t => {
    const creation = () => {
        let i = 0;
        while (i !== 10) {
            t.context.subscribe(testEvent, testSubscription);
            i++;
        }
    };

    t.throws<SubscriptionLimitReached>(creation, {
        instanceOf: SubscriptionLimitReached,
    });
});

//</editor-fold>

//<editor-fold desc="EventFlow#send">

test("EventFlow#send: returns the correct number of successful and total sends", t => {

    t.context.subscribe(testEvent, testSubscription);
    t.context.subscribe(testEvent, testSubscriptionThrowing);

    t.context.subscribe("flow.error", () => {
    });  // we dont care about the error.

    const [ successful, total ] = t.context.publish(testEvent);
    t.is(successful, 1);
    t.is(total, 2);

});

test("EventFlow#send: returns [0, 0] if no subscriptions exist", t => {
    const tuple = t.context.publish(testEvent);
    t.deepEqual(tuple, [ 0, 0 ]);
});

test("EventFlow#send: sends error event if subscription fails", t => {
    t.plan(1);

    t.context.subscribe("flow.error", e => t.truthy(e instanceof Error));
    t.context.subscribe(testEvent, testSubscriptionThrowing);
    t.context.publish(testEvent);
});

test("EventFlow#send: throws error if subscription fails", t => {
    t.context.subscribe(testEvent, testSubscriptionThrowing);
    t.throws(() => t.context.publish(testEvent));
});

//</editor-fold>

//<editor-fold desc="EventFlow#unsubscribe">

test("EventFlow#unsubscribe: returns false if no subscriptions exist", t => {

    const removed = t.context.unsubscribe(testEvent, testSubscription);
    t.is(removed, false);

});

test("EventFlow#unsubscribe removes the subscription", t => {

    t.context.subscribe(testEvent, testSubscription);

    const removed = t.context.unsubscribe(testEvent, testSubscription);
    t.truthy(removed);
    t.truthy(t.context.getSubscriptions(testEvent).isEmpty);

});

test("EventFlow#unsubscribe: event subscriptions get updated", t => {

    t.context.subscribe(testEvent, testSubscription);
    t.context.subscribe(testEvent, testSubscription);

    t.context.unsubscribe(testEvent, testSubscription);
    t.is(t.context.getSubscriptionCount(testEvent), 1);

});

//</editor-fold>
