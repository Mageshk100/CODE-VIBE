# Code Vibe — AI-Powered Coding Workspace

> **Phase 1 (Complete Frontend)** & **Phase 2 (Backend, MySQL & Authentication Complete)**

Code Vibe empowers learners to paste code, upload individual source files, receive structured step-by-step explanations, and ask follow-up questions within a persistent coding session.

---

## 1. System Architecture

```
Code Vibe Platform
├── Frontend (React 19 + Vite + Tailwind CSS + Monaco Editor + Three.js)
│   ├── Authentication via Firebase Auth (Email/Password, Google Sign-in, Password Reset)
│   ├── Unified API Client (Automatic Bearer Token injection)
│   ├── Main Coding Workspace (Desktop Resizable Split, Mobile Segmented View)
│   ├── Monaco Code Editor with 5 languages & file uploads (.py, .java, .c, .cpp, .js)
│   ├── Structured 5-Part AI Breakdown & Contextual Follow-up Chat
│   └── Multi-Theme Support (Light, Dark, System)
│
└── Backend (Node.js + Express.js + MySQL + Firebase Admin SDK)
    ├── Security: Helmet, CORS, Rate Limiting, Centralized Error Handling
    ├── Auth Verification: Bearer ID-token decoding & MySQL profile synchronization
    ├── Role-Based Access Control: 'student' and 'admin' roles
    ├── Database: MySQL (mysql2 connection pooling + migration system)
    │   ├── users table (firebase_uid, email, display_name, role)
    │   ├── coding_sessions table (user_id FK, title, language, original_code, explanation)
    │   └── chat_messages table (session_id FK, role, message)
    ├── Session Ownership: Strict user isolation (students cannot access each other's sessions)
    └── Admin APIs: Protected metrics & user listings (/api/admin/stats, /api/admin/users)
```

---

## 2. Quick Start & Local Setup

### Prerequisites
- Node.js (v20+)
- npm (v9+)
- MySQL (Optional for local development; server features an automatic fallback store if MySQL daemon is not running)

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Environment Configuration
The repository includes `.env.example` templates:
- `backend/.env.example` -> `backend/.env`
- `.env.example` -> `.env`

Default configuration works out of the box with development tokens and local fallback persistence.

### 3. Start Backend & Frontend
In separate terminal tabs:

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)*

**Terminal 2 — Frontend:**
```bash
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 3. Testing & Verification

Run the automated integration test suites:

- **Backend Integration Tests** (25/25 Tests):
  ```bash
  node backend/scripts/test_backend.mjs
  ```
- **Full-Stack Verification** (17/17 Tests):
  ```bash
  node scripts/test_phase2_fullstack.mjs
  ```
- **Frontend Quality Audit** (58/58 Tests):
  ```bash
  node scripts/audit_suite.mjs
  ```
- **Production Build**:
  ```bash
  npm run build
  ```

---

## 4. Phase 2 Deliverables Summary

1. **Express Backend**: Modular architecture in `backend/` with controllers, services, middleware, and routes.
2. **MySQL Database**: `mysql2` connection pooling, migrations (`001_create_tables.sql`), and health check (`/api/health/db`).
3. **Firebase Authentication**: Client SDK (`firebase/auth`) + Backend token verification (`firebase-admin`).
4. **Auth Flows**: Email/password registration, login, Google sign-in, password reset, and logout.
5. **Roles & RBAC**: `student` and `admin` roles; admin APIs protected with `authorize('admin')`.
6. **Owner-Controlled Admin Creation**: CLI script `backend/scripts/createAdmin.js`.
7. **Session Ownership Enforcement**: Students can only access and message their own sessions (returns 403 otherwise).
8. **Guest Access**: Temporary local sessions with configurable expiry, completely separated from MySQL registered data.
9. **Persistent Registered Sessions**: Coding sessions and follow-up chat messages stored in the database.
10. **Admin APIs**: Protected endpoints for user metrics (`/api/admin/stats`) and listings (`/api/admin/users`).
