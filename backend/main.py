"""VibeCheck Dashboard — FastAPI backend.

In-memory task store with Vibe Score calculation.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from scoring import calculate_vibe_score

app = FastAPI(title="VibeCheck Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models ----------

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    estimated_hours: float = Field(..., gt=0, le=1000)

    @field_validator("title")
    @classmethod
    def strip_and_check(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Task name cannot be empty")
        return stripped


class Task(BaseModel):
    id: int
    title: str
    estimated_hours: float
    vibe_score: float
    created_at: datetime


# ---------- In-memory store ----------

_tasks: List[Task] = []
_next_id: int = 1


def _reset_store() -> None:
    """Used by tests."""
    global _tasks, _next_id
    _tasks = []
    _next_id = 1


# ---------- Routes ----------

@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/tasks", response_model=List[Task])
def list_tasks() -> List[Task]:
    return _tasks


@app.post("/tasks", response_model=Task, status_code=201)
def create_task(payload: TaskCreate) -> Task:
    global _next_id
    score = calculate_vibe_score(payload.title, payload.estimated_hours)
    task = Task(
        id=_next_id,
        title=payload.title,
        estimated_hours=payload.estimated_hours,
        vibe_score=score,
        created_at=datetime.now(timezone.utc),
    )
    _tasks.append(task)
    _next_id += 1
    return task


@app.delete("/tasks", status_code=204, response_class=Response)
def clear_tasks() -> Response:
    """Convenience endpoint — useful during demo."""
    _reset_store()
    return Response(status_code=204)
