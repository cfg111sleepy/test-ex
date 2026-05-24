# VibeCheck Dashboard — План реалізації

> AI-Powered Task Scoring App. Прототип для WebaResponds Quickly за 60 хвилин.

---

## 1. Технологічний стек (фінальний вибір)

| Шар         | Технологія                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14 (App Router) + TypeScript |
| Styling     | Tailwind CSS                        |
| Backend     | FastAPI (Python 3.11)               |
| Storage     | In-memory (Python list)             |
| Frontend тести | Vitest + React Testing Library   |
| Backend тести  | Pytest + httpx                   |
| Запуск      | docker-compose up                   |

---

## 2. Архітектура

```
┌─────────────────┐         HTTP/JSON          ┌──────────────────┐
│  Next.js (3000) │ ─────────────────────────▶ │  FastAPI (8000)  │
│  - Форма        │ ◀───────────────────────── │  - POST /tasks   │
│  - Список тасок │                            │  - GET  /tasks   │
└─────────────────┘                            │  - In-memory DB  │
                                               └──────────────────┘
```

Чистий розподіл відповідальностей: фронт лише UI/UX, бек — бізнес-логіка (Vibe Score) та валідація.

---

## 3. Vibe Score — формула

```
vibe_score = round(hours * urgency_factor + bonus, 2)

де:
  urgency_factor = 1.5 якщо у title є одне з ['urgent','asap','critical','now','hotfix']
                   1.0 інакше
  bonus          = len(title) * 0.1   # довша назва = більше контексту = +bonus
  + random multiplier ∈ [1.0, 3.0]    # "vibe" компонент
```

Приклад: `"Fix urgent bug"` з 2h → `2 * 1.5 + 14*0.1 + rand(1..3) ≈ 5.4..7.4`

---

## 4. Edge cases (бек має обробити)

1. **Порожній title** → HTTP 422 `{detail: "Task name cannot be empty"}`
2. **Negative hours / 0** → HTTP 422 `{detail: "Estimated hours must be > 0"}`
3. **Hours > 1000** → HTTP 422 (sanity check)
4. **Title > 200 chars** → HTTP 422

---

## 5. Стадії реалізації

### Stage 1 — Backend (FastAPI)
- `backend/main.py` — додаток, моделі `Task`, `TaskCreate`, ендпоінти `GET/POST /tasks`, валідація через Pydantic.
- `backend/scoring.py` — чиста функція `calculate_vibe_score(title, hours, rng)`. Виокремлено для тестування без random.
- `backend/requirements.txt` — fastapi, uvicorn, pytest, httpx.
- CORS middleware → дозволити `http://localhost:3000`.

### Stage 2 — Backend тести (Pytest)
- `backend/tests/test_scoring.py` — детермінований тест score (mock random).
- `backend/tests/test_api.py` — тести edge cases (empty title, negative hours), POST → GET round-trip.

### Stage 3 — Frontend (Next.js + Tailwind)
- `frontend/app/page.tsx` — головна сторінка, серверний компонент.
- `frontend/components/TaskForm.tsx` — клієнтський компонент форми (input name, input hours, submit).
- `frontend/components/TaskList.tsx` — список з vibe scores, color-coded badges.
- `frontend/lib/api.ts` — `fetchTasks()`, `createTask()`.
- Стан через `useState` + оптимістичний апдейт після створення.
- Обробка помилок: показуємо повідомлення з API під формою.

### Stage 4 — Frontend тест (Vitest)
- `frontend/__tests__/TaskList.test.tsx` — render тест: передаємо моковані таски, перевіряємо що вони відображаються з правильним score.

### Stage 5 — Docker
- `backend/Dockerfile` — python:3.11-slim, copy, uvicorn.
- `frontend/Dockerfile` — node:20-alpine, multi-stage build.
- `docker-compose.yml` — два сервіси, спільна мережа, env vars для API URL.

### Stage 6 — Документація
- `prompts.md` — основні AI prompts, які використано (scaffold, scoring logic, тести, Docker).
- `README.md` — як запустити (`docker-compose up`), як запустити тести, опис API.

---

## 6. API контракт

### POST /tasks
```json
Request:  { "title": "Fix login bug", "estimated_hours": 2.5 }
Response: { "id": 1, "title": "Fix login bug", "estimated_hours": 2.5,
            "vibe_score": 4.85, "created_at": "2026-05-24T10:00:00Z" }
```

### GET /tasks
```json
Response: [ { Task }, { Task }, ... ]
```

### GET /health
```json
Response: { "status": "ok" }
```

---

## 7. Acceptance Criteria — checklist

- [ ] `docker-compose up` запускає весь стек однією командою
- [ ] Backend коректно рахує score
- [ ] Backend відхиляє empty title та negative hours
- [ ] UI оновлюється без full refresh (SPA-style state update)
- [ ] ≥ 2 backend unit тестів проходять
- [ ] ≥ 1 frontend component тест проходить
- [ ] `prompts.md` присутній

---

## 8. Структура файлів

```
test ex/
├── PLAN.md                          ← цей файл
├── README.md
├── prompts.md
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   ├── scoring.py
│   └── tests/
│       ├── test_scoring.py
│       └── test_api.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── vitest.config.ts
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    ├── components/
    │   ├── TaskForm.tsx
    │   └── TaskList.tsx
    ├── lib/
    │   └── api.ts
    └── __tests__/
        └── TaskList.test.tsx
```
