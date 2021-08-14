import "./prototypes";

export * from "./functions";

export * from "./Collection";
export * from "./EventBus";

export * from "./types";

declare global {
    interface Array<T> {
        /**
         * Whether this array is empty, uses {@link Array#size} to determine the returned value.
         */
        isEmpty: boolean

        /**
         * Removes the first element that matches {@param value}
         *
         * @param value The value to remove.
         *
         * @returns T or undefined
         */
        removeFirst(value: T): T | undefined;
    }
}

