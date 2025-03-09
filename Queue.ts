
class Queue<T> {
    // Private properties to store tasks, errors, results, and active task count
    #data: (() => Promise<T>)[] = [];
    #errors: Error[] = [];
    #results: T[] = [];
    #activeCount = 0;

    /**
     * Creates an instance of Queue.
     * @param concurrency - Maximum number of tasks to run in parallel.
     * @param timeoutPromise - Timeout for each task in milliseconds.
     */
    constructor(
        public concurrency: number = 5, // Max parallel tasks
        public timeoutPromise: number = 10000 // Timeout in ms
    ) {}

    /**
     * Gets the number of tasks currently in the queue.
     * 
     * @returns The number of tasks in the queue.
     */
    get length() {
        return this.#data.length;
    }

    /**
     * Adds a new task to the queue.
     * @param item - A function that returns a promise representing the task.
     */
    push(item: () => Promise<T>) {
        this.#data.push(item);
    }

    /**
     * Runs the tasks in the queue with concurrency control and timeout handling.
     * @returns A promise that resolves with the results and errors of the tasks.
     */
    async run(): Promise<{ data: T[], err: Error[] }> {
        return new Promise((resolve) => {
            const next = async () => {
                // Start running tasks concurrently
                const tasks = [];

                while (this.#activeCount < this.concurrency && this.#data.length > 0) {
                    this.#activeCount++;
                    const task = this.#data.shift()!;
                    const taskPromise = this.#runTask(task).finally(() => {
                        this.#activeCount--;
                        next(); // Immediately start new task when one finishes
                    });
                    tasks.push(taskPromise);
                }

                // Once all tasks are finished, resolve
                await Promise.allSettled(tasks);

                if (this.#data.length === 0 && this.#activeCount === 0) {
                    resolve({ data: this.#results, err: this.#errors });
                }
            };

            next(); // Start processing tasks
        });
    }

    // Private method to run a single task with timeout handling
    async #runTask(task: () => Promise<T>): Promise<void> {
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Task timed out")), this.timeoutPromise)
        );

        try {
            const result = await Promise.race([task(), timeoutPromise]);
            this.#results.push(result);
        } catch (error) {
            this.#errors.push(error as Error);
        }
    }
}