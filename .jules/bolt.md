## 2026-06-15 - Concurrent GitHub API Calls
**Learning:** Found sequential blocking network calls in `ReadmeService.java` which causes O(n) latency during backend API interactions.
**Action:** Replaced iterative blocking calls with concurrent execution using `Flux.fromIterable().flatMapSequential(...)` to ensure API requests are made concurrently while preserving the original ordered Map structure, improving performance significantly when fetching multiple file contents.
## 2026-06-17 - Prevent Render Deployment Crash on Empty PORT
**Learning:** Spring Boot needs a fallback value for the server port when deployed on Render because Render evaluates the configuration differently on startup before injecting the `PORT` environment variable completely, causing the app to crash or hang.
**Action:** Ensure that `server.port` always has a fallback in all Spring configuration profiles (e.g., `${PORT:8080}`) to guarantee proper initialization.
## 2026-06-17 - Render Environment Variable Resolution Fix
**Learning:** Found `spring-dotenv` dependency overriding native OS environment variable resolution in production when a `.env` file was missing, causing empty fallbacks like `DB_PASSWORD` to be incorrectly applied on Render.
**Action:** Remove `me.paulschwarz:spring-dotenv` from the backend `pom.xml` so the application relies on standard Spring configuration rules and directly resolves environment variables injected by the Render runtime.
