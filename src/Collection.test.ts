import defaultTest, { TestInterface } from "ava";
import { Collection } from "./index";

/* things we need */
const test = defaultTest as TestInterface<Collection<any, any>>;

test.beforeEach(t => {
    t.context = new Collection();
});

//<editor-fold desc="Collection">

test("Collection#array(): returns an array of values", t => {
    t.context.set("foo", "hello");
    t.context.set("bar", "world");

    const values = t.context.array();
    t.deepEqual(values, [ "hello", "world" ]);
});

test("Collection#some(predicate, thisArg): returns the correct values", t => {
    t.context.set("foo", "hello");
    t.context.set("bar", "world");

    function predicateA(this: { x: number }, c: string) {
        return c === "hello" && this.x === 3;
    }

    function predicateB(this: { x: number }, c: string) {
        return c === "foo" && this.x === 3;
    }

    t.truthy(t.context.some(predicateA, { x: 3 }));
    t.falsy(t.context.some(predicateB, { x: 6 }));
});

//</editor-fold>

//<editor-fold desc="Collection.from">

test("Collection.from([ 1 ]): array values map correctly", t => {
    const coll = Collection.from<string>([ "a", "b", "c", "d", "e" ]);

    t.truthy(typeof coll.randomKey() === "number");
    t.truthy(typeof coll.random() === "string");
});

test("Collection.from({}): object values map correctly", t => {
    const coll = Collection.from({
        d: { a: 2 },
        a: 3,
    });

    t.truthy(typeof coll.get("d") === "object");
    t.is(coll.get("a"), 3);
});

test("Collection.from([ [] ]): tuple values map correctly", t => {
    const coll = Collection.from([
        [ 6, 9 ],
        [ 4, 20 ],
    ]);

    t.is(coll.get(6), 9);
    t.is(coll.get(4), 20);
});

test("Collection.from(3): non array/object value throws an error", t => {
    const create = () => {
        // @ts-expect-error
        Collection.from(3);
    };

    t.throws(create);
});

//</editor-fold>

//<editor-fold desc="Collection#first">

test("Collection#first(): returns the first entry", t => {
    t.context.set(6, 9);
    t.context.set(4, 20);

    const firstEntry = t.context.first();
    t.deepEqual(firstEntry, [ 6, 9 ]);
});

test("Collection#first(2): returns the first 2 entries", t => {
    t.context.set(6, 9);
    t.context.set(4, 20);
    t.context.set(69, 420);

    const entries = t.context.first(2);
    t.is(entries.length, 2);
    t.deepEqual(entries[0], [ 6, 9 ]);
    t.deepEqual(entries[1], [ 4, 20 ]);
});

//</editor-fold>

//<editor-fold desc="Collection#last">

test("Collection#last(): returns the last entry", t => {
    t.context.set(6, 9);
    t.context.set(4, 20);

    const firstEntry = t.context.last();
    t.deepEqual(firstEntry, [ 4, 20 ]);
});

test("Collection#last(2): returns the last 2 entries", t => {
    t.context.set(6, 9);
    t.context.set(4, 20);
    t.context.set(69, 420);

    const entries = t.context.last(2);
    t.is(entries.length, 2);
    t.deepEqual(entries[0], [ 69, 420 ]);
    t.deepEqual(entries[1], [ 4, 20 ]);
});

//</editor-fold>
