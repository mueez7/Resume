# Aura — AI Resume Analyzer

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/OpenRouter-AI-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Supabase-Auth-green?style=for-the-badge&logo=supabase" />
</div>

<br />

> **Aura** is a brutalist-aesthetic AI-powered resume analyzer. Upload your PDF resume, define your target role, and Aura uses AI to give you an ATS score, rewrite weak bullet points, identify skill gaps, and generate tailored interview questions.

---

## ✨ Features

- 📄 **PDF Resume Parsing** — Upload your resume and extract text automatically
- 🤖 **AI Analysis** — Powered by DeepSeek via OpenRouter for ATS scoring and feedback
- 🎯 **ATS Score** — Know exactly how well your resume performs against parsing algorithms
- 🔫 **Bullet Point Rewriting** — Weak verbs eliminated, metrics enforced
- 📊 **Skill Gap Radar** — Visual chart comparing your skills vs. market requirements
- 💬 **Interview Simulator** — AI-generated behavioral & technical questions from your gaps
- 📝 **Cover Letter Generator** — One-click tailored cover letters
- 🔐 **Authentication** — Supabase-powered login/signup

---

## 🏗️ Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| Backend    | Node.js, Express, TypeScript, ts-node       |
| AI         | OpenRouter API (DeepSeek V4 Flash Free)     |
| Auth & DB  | Supabase (Auth + PostgreSQL)                |
| PDF        | pdf-parse                                   |

---

## 📁 Project Structure

```
├── frontend/          # Next.js App Router frontend
│   ├── src/
│   │   ├── app/       # Pages: /, /dashboard, /results, /login, /signup
│   │   ├── components/# Navbar, CustomCursor, Marquee, etc.
│   │   └── lib/       # Supabase client
│   └── .env.local.example
│
└── backend/           # Express + TypeScript API server
    ├── server.ts      # Main server: /api/analyze, /api/cover-letter
    ├── schema.sql     # Supabase database schema
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A free [OpenRouter](https://openrouter.ai) account (for the AI API key)
- A [Supabase](https://supabase.com) project (for auth & database)

---

### 1. Clone the repository

```bash
git clone https://github.com/mueez7/Resume.git
cd Resume
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Start the backend dev server:

```bash
npm run dev
```

The backend runs at **`http://localhost:5000`**.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Copy the example env file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the frontend dev server:

```bash
npm run dev
```

The frontend runs at **`http://localhost:3000`**.

---

### 4. Database Setup

Run the SQL in `backend/schema.sql` inside your Supabase project's SQL editor to create the required tables and RLS policies.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on (default: `5000`) |
| `OPENROUTER_API_KEY` | Your OpenRouter API key from [openrouter.ai](https://openrouter.ai) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

---

## 📡 API Endpoints

### `POST /api/analyze`
Analyzes a resume PDF against a target role.

**Form Data:**
| Field | Type | Description |
|---|---|---|
| `resume` | `File` | PDF resume file |
| `targetRole` | `string` | The job title to target |
| `salary` | `string` | Expected salary |
| `workType` | `string` | `remote`, `hybrid`, or `onsite` |

**Response:**
```json
{
  "atsScore": 72,
  "weakPoints": ["..."],
  "rewrittenBullets": [{ "original": "...", "optimized": "..." }],
  "missingSkills": ["..."],
  "skillGaps": [{ "skillName": "...", "userScore": 60, "marketRequirement": 85 }],
  "interviewQuestions": ["..."]
}
```

### `POST /api/cover-letter`
Generates a tailored cover letter.

**Body (JSON):**
```json
{
  "targetRole": "Senior Engineer",
  "company": "Acme Corp",
  "resumeText": "..."
}
```

---

## 📜 License

MIT © 2026 Aura Systems
