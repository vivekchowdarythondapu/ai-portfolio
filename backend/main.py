"""FastAPI backend for the AI portfolio.

Run with:  uvicorn main:app --reload --port 8000
"""

import json
import os
import re
import uuid
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
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

PROFILE = json.loads((BASE_DIR / "profile.json").read_text(encoding="utf-8"))

ALLOWED_IMAGE_TYPES = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/gif": ".gif"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB


def build_profile() -> dict:
    """Curated template merged with everything added through the UI."""
    added = store.get_all()
    return {
        **PROFILE,
        "skills": {**PROFILE["skills"], "added": added["skills"]},
        "projects": PROFILE["projects"] + added["projects"],
        "achievements": added["achievements"],
        "experience": PROFILE["experience"],
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


app = FastAPI(title="AI Portfolio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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


# ---------------------------------------------------------------- CRUD: skills


@app.post("/api/skills")
def create_skill(payload: SkillIn) -> dict:
    return store.add("skills", payload.model_dump())


@app.delete("/api/skills/{item_id}")
def delete_skill(item_id: int) -> dict:
    if not store.remove("skills", item_id):
        raise HTTPException(404, "skill not found")
    return {"deleted": item_id}


# ---------------------------------------------------------------- CRUD: projects


@app.post("/api/projects")
def create_project(payload: ProjectIn) -> dict:
    item = payload.model_dump()
    item["tech"] = [t.strip() for t in payload.tech.split(",") if t.strip()]
    return store.add("projects", item)


@app.delete("/api/projects/{item_id}")
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


@app.post("/api/achievements")
async def create_achievement(
    title: str = Form(..., max_length=120),
    description: str = Form("", max_length=600),
    date: str = Form("", max_length=40),
    image: UploadFile | None = File(None),
) -> dict:
    item = {"title": title, "description": description, "date": date}
    if image is not None and image.filename:
        item["image"] = await _save_image(image)
    return store.add("achievements", item)


@app.delete("/api/achievements/{item_id}")
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
