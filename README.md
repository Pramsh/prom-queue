# Queue

A TypeScript implementation of a concurrency queue that allows you to run tasks with a specified maximum number of parallel executions and a timeout for each task.

## Features

- Concurrency control: Limit the number of tasks running in parallel.
- Timeout handling: Set a timeout for each task to prevent long-running tasks from blocking the queue.
- Error handling: Collect errors from failed tasks.

## Installation

```sh
npm install path-to-your-queue-package
```

## Usage

```typescript
import Queue from 'path-to-your-queue-package/Queue';

const queue = new Queue<number>(3, 5000); // 3 concurrent tasks, 5 seconds timeout

queue.push(async () => {
    // Task 1
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 1;
});

queue.push(async () => {
    // Task 2
    await new Promise(resolve => setTimeout(resolve, 2000));
    return 2;
});

queue.push(async () => {
    // Task 3
    await new Promise(resolve => setTimeout(resolve, 3000));
    return 3;
});

queue.run().then(({ data, err }) => {
    console.log('Results:', data); // [1, 2, 3]
    console.log('Errors:', err); // []
});
```

## API

### `Queue<T>`

#### Constructor

```typescript
constructor(concurrency: number = 5, timeoutPromise: number = 10000)
```

- `concurrency`: Maximum number of tasks to run in parallel.
- `timeoutPromise`: Timeout for each task in milliseconds.

#### Methods

- `push(item: () => Promise<T>): void`
  - Add a new task to the queue.

- `run(): Promise<{ data: T[], err: Error[] }>`
  - Run all tasks in the queue and return a promise that resolves with the results and errors.

## License

MIT

