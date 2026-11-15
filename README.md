# Code Vibe — Your AI-Powered Coding Companion

**Understand code better. Learn faster. Build with confidence.**

Code Vibe is an AI-powered coding workspace designed to help students and developers understand code more easily. Instead of simply displaying code, it breaks down how a program works through structured, step-by-step explanations.

You can paste code or upload a source file, explore its logic, ask follow-up questions, and revisit your previous coding sessions — all in one workspace.

🌐 **Live Website:** [https://code-vibe-seven.vercel.app/](https://code-vibe-seven.vercel.app/)

---

## ✨ What Can You Do with Code Vibe?

- **Understand Your Code:** Get structured, step-by-step AI explanations of your code.
- **Upload Source Files:** Upload individual `.py`, `.java`, `.c`, `.cpp`, and `.js` files.
- **Ask Follow-up Questions:** Continue the conversation and clarify specific parts of your code.
- **Save Coding Sessions:** Registered users can revisit their previous explanations and conversations.
- **Code in a Familiar Environment:** Use the Monaco Editor with syntax highlighting.
- **Choose Your Theme:** Switch between Light, Dark, and System modes.
- **Access Your Workspace Anywhere:** Use the responsive interface on desktop and mobile.

## 🏗️ Tech Stack

| Area | Technologies |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Code Editor | Monaco Editor |
| UI & Animations | Three.js |
| Backend | Node.js, Express.js |
| Database | MySQL, mysql2 |
| Authentication | Firebase Authentication, Firebase Admin SDK |
| AI Integration | Google Gemini API |
| Security | Helmet, CORS, Rate Limiting |

## 🧩 System Architecture

```text
Code Vibe
│
├── Frontend
│   ├── React 19 + Vite
│   ├── Tailwind CSS + Three.js
│   ├── Monaco Code Editor
│   ├── Firebase Authentication
│   ├── Unified API Client
│   ├── AI Explanation Workspace
│   └── Follow-up Chat
│
└── Backend
    ├── Node.js + Express.js
    ├── Firebase Admin Authentication
    ├── Google Gemini API
    ├── MySQL Connection Pool
    ├── Session Management
    ├── Role-Based Access Control
    └── Protected Admin APIs
```

## 🔐 Authentication & Data Management

Code Vibe uses Firebase Authentication for account management and MySQL for persistent user data.

Key features include:

- Email and password registration and login.
- Google sign-in and password reset flows.
- Backend verification of Firebase ID tokens.
- Automatic synchronization of user profiles with MySQL.
- Role-based access for students and administrators.
- Session ownership checks to keep user data private.
- Separate guest sessions and registered-user sessions.

## 🗄️ Database Structure

The application uses three primary MySQL tables:

| Table | Purpose |
|---|---|
| `users` | Stores user profiles, Firebase UIDs, email addresses, and roles. |
| `coding_sessions` | Stores submitted code, language, explanations, and session details. |
| `chat_messages` | Stores user and AI messages associated with coding sessions. |

Foreign key constraints maintain relationships between users, sessions, and chat messages.

## 🚀 Getting Started

Want to run Code Vibe locally? Follow these steps.

### Prerequisites

- Node.js v20 or later
- npm v9 or later
- MySQL (optional for local development; a fallback store is available when the MySQL service is unavailable)

### 1. Clone the Repository

```bash
git clone https://github.com/Mageshk100/CODE-VIBE.git
cd CODE-VIBE
```

### 2. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### 3. Configure Environment Variables

Create your environment files using the provided templates:

- Copy `.env.example` to `.env`.
- Copy `backend/.env.example` to `backend/.env`.

Add the required Firebase, Gemini, and database configuration values.

**Note:** Use your own credentials. Never commit `.env` files or expose API keys and service account credentials publicly.

### 4. Start the Backend

Open a terminal:

```bash
cd backend
npm start
```

Backend runs at:

`http://localhost:5000`

Health check:

`http://localhost:5000/api/health`

### 5. Start the Frontend

Open another terminal from the project root:

```bash
npm run dev
```

Frontend runs at:

`http://localhost:5173`

## 🧪 Testing & Verification

The project includes automated test and verification scripts.

| Test Suite | Reported Result |
|---|---:|
| Backend Integration Tests | 25/25 |
| Full-Stack Verification | 17/17 |
| Frontend Quality Audit | 58/58 |
| Production Build | `npm run build` |

Run the tests from the project root:

```bash
# Backend integration tests
node backend/scripts/test_backend.mjs

# Full-stack verification
node scripts/test_phase2_fullstack.mjs

# Frontend quality audit
node scripts/audit_suite.mjs

# Production build
npm run build
```

## 📌 Project Status

- **Phase 1 — Frontend Development:** Completed.
- **Phase 2 — Backend, MySQL & Authentication:** Completed.
- **Phase 3 — AI Integration & Production Deployment:** Integrated and deployed; ongoing testing and improvements.

## 🌱 What's Next?

Code Vibe is an evolving project. The focus is on improving explanation quality, making AI interactions more reliable, and refining the overall learning experience.

## 👨‍💻 About the Project

Built as a practical project to make programming easier to understand through AI-assisted learning.

**Code Vibe — Don't just read code. Understand it.**

---

⭐ If you find Code Vibe useful, consider giving the repository a star!
