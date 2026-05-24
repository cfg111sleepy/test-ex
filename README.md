# VibeCheck Dashboard

AI-Powered Task Scoring for WebaResponds Quickly. Users log tasks; the backend assigns a **Vibe Score** based on urgency keywords, hours, and a random "vibe" multiplier.

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** FastAPI (Python 3.11) with in-memory storage
- **Tests:** Vitest (frontend), Pytest (backend)
- **Orchestration:** Docker Compose

## Quick start

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:8000  (interactive docs at `/docs`)

## Manual development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Tests

### Backend (Pytest) — 18 tests
```bash
cd backend
pytest -v
```

### Frontend (Vitest) — 3 tests
```bash
cd frontend
npm test
```

## API

| Method | Path     | Description                                  |
|--------|----------|----------------------------------------------|
| GET    | `/health`| Liveness check                               |
| GET    | `/tasks` | List all tasks                               |
| POST   | `/tasks` | Create task `{title, estimated_hours}`       |
| DELETE | `/tasks` | Clear all tasks (demo helper)                |

### Vibe Score formula
```
vibe_score = hours * urgency_factor + len(title) * 0.1 + random(1.0, 3.0)

urgency_factor = 1.5 if title contains any of {urgent, asap, critical, now, hotfix}
                 1.0 otherwise
```

### Edge cases handled by the backend

- Empty / whitespace-only title → HTTP 422
- `estimated_hours <= 0` → HTTP 422
- `estimated_hours > 1000` → HTTP 422
- Title > 200 chars → HTTP 422

## Project layout

See `PLAN.md` for the full breakdown.
# test-ex
