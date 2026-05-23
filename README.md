# 🥚 EggScan

![EggScan Cover Banner](cover.png)

<div align="center">
  <p><strong>Instantly scan, audit, and analyze GitHub profiles with Groq-powered AI.</strong></p>

  [![Java](https://img.shields.io/badge/Java-21-orange.svg?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
  [![React](https://img.shields.io/badge/React-18.3.1-blue.svg?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-5.4.8-purple.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.13-38bdf8.svg?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Groq AI](https://img.shields.io/badge/Groq%20AI-Llama--3-red.svg?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
</div>


---

## 📖 Table of Contents
- [✨ Core Features](#-core-features)
- [🥚 The Egg Verdict System](#-the-egg-verdict-system)
- [🏗️ Project Architecture](#️-project-architecture)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup (Spring Boot)](#backend-setup-spring-boot)
  - [Frontend Setup (Vite + React)](#frontend-setup-vite--react)
- [⚙️ Configuration & Environment Variables](#️-configuration--environment-variables)
- [🤝 Contributing](#-contributing)
- [🛡️ Security Policy](#️-security-policy)
- [📜 Code of Conduct](#-code-of-conduct)
- [📄 License](#-license)

---

## ✨ Core Features

*   **🔍 Comprehensive GitHub Profile Extraction**  
    Fetches user biography, pinned repositories, language distribution, and real-time contribution statistics.
*   **⚡ GraphQL-Optimized Queries**  
    Uses GitHub’s GraphQL API to retrieve deep metrics in a single network round-trip, optimizing token usage.
*   **🧠 Groq-Powered AI Audit**  
    Uses state-of-the-art LLMs on Groq's high-speed inference engine to analyze portfolio strength, detect coding patterns, and outline areas of improvement.
*   **🎭 Technical Verdict Generation**  
    Receives both a humorous "roast" and professional constructive feedback regarding code quality, repository layouts, and contribution consistency.
*   **🎨 Glassmorphic React Dashboard**  
    A dark-themed, premium UI built with Vite and Tailwind CSS featuring interactive feedback cards, live loaders, and responsive layouts.

---

## 🥚 The Egg Verdict System

EggScan grades your GitHub profile on a scale of **0 to 100** (the **Egg Score**) and assigns one of five egg-themed personality verdicts based on your codebase health, activity, and profile presentation:

| Verdict | Emoji | Score Range | Tagline | Description |
| :--- | :---: | :---: | :--- | :--- |
| **Golden Egg** | 🥚✨ | 80–100 | *recruiter ready* | Exceptional profile. Spotless repositories, active contributions, and perfect presentation. Ready for any recruiter. |
| **Hard Boiled** | 🍳 | 65–79 | *solid profile* | Strong developer presence. Solid repositories and consistent codebase patterns, with a few areas to polish. |
| **Fresh Egg** | 🐣 | 45–64 | *just getting started* | A budding developer profile. Shows clear potential and basic projects, but lacks depth or documentation. |
| **Cracked** | 🥚💔 | 25–44 | *needs work* | Incomplete or messy profile. Lacks pinned repositories, has sparse contributions, or needs major refactoring. |
| **Scrambled** | 🍳💀 | 0–24 | *do not apply yet* | Absolute chaos. Little to no activity, missing READMEs, or codebases that need immediate help. |

---

## 🏗️ Project Architecture

EggScan is structured as a monorepo containing decoupled backend (Java) and frontend (React) services:

```text
eggscan/
├── backend/                  # Spring Boot 3.3.4 (Java 21) REST API
│   ├── src/main/java/com/
│   │   └── eggscan/
│   │       ├── config/       # Security (CORS), GitHub, & Groq Configuration
│   │       ├── controller/   # REST Endpoints (/api/scan, /api/health)
│   │       ├── dto/          # Data Transfer Objects (ScanResponse, AIInsights)
│   │       ├── model/        # GitHub Profile, Repo, & Stats Entities
│   │       └── service/      # Core Logic (Groq, GitHub GraphQL, Scan Orchestrator)
│   ├── pom.xml               # Maven Dependency Management
│   ├── .env.example          # Environment Template for Backend
│   └── .env                  # Local Environment Variables (Git ignored)
│
├── frontend/                 # Vite + React Client
│   ├── src/
│   │   ├── api/              # API Integration Service (eggscan.js)
│   │   ├── components/       # Visual Cards, Verdicts, Forms & Animations
│   │   ├── App.jsx           # Dashboard Layout and State Controller
│   │   └── main.jsx          # React Mounting Entry Point
│   ├── tailwind.config.js    # Design Tokens & Styles Configuration
│   └── package.json          # Node Dependencies & Custom Scripts
│
├── .gitignore                # Global Git Rules
├── CONTRIBUTING.md           # Collaboration Guidelines
├── CODE_OF_CONDUCT.md        # Participant Expectations
└── SECURITY.md               # Security Disclosures & Vulnerability Reporting
```

---

## 🚀 Getting Started

### Prerequisites
Before running the application, make sure you have installed:
*   [Java Development Kit (JDK) 21+](https://adoptium.net/temurin/releases/?version=21)
*   [Apache Maven 3.9+](https://maven.apache.org/)
*   [Node.js 18+](https://nodejs.org/) (npm 9+)

---

### Backend Setup (Spring Boot)

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create your local environment file:
    ```bash
    cp .env.example .env
    ```
3.  Open `.env` and fill in your credentials (see [Configuration](#️-configuration--environment-variables) below):
    ```env
    GITHUB_TOKEN=your_personal_access_token
    GROQ_API_KEY=your_groq_api_key
    ```
4.  Build and run the Spring Boot application using Maven:
    ```bash
    mvn clean spring-boot:run
    ```
    The server will start on **`http://localhost:8080`**. You can verify it is running by hitting the health check endpoint: [http://localhost:8080/api/health](http://localhost:8080/api/health).

---

### Frontend Setup (Vite + React)

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install the package dependencies:
    ```bash
    npm install
    ```
3.  Start the local development server:
    ```bash
    npm run dev
    ```
    The web client will launch on **`http://localhost:5173`** (or another port outputted to the console). It will automatically proxy API requests to the backend server.

---

## ⚙️ Configuration & Environment Variables

### Backend Configuration
The backend depends on the following keys set in `backend/.env`:

| Variable Name | Required | Description | Link |
| :--- | :--- | :--- | :--- |
| `GITHUB_TOKEN` | **Yes** | Classic Personal Access Token or Fine-Grained Token to bypass rate limits. | [GitHub Settings](https://github.com/settings/tokens) |
| `GROQ_API_KEY` | **Yes** | Groq Cloud platform token used for fast Llama model queries. | [Groq Console](https://console.groq.com/keys) |

### Frontend Configuration
By default, the React client points to `http://localhost:8080`. If you run the API backend on a different port or host, specify it in your shell environment or a `.env` file inside the `frontend/` directory:

```env
VITE_API_URL=https://api.yourdomain.com
```

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Please read our [CONTRIBUTING.md](file:///d:/Users/ROG/Documents/School_Projects/Vibe/eggscan/CONTRIBUTING.md) to learn how to open pull requests, submit issues, and write clean code for EggScan.

---

## 🛡️ Security Policy
If you discover a security vulnerability within EggScan, please review our [SECURITY.md](file:///d:/Users/ROG/Documents/School_Projects/Vibe/eggscan/SECURITY.md) guidelines on how to report it privately. **Do not create public GitHub issues for security vulnerabilities.**

---

## 📜 Code of Conduct
We want to make participation in this project a welcoming and harassment-free experience for everyone. By collaborating on this project, you agree to adhere to the Contributor Covenant [CODE_OF_CONDUCT.md](file:///d:/Users/ROG/Documents/School_Projects/Vibe/eggscan/CODE_OF_CONDUCT.md).

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
