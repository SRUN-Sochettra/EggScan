
## 2024-05-18 - [Optimizing Sequential Blocking I/O in Reactor]
**Learning:** Performing blocking network calls (like `block()` on a WebClient request) inside a loop negates the benefits of a reactive stack. This creates O(n) latency as each request waits for the previous one to complete.
**Action:** Use `Flux.fromIterable(items).flatMapSequential(...)` to fetch independent items concurrently while preserving the original order, falling back to a `.collectList().block()` only at the very end of the stream if a synchronous return type is strictly required by the calling method.
