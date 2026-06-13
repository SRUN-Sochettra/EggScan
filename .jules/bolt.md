## 2026-06-13 - [Sequential Blocking Calls in Spring WebFlux]
**Learning:** Avoid sequential blocking network calls in a Spring WebFlux backend (e.g. calling `.block()` in a loop) because it creates an O(n) latency issue.
**Action:** Use `Flux.fromIterable().flatMapSequential(...)` or similar reactive operations to execute requests concurrently while preserving order, which scales significantly better and reduces overall latency.
