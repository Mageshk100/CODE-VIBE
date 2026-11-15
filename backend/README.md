# Code Vibe Backend — Phase 2

Express.js REST API with MySQL, Firebase Authentication, and Role-Based Access Control for Code Vibe.

---

## 1. Technologies

- **Runtime**: Node.js (v20+) (ES Modules)
- **Framework**: Express.js
- **Database Driver**: `mysql2` (Connection pooling & parameterized queries)
- **Auth Provider**: Firebase Admin SDK (`firebase-admin`)
- **Security**: `helmet`, `cors`, `express-rate-limit`
- **Validation**: `zod`

---

## 2. Environment Variables

Create `.env` inside `backend/`:

```env
PORT=5000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=code_vibe

# Firebase Admin SDK
FIREBASE_PROJECT_ID=code-vibe-demo
FIREBASE_CLIENT_EMAIL=your-firebase-service-email@iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Frontend Origin for CORS
FRONTEND_URL=http://localhost:5173
```

---

## 3. Database Schema & Migrations

The database consists of three relational tables:
1. `users`: Stores user profiles, Firebase UIDs, emails, roles (`student`, `admin`), timestamps.
2. `coding_sessions`: Stores submitted code samples, titles, languages, AI explanations, user foreign keys.
3. `chat_messages`: Stores contextual follow-up messages linked to specific sessions with roles (`user`, `assistant`).

### Run Migrations:
```bash
npm run migrate
```

---

## 4. API Endpoints

### Health
- `GET /api/health` — Server health check
- `GET /api/health/db` — MySQL connection pool health check

### Authentication & Users
- `POST /api/auth/sync` — Verify Firebase ID token & sync profile with MySQL (Bearer token required)
- `GET /api/users/me` — Retrieve authenticated user profile
- `PATCH /api/users/me` — Update display name

### Coding Sessions (Ownership Protected)
- `POST /api/sessions` — Create a new coding session
- `GET /api/sessions` — List authenticated user's session history (most recent first, paginated)
- `GET /api/sessions/:id` — Retrieve full session details with chat messages
- `PATCH /api/sessions/:id` — Update session title or explanation
- `POST /api/sessions/:id/messages` — Add follow-up question/response

### Admin (Role-Based Access)
- `GET /api/admin/stats` — Total registered users & coding sessions
- `GET /api/admin/users` — List registered users with session counts

---

## 5. Admin Provisioning

To promote or create an admin user:
```bash
node scripts/createAdmin.js <user-email>
# Example: node scripts/createAdmin.js admin@codevibe.app
```
