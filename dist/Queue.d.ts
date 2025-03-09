export declare class Queue<T> {
    #private;
    concurrency: number;
    timeoutPromise: number;
    /**
     * Creates an instance of Queue.
     * @param concurrency - Maximum number of tasks to run in parallel.
     * @param timeoutPromise - Timeout for each task in milliseconds.
     */
    constructor(concurrency?: number, // Max parallel tasks
    timeoutPromise?: number);
    /**
     * Gets the number of tasks currently in the queue.
     *
     * @returns The number of tasks in the queue.
     */
    get length(): number;
    /**
     * Adds a new task to the queue.
     * @param item - A function that returns a promise representing the task.
     */
    push(item: () => Promise<T>): void;
    /**
     * Runs the tasks in the queue with concurrency control and timeout handling.
     * @returns A promise that resolves with the results and errors of the tasks.
     */
    run(): Promise<{
        data: T[];
        err: Error[];
    }>;
}
