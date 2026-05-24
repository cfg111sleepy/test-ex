"""API-level tests using FastAPI's TestClient."""
import pytest
from fastapi.testclient import TestClient

from main import app, _reset_store


@pytest.fixture(autouse=True)
def clean_store():
    _reset_store()
    yield
    _reset_store()


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_task_returns_score_and_id():
    response = client.post("/tasks", json={"title": "Write tests", "estimated_hours": 2.0})
    assert response.status_code == 201
    body = response.json()
    assert body["id"] == 1
    assert body["title"] == "Write tests"
    assert body["estimated_hours"] == 2.0
    assert isinstance(body["vibe_score"], (int, float))
    assert body["vibe_score"] > 0


def test_list_tasks_after_creation():
    client.post("/tasks", json={"title": "Task A", "estimated_hours": 1.0})
    client.post("/tasks", json={"title": "Task B", "estimated_hours": 3.5})
    response = client.get("/tasks")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 2
    assert tasks[0]["title"] == "Task A"
    assert tasks[1]["title"] == "Task B"


# ---------- Edge cases ----------

def test_empty_title_rejected():
    response = client.post("/tasks", json={"title": "", "estimated_hours": 1.0})
    assert response.status_code == 422


def test_whitespace_only_title_rejected():
    response = client.post("/tasks", json={"title": "   ", "estimated_hours": 1.0})
    assert response.status_code == 422


def test_negative_hours_rejected():
    response = client.post("/tasks", json={"title": "Valid title", "estimated_hours": -1.0})
    assert response.status_code == 422


def test_zero_hours_rejected():
    response = client.post("/tasks", json={"title": "Valid title", "estimated_hours": 0})
    assert response.status_code == 422


def test_excessive_hours_rejected():
    response = client.post("/tasks", json={"title": "Way too long task", "estimated_hours": 9999})
    assert response.status_code == 422


def test_title_is_stripped():
    response = client.post("/tasks", json={"title": "  hello  ", "estimated_hours": 1.0})
    assert response.status_code == 201
    assert response.json()["title"] == "hello"
