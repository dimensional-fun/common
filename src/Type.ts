/**
 * @file Originally made by the dirigeants team.
 */

// @ts-expect-error I know this exists lol
const { getPromiseDetails } = process.binding("util");

const _parent: unique symbol = Symbol.for("Type#parent");
const _childKeys: unique symbol = Symbol.for("Type#childKeys");
const _childValues: unique symbol = Symbol.for("Type#childValues");

export class Type {
    value: unknown;
    is: string;

    [_parent]: Type | null | undefined;
    readonly [_childKeys] = new Map<string, Type>();
    readonly [_childValues] = new Map<string, Type>();

    constructor(value: unknown, parent?: Type | null) {
        this.value = value;
        this.is = Type.resolve(value);
        this[_parent] = parent;
    }

    private get childTypes(): string {
        if (!this[_childValues].size) {
            return "";
        }

        return `<${(this[_childKeys].size ? `${Type.list(this[_childKeys])}, ` : "") + Type.list(this[_childValues])}`;
    }

    static resolve(value: unknown): string {
        switch (typeof value) {
            case "object":
                return value === null
                    ? "null"
                    : (value.constructor && value.constructor.name) || "any";
            case "function":
                return `${value.constructor.name}(${value.length}-arity)`;
            case "undefined":
                return "void";
            default:
                return typeof value;
        }
    }

    private static list(values: Map<string, Type>): string {
        return values.has("any") ? "any" : [ ...values.values() ].sort().join(" | ");
    }

    toString(): string {
        this.check();
        return `${this.is}${this.childTypes}`;
    }

    private isCircular(): boolean {
        for (const parent of this.parents()) {
            if (parent?.value === this.value) {
                return true;
            }
        }

        return false;
    }

    private addValue(value: any) {
        const child = new Type(value, this);
        this[_childValues].set(child.is, child);
    }

    private addEntry([ key, value ]: [ any, any ]): void {
        const child = new Type(key, this);

        this[_childKeys].set(child.is, child);
        this.addValue(value);
    }

    private check(): string | void {
        if (Object.isFrozen(this)) {
            return;
        }

        const promise = getPromiseDetails(this.value);
        if (typeof this.value === "object" && this.isCircular()) {
            this.is = `[Circular:${this.is}]`;
        } else if (promise && promise[0]) {
            this.addValue(promise[1]);
        } else if (this.value instanceof Map) {
            for (const entry of this.value) {
                this.addEntry(entry);
            }
        } else if (Array.isArray(this.value) || this.value instanceof Set) {
            for (const value of this.value) {
                this.addValue(value);
            }
        } else if (this.is === "Object") {
            this.is = "any";
        }

        Object.freeze(this);
    }

    private * parents(): IterableIterator<Type | null | undefined> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current: Type | null | undefined = this;
        while ((current = current[_parent])) {
            yield current;
        }
    }
}
