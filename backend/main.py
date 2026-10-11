"""FastAPI backend for the AI portfolio.

Run with:  uvicorn main:app --reload --port 8000
"""

import json
import os
import re
import uuid
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

import store
from providers import ProviderError, get_provider

load_dotenv()

BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/gif": ".gif"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB

# Comma-separated list of frontend origins allowed to call this API.
# After deploying, add your Vercel URL here (Render env var ALLOWED_ORIGINS).
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    if origin.strip()
]

# Access code for the content dashboard (/add). Visitors can read the
# profile and chat with the AI, but only key-holders can change content.
DASHBOARD_KEY = os.getenv("DASHBOARD_KEY", "").strip()


def require_dashboard_key(x_dashboard_key: str = Header(default="")) -> None:
    """Guard content-management routes (POST/DELETE)."""
    if not DASHBOARD_KEY:
        raise HTTPException(503, "dashboard locked — set DASHBOARD_KEY in backend/.env")
    if x_dashboard_key != DASHBOARD_KEY:
        raise HTTPException(401, "invalid dashboard key")


def load_profile() -> dict:
    """Read profile.json fresh on every request so edits apply instantly."""
    return json.loads((BASE_DIR / "profile.json").read_text(encoding="utf-8"))


def build_profile() -> dict:
    """Curated profile merged with everything added through the UI."""
    profile = load_profile()
    added = store.get_all()
    return {
        **profile,
        "skills": {**profile.get("skills", {}), "added": added["skills"]},
        "projects": profile.get("projects", []) + added["projects"],
        "achievements": profile.get("achievements", []) + added["achievements"],
        "experience": profile.get("experience", []),
        "education": profile.get("education", []),
    }


def build_system_prompt() -> str:
    profile = build_profile()
    return (
        f"You are a friendly AI assistant on {profile['name']}'s portfolio website.\n"
        f"Answer questions about {profile['name']}'s skills, projects, achievements, and "
        f"experience using ONLY the profile data below. Keep answers concise (2-4 sentences), "
        f"positive but honest, and in the first person as if you were {profile['name']} speaking. "
        f"If you don't know something or the question is unrelated to their professional profile, "
        f"say so briefly and suggest the visitor use the contact section.\n\n"
        "NAVIGATION: when the visitor asks to go to, show, or see a part of the portfolio, "
        "append EXACTLY ONE navigation token at the very END of your reply, chosen from:\n"
        "[NAVIGATE:top] [NAVIGATE:skills] [NAVIGATE:projects] [NAVIGATE:achievements] "
        "[NAVIGATE:education] [NAVIGATE:experience] [NAVIGATE:contact]\n"
        'Example — visitor: "take me to his projects" — you: "Sure, here are my projects! '
        'I\'m most proud of the AI Code Reviewer. [NAVIGATE:projects]"\n'
        "The token is invisible to visitors; never mention it in words. Only use it when "
        "navigation is clearly requested; otherwise never include it.\n\n"
        f"PROFILE DATA:\n{json.dumps(profile, indent=2, ensure_ascii=False)}"
    )


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=20)


class SkillIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    category: str = Field(default="added", max_length=40)
    level: int = Field(default=80, ge=0, le=100)


class ProjectIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str = Field(min_length=1, max_length=600)
    tech: str = Field(default="", max_length=300)  # comma-separated
    link: str = Field(default="", max_length=300)
    details: str = Field(default="", max_length=4000)  # long-form text for the detail page


app = FastAPI(title="AI Portfolio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ---------------------------------------------------------------- health / profile


@app.get("/api/health")
@app.get("/health")  # alias for external health checkers
def health() -> dict:
    provider = get_provider()
    return {
        "status": "ok",
        "provider": provider.name,
        "model": provider.model,
        "api_key_configured": provider.key_configured,
    }


@app.get("/api/profile")
def get_profile() -> dict:
    return build_profile()


@app.get("/api/dashboard/check")
def dashboard_check(x_dashboard_key: str = Header(default="")) -> dict:
    """Lets the dashboard verify an access code without changing anything."""
    if DASHBOARD_KEY and x_dashboard_key == DASHBOARD_KEY:
        return {"ok": True}
    raise HTTPException(401, "invalid dashboard key")


# ---------------------------------------------------------------- CRUD: skills


@app.post("/api/skills", dependencies=[Depends(require_dashboard_key)])
def create_skill(payload: SkillIn) -> dict:
    return store.add("skills", payload.model_dump())


@app.delete("/api/skills/{item_id}", dependencies=[Depends(require_dashboard_key)])
def delete_skill(item_id: int) -> dict:
    if not store.remove("skills", item_id):
        raise HTTPException(404, "skill not found")
    return {"deleted": item_id}


# ---------------------------------------------------------------- CRUD: projects


@app.post("/api/projects", dependencies=[Depends(require_dashboard_key)])
def create_project(payload: ProjectIn) -> dict:
    item = payload.model_dump()
    item["tech"] = [t.strip() for t in payload.tech.split(",") if t.strip()]
    return store.add("projects", item)


@app.delete("/api/projects/{item_id}", dependencies=[Depends(require_dashboard_key)])
def delete_project(item_id: int) -> dict:
    if not store.remove("projects", item_id):
        raise HTTPException(404, "project not found")
    return {"deleted": item_id}


# ---------------------------------------------------------------- achievements + image upload


async def _save_image(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(415, f"unsupported type {file.content_type}; use png/jpeg/webp/gif")
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "image too large (max 5 MB)")
    ext = ALLOWED_IMAGE_TYPES[file.content_type]
    name = f"{uuid.uuid4().hex}{ext}"
    (UPLOAD_DIR / name).write_bytes(data)
    return f"/uploads/{name}"


@app.post("/api/achievements", dependencies=[Depends(require_dashboard_key)])
async def create_achievement(
    title: str = Form(..., max_length=120),
    description: str = Form("", max_length=600),
    date: str = Form("", max_length=40),
    details: str = Form("", max_length=8000),
    image: UploadFile | None = File(None),
    images: list[UploadFile] = File(default=[]),
) -> dict:
    item = {"title": title, "description": description, "date": date}
    if details.strip():
        item["details"] = details
    saved: list[str] = []
    for f in [image, *images]:
        if f is not None and f.filename:
            saved.append(await _save_image(f))
    if saved:
        item["image"] = saved[0]  # card thumbnail
        item["images"] = saved  # full gallery for the detail page
    return store.add("achievements", item)


@app.delete("/api/achievements/{item_id}", dependencies=[Depends(require_dashboard_key)])
def delete_achievement(item_id: int) -> dict:
    if not store.remove("achievements", item_id):
        raise HTTPException(404, "achievement not found")
    return {"deleted": item_id}


# ---------------------------------------------------------------- AI chat (SSE stream)


@app.post("/api/chat")
def chat(req: ChatRequest) -> StreamingResponse:
    provider = get_provider()
    if not provider.key_configured:
        raise HTTPException(
            status_code=500,
            detail=f"No API key configured for provider '{provider.name}' — see backend/.env",
        )

    system_prompt = build_system_prompt()
    history = [m.model_dump() for m in req.messages]

    def event_stream():
        try:
            for text in provider.stream(system_prompt, history):
                yield f"data: {json.dumps({'text': text})}\n\n"
        except ProviderError as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
        except Exception as exc:  # never break the SSE stream mid-flight
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
