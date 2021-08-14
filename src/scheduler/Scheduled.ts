import { Interval } from "./Interval";
import { Timeout } from "./Timeout";

import type { Task } from "./TaskScheduler";

export namespace Scheduled {
    /**
     * All scheduled intervals.
     */
    export const INTERVALS = new Set<NodeJS.Timeout>();

    /**
     * All scheduled timeouts.
     */
    export const TIMEOUTS = new Set<NodeJS.Timeout>();

    /**
     * Disposes of all intervals in {@link INTERVALS}
     *
     * @returns {number}
     */
    export function clearIntervals(): number {
        if (!INTERVALS.size) {
            return 0;
        }

        let disposedOf = 0;
        for (const interval of INTERVALS) {
            INTERVALS.delete(interval);
            clearInterval(interval);
            disposedOf++;
        }

        return disposedOf;
    }

    /**
     * Disposes of each scheduled timeout in {@link TIMEOUTS}.
     *
     * @returns {number} The number of intervals that were disposed of.
     */
    export function clearTimeouts(): number {
        if (!TIMEOUTS.size) {
            return 0;
        }

        let disposedOf = 0;
        for (const timeout of TIMEOUTS) {
            TIMEOUTS.delete(timeout);
            clearTimeout(timeout);
            disposedOf++;
        }

        return disposedOf;
    }

    /**
     * Disposes of all timeouts and intervals
     *
     * @see TIMEOUTS
     * @see INTERVALS
     *
     * @returns {Array} where index 0 is the number of cleared timeouts and index 1 is the number of cleared intervals.
     */
    export function clear(): [ timeouts: number, intervals: number ] {
        const timeouts = clearTimeouts(),
            intervals = clearIntervals();

        return [ timeouts, intervals ];
    }
}

/**
 * Creates a new {@link Interval}
 *
 * @param delay Delay between each execution
 * @param block The block to execute
 * @param args Arguments to pass
 */
export function createInterval(delay: number, block: Task, ...args: any[]): Interval {
    return new Interval(block).start(delay, ...args);
}

/**
 * Creates a new {@link Timeout}
 *
 * @param delay Delay until execution
 * @param block The block to execute.
 * @param args Arguments to pass.
 */
export function createTimeout(delay: number, block: Task, ...args: any[]): Timeout {
    return new Timeout(block).start(delay, ...args);
}
