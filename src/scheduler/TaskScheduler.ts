export abstract class TaskScheduler {
    /**
     * The NodeJS timeout ref.
     */
    ref?: NodeJS.Timeout;

    /**
     * The provided task to execute.
     * @protected
     */
    protected _task!: Task;

    /**
     * @param task The provided task.
     */
    public constructor(task: Task) {
        Reflect.defineProperty(this, "_task", { value: task });
    }

    /**
     * Start's this scheduled task.
     *
     * @param delay The delay in which to execute this task.
     * @param args The arguments to pass.
     */
    abstract start(delay: number, ...args: any[]): TaskScheduler;

    /**
     * Cancels this Scheduled task.
     */
    abstract dispose(): void;
}

export type Task = (...args: any[]) => void;
