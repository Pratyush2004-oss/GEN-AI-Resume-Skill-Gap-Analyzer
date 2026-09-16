# 🤖 GenAI Interview Prep & Resume Builder

An AI-powered interview preparation platform that generates personalized interview reports, skill gap analysis, preparation plans, and ATS-friendly resumes — all tailored to specific job descriptions using Google Gemini AI.

---

## ✨ Features

- **AI Interview Reports** — Technical & behavioral questions with answer strategies
- **Skill Gap Analysis** — Identify weaknesses with severity ratings
- **Preparation Plans** — Day-by-day study schedules
- **Resume Generator** — ATS-optimized, magazine-quality PDF resumes
- **Authentication** — Secure JWT-based auth with access/refresh tokens
- **File Upload** — PDF resume parsing via Multer

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, React Router, React Query, Sass |
| Backend | Node.js, Express 5, ES Modules |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini (`@google/genai`) |
| PDF | Puppeteer (headless Chrome) |
| Auth | JWT (jsonwebtoken), bcryptjs, cookie-parser |
| Validation | Zod |

---

## 📁 Project Structure

```
├── backend/
│   ├── server.js                 # Entry point — starts Express & connects DB
│   ├── src/
│   │   ├── app.js                # Express app config (CORS, routes, error handler)
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── controllers/          # Route handlers (auth, interview)
│   │   ├── middleware/           # Auth middleware, file upload (Multer)
│   │   ├── models/               # Mongoose schemas (User, InterviewReport)
│   │   ├── routes/               # API route definitions
│   │   └── services/             # Gemini AI service, PDF generation
│   └── .env                      # Environment variables (not committed)
├── frontend/
│   ├── src/
│   │   ├── features/             # Feature modules (Interview, Auth)
│   │   ├── components/           # Shared UI components
│   │   ├── services/             # API client (Axios)
│   │   └── styles/               # Global SCSS styles
│   └── vite.config.ts
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 (recommended: 20+)
- **npm** (comes with Node)
- A **MongoDB Atlas** account (free tier works)
- A **Google AI Studio** account (free tier available)

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

---

### 2. Backend Setup

#### a) Install dependencies

```bash
cd backend
npm install
```

This installs: Express, Mongoose, Gemini AI SDK, JWT, bcryptjs, Puppeteer, Zod, Multer, and more.

#### b) Create your `.env` file

```bash
cp .env.example .env
```

Then fill in each variable — see the [Environment Variables](#-environment-variables) section below for detailed setup guides.

#### c) Start the backend server

```bash
npm run dev
```

The server starts on `http://localhost:5000` (or the port you set in `.env`).

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server starts on `http://localhost:5173` and proxies API requests to the backend.

---

## 🔐 Environment Variables

Copy `.env.example` to `backend/.env` and fill in the values:

```bash
cp .env.example .env
```

Below is a guide for obtaining **every** key.

---

### `MONGODB_URI`

**What:** MongoDB connection string used by Mongoose to connect to your database.

**How to get it:**

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account.
2. Create a new **Free Tier (M0) cluster** — choose any cloud provider and region.
3. Under **Database Access**, create a database user:
   - Set a **username** and **password** (remember these).
   - Under "Database User Privileges", select **Read and write to any database**.
4. Under **Network Access**, click **Add IP Address**:
   - For local development, click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - For production, add only your server's IP.
5. Go to your cluster → click **Connect** → **Connect your application**.
6. Copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=YourApp
   ```
7. Replace `<username>` and `<password>` with the database user credentials you created.

**Value:**
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/interview-prep?retryWrites=true&w=majority
```

---

### `GEMINI_API_KEY`

**What:** API key for Google's Gemini AI — powers all interview report generation and resume creation.

**How to get it:**

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **Get API Key** (or go to the API Keys page in the left sidebar).
4. Click **Create API Key** — choose an existing project or create a new one.
5. Copy the generated API key (starts with `AIza...`).

> **Note:** The free tier gives you generous limits for development. For production, review Google's pricing page.

**Value:**
```
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### `ACCESS_TOKEN_SECRET`

**What:** A secret string used to **sign and verify JWT access tokens**. Access tokens expire after 15 minutes and are used to authenticate API requests.

**How to generate it:**

Run this in your terminal to get a cryptographically strong random string:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

This outputs a 128-character hex string. Copy the entire output.

> ⚠️ **Never commit this value to version control.** Keep it secret and unique per environment (dev/staging/production).

**Value:**
```
ACCESS_TOKEN_SECRET=a1b2c3d4e5f6...your-random-64-byte-hex-string...
```

---

### `REFRESH_TOKEN_SECRET`

**What:** A separate secret string used to **sign and verify JWT refresh tokens**. Refresh tokens expire after 7 days and are used to obtain new access tokens without re-logging in.

**How to generate it:**

Run this in your terminal (generate a **different** string from your access token secret):

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> ⚠️ Use a **different value** from `ACCESS_TOKEN_SECRET` — never reuse the same secret for both tokens.

**Value:**
```
REFRESH_TOKEN_SECRET=f6e5d4c3b2a1...your-different-random-64-byte-hex-string...
```

---

### `PORT`

**What:** The port the backend Express server listens on.

**Value:**
```
PORT=5000
```

---

### `NODE_ENV`

**What:** Controls environment-specific behavior:
- `development` — verbose error messages with stack traces, cookies use `SameSite: lax`
- `production` — hides stack traces from errors, cookies use `SameSite: none` + `Secure`

**Value:**
```
NODE_ENV=development
```

---

## 📋 Complete `.env.example` Reference

```env
# ── Database ──────────────────────────────────────────────
# MongoDB Atlas connection string
# Guide: https://www.mongodb.com/docs/atlas/tutorial/connect-to-your-cluster/
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority

# ── Google Gemini AI ──────────────────────────────────────
# API key from Google AI Studio
# Guide: https://aistudio.google.com/apikey
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── JWT Secrets ───────────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Used to sign access tokens (expire in 15m)
ACCESS_TOKEN_SECRET=your-access-token-secret-here
# Used to sign refresh tokens (expire in 7d) — use a DIFFERENT value
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here

# ── Server ────────────────────────────────────────────────
PORT=5000
NODE_ENV=development
```

---

## 🏗 Building for Production

### Backend

The backend can be started directly:

```bash
cd backend
node server.js
```

### Frontend

```bash
cd frontend
npm run build
```

This outputs static files to `frontend/dist/`. The Express backend (configured in `app.js`) automatically serves these files and handles SPA routing when the `dist` folder is present.

---

## 📡 API Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login (sets refresh token cookie) | No |
| POST | `/api/auth/refresh` | Get new access token | Cookie |
| POST | `/api/auth/logout` | Clear refresh token | Cookie |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/interview/generate-report` | Generate AI interview report | Yes |
| GET | `/api/interview/reports` | List user's interview reports | Yes |
| POST | `/api/interview/generate-resume` | Generate AI resume PDF | Yes |

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `GEMINI_API_KEY is not set` | Make sure `backend/.env` exists and contains the key |
| `Database connected` never appears | Check `MONGODB_URI` and that your IP is whitelisted in Atlas |
| CORS errors in browser | Ensure the frontend runs on `localhost:5173` (configured in `app.js`) |
| Puppeteer fails to launch | Install Chromium: `npx puppeteer browsers install chrome` |
| Port 5000 already in use | Change the `PORT` value in `.env` |

---

## 📄 License

ISC
