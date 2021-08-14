/**
 * @file Originally made by the dirigeants team.
 */

// @ts-expect-error
const { getPromiseDetails } = process.binding("util");

export class Type {
    /**
     * The value to generate a deep type of.
     *
     * @type {any}
     */
    public value: unknown;

    /**
     * The shallow type of the value.
     *
     * @type {string}
     */
    public is: string;

    /**
     * The parent of this type.
     *
     * @type {?Type | null}
     */
    #parent: Type | null | undefined;

    /**
     * The child keys of this type.
     *
     * @type {Map<string, Type>}
     * @private
     */
    readonly #childKeys: Map<string, Type>;

    /**
     * The child values of this type.
     *
     * @type {Map<string, Type>}
     * @private
     */
    readonly #childValues: Map<string, Type>;

    /**
     * @param {any} value The value to generate a type of.
     * @param {Type | null} [parent] The parent type.
     */
    public constructor(value: unknown, parent?: Type | null) {
        this.value = value;
        this.is = Type.resolve(value);
        this.#parent = parent;
        this.#childKeys = new Map();
        this.#childValues = new Map();
    }

    /**
     * The type of string for the children of this Type.
     *
     * @type {string}
     */
    private get childTypes(): string {
        if (!this.#childValues.size) {
            return "";
        }

        return `<${(this.#childKeys.size ? `${Type.list(this.#childKeys)}, ` : "") + Type.list(this.#childValues)}`;
    }

    /**
     * Resolves the type name that defines the input.
     *
     * @param {any} value The value to get the type name of.
     * @returns {string}
     */
    public static resolve(value: unknown): string {
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

    /**
     * Joins the list of child types.
     *
     * @param {Map<string, Type>} values The values to list.
     * @returns {string}
     */
    private static list(values: Map<string, Type>): string {
        return values.has("any") ? "any" : [ ...values.values() ].sort().join(" | ");
    }

    /**
     * Get the string representation of this Type.
     *
     * @returns {string}
     */
    public toString(): string {
        this.check();
        return `${this.is}${this.childTypes}`;
    }

    /**
     * Checks if the value of this Type is a circular reference to any parent.
     *
     * @returns {boolean} Whether this type is a circular reference to any parent.
     * @private
     */
    private isCircular(): boolean {
        for (const parent of this.parents()) {
            if (parent?.value === this.value) {
                return true;
            }
        }

        return false;
    }

    /**
     * The subtype to create based on this.value's sub value.
     *
     * @param {any} value The value to add.
     * @private
     */
    private addValue(value: any) {
        const child = new Type(value, this);
        this.#childValues.set(child.is, child);
    }

    /**
     * The subtype to create based on this.value's entries.
     *
     * @param {[any, any]} entry The entry to add.
     */
    private addEntry([ key, value ]: [ any, any ]): void {
        const child = new Type(key, this);

        this.#childKeys.set(child.is, child);
        this.addValue(value);
    }

    /**
     * Get the type name that defines the value.
     *
     * @returns {?string}
     * @private
     */
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

    /**
     * Walks the types backwards, for checking circulars.
     *
     * @returns {IterableIterator}
     * @private
     */
    private * parents(): IterableIterator<Type | null | undefined> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current: Type | null | undefined = this;
        while ((current = current.#parent)) {
            yield current;
        }
    }
}
