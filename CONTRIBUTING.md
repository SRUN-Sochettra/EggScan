# 🤝 Contributing to EggScan

Thank you for your interest in contributing to EggScan! Projects like this rely on community contributions to thrive, and we appreciate your time and efforts to make EggScan better.

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📖 Table of Contents
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features or Enhancements](#suggesting-features-or-enhancements)
  - [Code Contributions](#code-contributions)
- [Development Workflow](#development-workflow)
  - [Branching Policy](#branching-policy)
  - [Commit Messages](#commit-messages)
  - [Pull Request Checklist](#pull-request-checklist)
- [Style Guides & Coding Standards](#style-guides--coding-standards)
  - [Backend (Java & Spring Boot)](#backend-java--spring-boot)
  - [Frontend (React & Javascript)](#frontend-react--javascript)

---

## How Can I Contribute?

### Reporting Bugs
If you encounter a bug, please check the [existing Issues](https://github.com/your-username/eggscan/issues) to ensure it hasn't already been reported. If it's a new bug, open an issue and include:
*   A clear, descriptive title.
*   Steps to reproduce the behavior.
*   Expected vs. actual behavior.
*   Screenshots or error logs, if applicable.
*   Your operating system and environment details (Java version, Node version, browser, etc.).

> [!WARNING]
> If you find a security-related vulnerability, do **not** open a public issue. Refer to [SECURITY.md](SECURITY.md) for reporting guidelines.

### Suggesting Features or Enhancements
If you have an idea to improve EggScan:
1.  Check if a similar feature has already been proposed.
2.  Open an issue outlining:
    *   What problem does this feature solve?
    *   Describe the proposed solution or design.
    *   Provide any mockups or flowcharts if relevant.

### Code Contributions
Ready to write some code? Here is how to get started:
1.  Fork the repository and clone it locally.
2.  Create a branch for your work (see [Branching Policy](#branching-policy)).
3.  Implement your changes, keeping coding style and testing in mind.
4.  Push your branch to your fork and submit a Pull Request.

---

## Development Workflow

### Branching Policy
We follow a standard feature-branching workflow. Always branch off of the `main` branch.
Use descriptive branch names prefixing the type of change:
*   `feature/add-profile-comparison` (for new features)
*   `bugfix/fix-cors-issues` (for bug fixes)
*   `docs/update-readme-instructions` (for documentation)
*   `refactor/cleanup-scan-service` (for code refactoring)

### Commit Messages
Keep commit messages clear, concise, and structured. We recommend following the Conventional Commits specification:
*   `feat: add feedback animation to verdict card`
*   `fix: resolve null pointer exception in GitGraphQLService`
*   `docs: update contributing guidelines`
*   `style: format files in scan controller`

### Pull Request Checklist
Before submitting your Pull Request, ensure that:
*   [ ] The codebase compiles and runs locally without errors.
*   [ ] Backend code passes standard checkstyle rules.
*   [ ] Frontend code is formatted using Prettier/ESLint.
*   [ ] New code is covered by tests where appropriate.
*   [ ] Commit history is clean and does not contain temporary debug commits.
*   [ ] The PR description details the changes made and references any related issues (e.g., `Closes #12`).

---

## Style Guides & Coding Standards

### Backend (Java & Spring Boot)
*   **Version:** Java 21.
*   **Framework:** Spring Boot 3.x.
*   **Naming Conventions:** Standard camelCase for variables/methods, PascalCase for classes.
*   **Lombok:** Use Lombok annotations (`@Getter`, `@Setter`, `@RequiredArgsConstructor`) to reduce boilerplate.
*   **Dependency Injection:** Prefer constructor injection over field injection (`@Autowired`).

### Frontend (React & Javascript)
*   **Version:** React 18+ (Vite builder).
*   **Styling:** Use Tailwind CSS utility classes and write clean layout grids. Avoid inline styles where possible.
*   **State Management:** Keep React state localized. If global state is needed, lift state or use context APIs.
*   **ES6+:** Use modern ES6 features (destructuring, arrow functions, template literals).
