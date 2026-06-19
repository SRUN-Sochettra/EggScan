## 2024-06-25 - [Testing `try-catch` blocks and asynchronous states with React Testing Library]
**Learning:** Testing React component loading and error states requires precise control over mock promises. Instead of simply mocking a resolved or rejected value, returning an unresolved Promise and storing the `resolve`/`reject` functions allows the test to explicitly verify the "loading" state in the DOM before resolving or rejecting to test the final state.
**Action:** Use the `new Promise((resolve, reject) => { ... })` pattern in test setups for functions returning promises when intermediate UI states (like loading spinners or text) need to be verified during the asynchronous operation.
## 2026-06-19 - Added tests and error handling to Leaderboard
**Learning:** Adding test coverage for basic unhandled exception paths (e.g. empty catch block) frequently uncovers UX opportunities like providing meaningful feedback for users rather than just swallowing errors.
**Action:** When I notice an empty catch block while adding tests, I will proactively implement basic visual error states (like an error state message) to ensure a more robust and resilient UI component.
