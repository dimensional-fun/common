import { createTimeout } from "./scheduler";

export class Mutex {
    #_queue: Entry[] = [];
    #_current?: Release;

    get locked(): boolean {
        return this.#_queue.length > 0;
    }

    /**
     * Blocks the event loop for an x amount of milliseconds.
     *
     * @param duration How long to block the event loop.
     */
    static async wait(duration: number): Promise<void> {
        return new Promise(resolve => createTimeout(duration, resolve));
    }

    async take(): Promise<Release> {
        const locked = this.locked,
            prom = new Promise<Release>((resolve, reject) => {
                this.#_queue.push({
                    resolve,
                    reject
                });
            });

        if (!locked) {
            this.release();
        }

        return prom;
    }

    cancel(): void {
        while (this.#_queue) {
            const entry = this.#_queue.shift();
            if (!entry) {
                break;
            }

            entry.reject();
        }
    }

    private release() {
        const next = this.#_queue.shift();
        if (!next) {
            return;
        }

        let released = false;
        this.#_current = () => {
            if (released) {
                return;
            }

            released = true;
            this.release();
        };

        next.resolve(this.#_current);
    }
}


type Release = () => void;
type Entry = {
    reject(): void;
    resolve(release: Release): void;
}
