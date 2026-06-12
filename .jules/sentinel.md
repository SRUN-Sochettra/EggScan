## 2024-10-14 - Prevent Information Leakage in Controller Error Responses
**Vulnerability:** The backend `ScanController` returned the raw exception message (`e.getMessage()`) directly to clients in the JSON response upon an error. This poses an information leakage risk because stack traces or internal implementation details could be inadvertently exposed to end-users.
**Learning:** Found instances where error handling in controllers caught generic `Exception e` and passed the message to the user response. The fix replaces the raw exception message with a generic, safe client-facing message ("An error occurred while processing the request").
**Prevention:** Always log exceptions securely on the server side (using SLF4J, e.g., `log.error()`) to retain debugging context, but return generic error messages to the client API response. Avoid passing unfiltered exception messages directly in API responses.
## 2024-06-11 - [CRITICAL] Fix Hardcoded Database Secrets in Application Config
**Vulnerability:** Hardcoded PostgreSQL database URL, username, and password in `backend/src/main/resources/application.yml`.
**Learning:** Hardcoded credentials in source control can expose the database to unauthorized access, potentially leading to data breaches or loss.
**Prevention:** Always use environment variables for sensitive configuration values like database credentials, API keys, and tokens. In Spring Boot, this is achieved using `${ENV_VAR_NAME}` syntax in `application.yml`.
