"""Simple JSON-file store for user-added portfolio content.

profile.json stays the curated template; everything added through the
UI is persisted here so it survives restarts.
"""

import json
import threading
from pathlib import Path

DATA_FILE = Path(__file__).parent / "data.json"
_LOCK = threading.Lock()

DEFAULT = {"skills": [], "projects": [], "achievements": []}


def _load() -> dict:
    if not DATA_FILE.exists():
        return json.loads(json.dumps(DEFAULT))
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    for key in DEFAULT:
        data.setdefault(key, [])
    return data


def _save(data: dict) -> None:
    DATA_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def get_all() -> dict:
    with _LOCK:
        return _load()


def add(kind: str, item: dict) -> dict:
    """Append an item to one of skills/projects/achievements and return it."""
    if kind not in DEFAULT:
        raise ValueError(f"unknown kind: {kind}")
    with _LOCK:
        data = _load()
        item["id"] = max((i.get("id", 0) for i in data[kind]), default=0) + 1
        data[kind].append(item)
        _save(data)
        return item


def remove(kind: str, item_id: int) -> bool:
    if kind not in DEFAULT:
        raise ValueError(f"unknown kind: {kind}")
    with _LOCK:
        data = _load()
        before = len(data[kind])
        data[kind] = [i for i in data[kind] if i.get("id") != item_id]
        if len(data[kind]) == before:
            return False
        _save(data)
        return True
