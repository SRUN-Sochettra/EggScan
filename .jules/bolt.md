## 2024-06-25 - [Testing `try-catch` blocks and asynchronous states with React Testing Library]
**Learning:** Testing React component loading and error states requires precise control over mock promises. Instead of simply mocking a resolved or rejected value, returning an unresolved Promise and storing the `resolve`/`reject` functions allows the test to explicitly verify the "loading" state in the DOM before resolving or rejecting to test the final state.
**Action:** Use the `new Promise((resolve, reject) => { ... })` pattern in test setups for functions returning promises when intermediate UI states (like loading spinners or text) need to be verified during the asynchronous operation.
## 2026-06-19 - Added tests and error handling to Leaderboard
**Learning:** Adding test coverage for basic unhandled exception paths (e.g. empty catch block) frequently uncovers UX opportunities like providing meaningful feedback for users rather than just swallowing errors.
**Action:** When I notice an empty catch block while adding tests, I will proactively implement basic visual error states (like an error state message) to ensure a more robust and resilient UI component.
## 2026-06-19 - Testing Mono exceptions in WebClient mocks
**Learning:** When using Mockito to mock Spring WebFlux `WebClient` behaviors, returning `Mono.error()` from the mocked chain may not be sufficient to trigger synchronous exception handling blocks (like `catch (Exception e)`) around `.block()`. Instead, using `thenThrow()` directly on the mocked WebClient method execution (like `when(webClient.post()).thenThrow(...)`) correctly simulates synchronous exceptions thrown by `WebClient` methods.
**Action:** When testing synchronous try-catch blocks that wrap reactive WebClient calls terminating in `.block()`, I will use `thenThrow()` on the mock setup instead of `Mono.error()` to accurately simulate exception paths.
## 2024-05-14 - Remove unused code (IconEgg)
**Learning:** Found an unused React component `IconEgg` in `frontend/src/components/Icons.jsx`.
**Action:** Removed dead code to reduce complexity and improve maintainability of the codebase, ensuring no unused imports or exports are left behind.
## 2026-06-19 - Simulating exceptions in WebClient tests
**Learning:** To accurately test fallback behavior when a `WebClient` call fails (specifically during the `.block()` phase), the test should simulate the failure by returning an error signal from the mock chain (e.g., using `mockWebClientResponse(Mono.error(new RuntimeException(...)))`). This approach accurately mimics network or parsing errors that manifest during sequence evaluation, whereas using `.thenThrow(...)` on the initial `.post()` method incorrectly simulates a failure during request construction.
**Action:** When mocking WebFlux `WebClient` calls that complete via `.block()`, I will use `Mono.error(...)` in the mock setup to verify exception handling logic rather than throwing an exception during the request-building phase.
## 2026-06-20 - Extracted API Error Handling\n**Learning:** DRY (Don't Repeat Yourself) principle applies heavily to API interactions; extracting common response handling, like standard error checking and JSON parsing, into utility functions improves both readability and maintainability without changing behavior.\n**Action:** Look for repeated  boilerplate in network calls during code reviews and extract it to a shared handler.
## 2024-05-19 - Extracted API Error Handling
**Learning:** DRY (Don't Repeat Yourself) principle applies heavily to API interactions; extracting common response handling, like standard error checking and JSON parsing, into utility functions improves both readability and maintainability without changing behavior.
**Action:** Look for repeated `if (!res.ok)` boilerplate in network calls during code reviews and extract it to a shared handler.
## 2026-06-20 - Battle Scan Concurrency Optimization
**Learning:** Sequential external API calls (e.g., executing two separate scans) in Spring Boot can cause significant latency duplication.
**Action:** Use `CompletableFuture.supplyAsync()` paired with a custom `ThreadPoolTaskExecutor` to execute independent blocking/I/O-bound operations concurrently. Always use `CompletableFuture.allOf()` to safely gather the results.
## 2026-06-20 - Optimize GitHub API Calls with Flux flatMapSequential
**Learning:** In Spring WebFlux, when needing to iterate over a list of items and perform asynchronous blocking calls (like fetching files via `WebClient`), using a basic sequential loop blocks execution per item, creating an N+1 latency problem.
**Action:** Always replace sequential blocking I/O loops with `Flux.fromIterable(items).flatMapSequential(...)` when using WebFlux. This executes requests concurrently reducing the overall latency to O(1) in ideal conditions while preserving the response order. Remember to return reactive types (`Mono`) up the chain where possible instead of using `.block()`.
## 2026-06-20 - Test for Direct WebClient Exception
**Learning:** In Spring WebFlux, exceptions thrown directly by `WebClient.post()` (before the reactive chain is built) might not be covered by mocked Mono error returns. Adding tests for direct `RuntimeException` exceptions helps cover code paths for the outer try-catch block.
**Action:** When testing WebClient exception handling, ensure to simulate both reactive `Mono.error()` stream errors and direct method exceptions.
## 2026-06-20 - Optimize GitHub API Calls in repoDeepDive
**Learning:** Sequential blocking network calls in Spring WebFlux controllers can introduce O(n) latency bottlenecks, specifically when making N+1 API calls sequentially. Using `Flux.fromIterable().flatMapSequential()` to fetch configuration files concurrently while preserving order dramatically improves performance.
**Action:** When performing multiple parallelizable I/O operations (like API requests) in Spring Boot, use reactive tools like `Flux.flatMapSequential()` instead of sequential `for` loops and `.block()`.
## 2026-06-20 - Testing WebClientResponseException in WebFlux
**Learning:** Testing `WebClient` error paths requires mocking the specific exceptions thrown by the framework, such as `WebClientResponseException`, which is commonly thrown during `retrieve().bodyToMono().block()` when HTTP errors occur.
**Action:** Include a dedicated test for `WebClientResponseException` alongside generic `RuntimeException` tests when verifying `WebClient` exception fallback logic.
