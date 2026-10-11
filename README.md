# AI Portfolio 🤖

A full-stack portfolio website with an integrated AI assistant. Visitors can ask the
chat widget anything about your skills, projects and experience — answers are streamed
live from a pluggable LLM provider.

**Stack:** Next.js 16 (React 19, TypeScript, Tailwind CSS 4) · FastAPI (Python) · Gemini (free) / OpenAI · SSE streaming

## Features

- 🎨 Dark, animated portfolio (framer-motion scroll reveals, hover transitions, gradient effects)
- 🤖 AI chat widget — streams answers about your experience via `POST /api/chat` (SSE)
- 🔀 Provider abstraction — **Gemini free tier by default**, OpenAI supported via one env var
- 📝 Content dashboard at `/add` — add skills, projects and achievements without touching code
- 📷 Image upload for achievements (multipart → saved to `backend/uploads/`, served statically)
- 🔌 REST API with automatic OpenAPI docs at `http://localhost:8000/docs`
- 🧠 The AI prompt is rebuilt from your profile on every request — new content is instantly known to the chatbot

## Project structure

```
ai-portfolio/
├── frontend/          # Next.js app (UI + chat widget)
│   ├── app/           # pages: / (portfolio), /add (dashboard)
│   ├── components/    # Hero, Skills, Projects, Achievements, ChatWidget, …
│   └── lib/api.ts     # typed API client (fetch + SSE reader)
└── backend/           # FastAPI app
    ├── main.py        # routes: health, profile, CRUD, chat
    ├── providers.py   # pluggable AI providers (Gemini free tier / OpenAI)
    ├── store.py       # JSON persistence for added content
    ├── profile.json   # ← EDIT THIS: your resume data (name, skills, projects…)
    ├── data.json      # content added via the dashboard (auto-created)
    └── uploads/       # uploaded achievement images
```

## Running locally

**1. Backend** (terminal 1):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
copy .env.example .env        # then paste your free Gemini key into .env
.\.venv\Scripts\uvicorn main:app --reload --port 8000
```

**2. Frontend** (terminal 2):

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** — dashboard at **http://localhost:3000/add**.

## Configuration

| File | What to change |
|---|---|
| `backend/.env` | **Free Gemini key** (`GEMINI_API_KEY` from aistudio.google.com/apikey) — or set `AI_PROVIDER=openai` + `OPENAI_API_KEY` |
| `backend/profile.json` | Your name, title, summary, skills, projects, experience, links |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` if the backend runs elsewhere |

> **Free AI:** the default provider is Google Gemini's free tier (no card required).
> Default model `gemini-3.8-flash` — override with `AI_MODEL`. Without a key the site
> works fully; only the chat replies with an error.

## API overview

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | service + API-key status |
| GET | `/api/profile` | template profile merged with dashboard content |
| POST/DELETE | `/api/skills`, `/api/projects` | manage items |
| POST/DELETE | `/api/achievements` | manage items (image upload on POST) |
| POST | `/api/chat` | SSE stream of OpenAI completions |

## Resume bullet points

- Built a full-stack AI portfolio (Next.js/TypeScript + FastAPI) featuring an LLM chat
  assistant with **token-by-token SSE streaming** and a profile-grounded system prompt,
  behind a **provider abstraction** supporting Google Gemini's free tier and OpenAI.
- Implemented a content management dashboard with **REST CRUD + multipart image uploads**,
  persisting to a JSON store and serving uploads via a static mount.
- Designed a provider-aware API client with typed fetch helpers and a manual SSE reader;
  added CORS, input validation (Pydantic), and upload limits (type/size checks).
