## 2026-06-15 - Concurrent GitHub API Calls
**Learning:** Found sequential blocking network calls in `ReadmeService.java` which causes O(n) latency during backend API interactions.
**Action:** Replaced iterative blocking calls with concurrent execution using `Flux.fromIterable().flatMapSequential(...)` to ensure API requests are made concurrently while preserving the original ordered Map structure, improving performance significantly when fetching multiple file contents.
