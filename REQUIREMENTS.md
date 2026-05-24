# VibeCheck Dashboard — Початкові правила та вимоги

> Цей документ збирає в одному місці **оригінальне ТЗ** + **рішення, прийняті на етапі уточнення** + **acceptance criteria**. Це source of truth для проєкту.

---

## 1. Контекст задачі

**Назва:** VibeCheck Dashboard: AI-Powered Task Scoring
**Замовник:** WebaResponds Quickly
**Роль:** Middle Vibe Coder
**Дедлайн:** 60 хвилин ("Build a Vibe-Driven Task Tracker with Full Testing in 60 Minutes")

WebaResponds Quickly потребує внутрішнього 'Vibe-Driven Task Tracker'. Мета — не просто трекати час, а призначати **Vibe Score** кожній задачі на основі її складності та терміновості. Швидкий прототип, що демонструє:

- чистий розподіл відповідальностей (separation of concerns);
- надійну стратегію тестування;
- вміння керувати AI для обробки error states, state management та test coverage під тиском дедлайну.

Користувачі мають мати змогу логувати, над чим вони працюють, а система — миттєво обчислювати "vibe" задачі.

---

## 2. Функціональні вимоги (з оригінального ТЗ)

### 2.1 Frontend
- React або Next.js дашборд.
- Форма для введення:
  - **Task Name** (назва задачі);
  - **Estimated Hours** (оцінка в годинах).

### 2.2 Backend
- Node.js (Express) **або** Python (FastAPI) API.
- Зберігання задач **in-memory**.
- Обчислення **Vibe Score** за формулою на кшталт `Hours * Random Multiplier`.

### 2.3 Інтеграція
- Frontend має фетчити та відображати список усіх задач разом з їхніми обчисленими score з backend.

### 2.4 Тестування
- Тест-сьют, що перевіряє:
  - логіку обчислення score;
  - рендер компонентів.
- Стек тестів: **Vitest, Jest або Pytest**.

### 2.5 AI колаборація
- Проєкт має включати файл `prompts.md`, де задокументовані основні prompts, використані для генерації scaffold та логіки.

---

## 3. Tech Stack (з оригінального ТЗ)

- **Next.js (App Router)**
- **Tailwind CSS**
- **FastAPI або Express**
- **Vitest/Jest** для тестування

---

## 4. Acceptance Criteria (з оригінального ТЗ)

Чотири обов'язкові критерії, кожен з яких має бути виконаний:

1. ☑ Додаток повністю функціональний і запускається **однією командою** (наприклад `docker-compose up` або shell скрипт).
2. ☑ Backend API коректно обчислює task score та обробляє **щонайменше один edge case** (наприклад negative duration або empty title).
3. ☑ UI оновлюється **динамічно без full page refresh** при додаванні задачі.
4. ☑ Щонайменше **2 backend unit тести** та **1 frontend component тест** мають успішно проходити.

---

## 5. Уточнення (рішення прийняті на початку через clarifying questions)

Перед написанням коду були прийняті чотири рішення для зняття неоднозначностей:

| # | Питання                              | Відповідь                                | Обґрунтування                                                 |
|---|--------------------------------------|------------------------------------------|---------------------------------------------------------------|
| 1 | Який бекенд?                         | **FastAPI (Python)**                     | Швидкий запуск, простий синтаксис, чудові тести через Pytest |
| 2 | Як запускати додаток?                | **docker-compose up**                    | Контейнеризація, єдиний спільний запуск для фронту+беку       |
| 3 | Яка формула Vibe Score?              | **Hours * urgency_factor + bonus + rng** | Складніша за наївний random — враховує контекст назви         |
| 4 | TypeScript чи JavaScript на фронті?  | **TypeScript**                           | Краща типобезпека, типові інтерфейси для API                  |

---

## 6. Фінальний tech stack (після уточнень)

| Шар              | Технологія                                  |
|------------------|---------------------------------------------|
| Frontend         | Next.js 14 (App Router) + TypeScript        |
| Styling          | Tailwind CSS                                |
| Backend          | FastAPI (Python 3.11)                       |
| Storage          | In-memory (Python list)                     |
| Frontend tests   | Vitest + React Testing Library              |
| Backend tests    | Pytest + httpx (FastAPI TestClient)         |
| Orchestration    | Docker Compose                              |
| Запуск           | `docker compose up --build` (або `start-local.ps1` без Docker) |

---

## 7. Vibe Score — фінальна формула

```
vibe_score = round(hours * urgency_factor + len(title) * 0.1 + random(1.0, 3.0), 2)

де:
  urgency_factor = 1.5  якщо title містить одне з {urgent, asap, critical, now, hotfix}
                   1.0  інакше
  len(title) * 0.1 = бонус за контекст (довша назва — більше деталей)
  random(1.0, 3.0) = "vibe" компонент
```

**Приклад:**
- `"Fix urgent login bug"`, hours=2.5 → `2.5*1.5 + 20*0.1 + rng ≈ 6.75..7.75 + bonus`
- `"Refactor module"`, hours=5 → `5*1.0 + 15*0.1 + rng ≈ 7.5..8.5`

---

## 8. Edge cases (бек відхиляє з HTTP 422)

| Випадок                       | Поведінка                                    |
|-------------------------------|----------------------------------------------|
| Empty title (`""`)            | 422 `String should have at least 1 character` |
| Whitespace-only (`"   "`)     | 422 `Task name cannot be empty` (після `.strip()`) |
| `estimated_hours <= 0`        | 422 `Input should be greater than 0`         |
| `estimated_hours > 1000`      | 422 `Input should be less than or equal to 1000` |
| `len(title) > 200`            | 422 `String should have at most 200 characters` |

---

## 9. API контракт

| Метод   | Шлях      | Опис                                      | Статус успіху |
|---------|-----------|-------------------------------------------|---------------|
| GET     | `/health` | Liveness check                            | 200           |
| GET     | `/tasks`  | Повертає список усіх задач                | 200           |
| POST    | `/tasks`  | Створює задачу `{title, estimated_hours}` | 201           |
| DELETE  | `/tasks`  | Очищає сторадж (для демо)                 | 204           |

### Приклад POST /tasks

**Request:**
```json
{ "title": "Fix login bug", "estimated_hours": 2.5 }
```

**Response (201):**
```json
{
  "id": 1,
  "title": "Fix login bug",
  "estimated_hours": 2.5,
  "vibe_score": 4.85,
  "created_at": "2026-05-24T10:00:00Z"
}
```

---

## 10. UX правила

- Після успішного POST форма **очищає поля** і таска **одразу з'являється** у списку (через React state update — без `window.location.reload()` чи `router.refresh()`).
- Помилки сервера (422) показуються під формою.
- Клієнтська валідація **дублює** серверну (миттєвий фідбек), але сервер залишається source of truth.
- Кольорове кодування vibe score:
  - `< 5` → **Chill** (зелений)
  - `5..15` → **Spicy** (помаранчевий)
  - `≥ 15` → **Inferno** (червоний)

---

## 11. Команди запуску (single command — критерій №1)

### Через Docker (рекомендовано):
```powershell
docker compose up --build
```

### Без Docker:
```powershell
.\start-local.ps1
```

Обидва варіанти задовольняють вимогу "single command".

---

## 12. Команди для тестів

```powershell
# Backend (18 тестів)
cd backend
pytest -v

# Frontend (3 тести)
cd frontend
npm test
```

---

## 13. Структура проєкту (фінальна)

```
test ex/
├── REQUIREMENTS.md      ← цей файл (правила)
├── PLAN.md              ← покрокова дорожня карта
├── README.md            ← інструкції користувачу
├── prompts.md           ← AI collaboration log
├── docker-compose.yml   ← single command launch
├── check-environment.ps1
├── start-local.ps1
├── .gitignore
├── backend/             ← FastAPI
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py          ← endpoints + Pydantic валідація
│   ├── scoring.py       ← чиста функція scoring з ін'єкцією rng
│   └── tests/
│       ├── test_scoring.py  ← 9 unit тестів
│       └── test_api.py      ← 9 API/integration тестів
└── frontend/            ← Next.js 14 + TS
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── vitest.config.ts
    ├── vitest.setup.ts
    ├── next-env.d.ts
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx     ← state, useEffect, optimistic update
    │   └── globals.css
    ├── components/
    │   ├── TaskForm.tsx ← controlled form, dual-layer validation
    │   └── TaskList.tsx ← рендер + vibe badge
    ├── lib/
    │   └── api.ts       ← fetchTasks, createTask, helpers
    └── __tests__/
        └── TaskList.test.tsx  ← 3 component тести
```

---

## 14. Підсумок відповідності

| Категорія                  | Виконано |
|----------------------------|----------|
| Функціональні вимоги (4)   | ✅ 4/4   |
| Tech stack                 | ✅       |
| Acceptance criteria (4)    | ✅ 4/4   |
| Edge cases                 | ✅ 5 типів |
| Backend тести (треба ≥2)   | ✅ 18    |
| Frontend тести (треба ≥1)  | ✅ 3     |
| `prompts.md`               | ✅       |
| Single command launch      | ✅ docker compose / start-local.ps1 |
