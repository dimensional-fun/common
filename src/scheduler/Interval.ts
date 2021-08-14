import { TaskScheduler } from "./TaskScheduler";
import { Scheduled } from "./Scheduled";

export class Interval extends TaskScheduler {
    /**
     * Starts executing the configured task every `delay` milliseconds
     *
     * @param delay The delay between each execution.
     * @param args The arguments to pass.
     */
    start(delay: number, ...args: any[]): Interval {
        if (this.ref) {
            return this;
        }

        this.ref = setInterval(this._task, delay, ...args);
        return this;
    }

    /**
     * Disposes of this interval.
     */
    dispose(): void {
        if (this.ref) {
            clearInterval(this.ref);
            Scheduled.INTERVALS.delete(this.ref);
        }
    }
}
