"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Queue_instances, _Queue_data, _Queue_errors, _Queue_results, _Queue_activeCount, _Queue_runTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    /**
     * Creates an instance of Queue.
     * @param concurrency - Maximum number of tasks to run in parallel.
     * @param timeoutPromise - Timeout for each task in milliseconds.
     */
    constructor(concurrency = 5, // Max parallel tasks
    timeoutPromise = 10000 // Timeout in ms
    ) {
        _Queue_instances.add(this);
        this.concurrency = concurrency;
        this.timeoutPromise = timeoutPromise;
        // Private properties to store tasks, errors, results, and active task count
        _Queue_data.set(this, []);
        _Queue_errors.set(this, []);
        _Queue_results.set(this, []);
        _Queue_activeCount.set(this, 0);
    }
    /**
     * Gets the number of tasks currently in the queue.
     *
     * @returns The number of tasks in the queue.
     */
    get length() {
        return __classPrivateFieldGet(this, _Queue_data, "f").length;
    }
    /**
     * Adds a new task to the queue.
     * @param item - A function that returns a promise representing the task.
     */
    push(item) {
        __classPrivateFieldGet(this, _Queue_data, "f").push(item);
    }
    /**
     * Runs the tasks in the queue with concurrency control and timeout handling.
     * @returns A promise that resolves with the results and errors of the tasks.
     */
    async run() {
        return new Promise((resolve) => {
            const next = async () => {
                var _a;
                // Start running tasks concurrently
                const tasks = [];
                while (__classPrivateFieldGet(this, _Queue_activeCount, "f") < this.concurrency && __classPrivateFieldGet(this, _Queue_data, "f").length > 0) {
                    __classPrivateFieldSet(this, _Queue_activeCount, (_a = __classPrivateFieldGet(this, _Queue_activeCount, "f"), _a++, _a), "f");
                    const task = __classPrivateFieldGet(this, _Queue_data, "f").shift();
                    const taskPromise = __classPrivateFieldGet(this, _Queue_instances, "m", _Queue_runTask).call(this, task).finally(() => {
                        var _a;
                        __classPrivateFieldSet(this, _Queue_activeCount, (_a = __classPrivateFieldGet(this, _Queue_activeCount, "f"), _a--, _a), "f");
                        next(); // Immediately start new task when one finishes
                    });
                    tasks.push(taskPromise);
                }
                // Once all tasks are finished, resolve
                await Promise.allSettled(tasks);
                if (__classPrivateFieldGet(this, _Queue_data, "f").length === 0 && __classPrivateFieldGet(this, _Queue_activeCount, "f") === 0) {
                    resolve({ data: __classPrivateFieldGet(this, _Queue_results, "f"), err: __classPrivateFieldGet(this, _Queue_errors, "f") });
                }
            };
            next(); // Start processing tasks
        });
    }
}
exports.Queue = Queue;
_Queue_data = new WeakMap(), _Queue_errors = new WeakMap(), _Queue_results = new WeakMap(), _Queue_activeCount = new WeakMap(), _Queue_instances = new WeakSet(), _Queue_runTask = 
// Private method to run a single task with timeout handling
async function _Queue_runTask(task) {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Task timed out")), this.timeoutPromise));
    try {
        const result = await Promise.race([task(), timeoutPromise]);
        __classPrivateFieldGet(this, _Queue_results, "f").push(result);
    }
    catch (error) {
        __classPrivateFieldGet(this, _Queue_errors, "f").push(error);
    }
};
