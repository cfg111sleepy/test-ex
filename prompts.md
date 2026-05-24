# AI Collaboration — Prompts Log

This file documents the major prompts that guided the AI through building VibeCheck Dashboard. Prompts are grouped by phase to mirror the order of work.

---

## Phase 0 — Clarification

Before any code, the AI surfaced four clarifying questions (multiple-choice) to lock in scope:

1. Backend choice → **FastAPI**
2. Run command → **docker-compose up**
3. Score formula → **Hours * urgency_factor + bonus** (richer than naive random)
4. Frontend language → **TypeScript**

> Lesson: even when a brief looks complete, a 30-second clarification round prevents wasted minutes later.

---

## Phase 1 — Planning

> "Write a PLAN.md that breaks the work into stages, lists the file tree, defines the API contract, and pins the Vibe Score formula with edge cases. Keep it skimmable — checklist + tables, not prose."

The plan was committed to disk first so all later work could reference it.

---

## Phase 2 — Backend scaffold

> "Generate a FastAPI app with two endpoints: `POST /tasks` and `GET /tasks`. Store tasks in-memory. Extract the score calculation into a pure function `calculate_vibe_score(title, hours, rng)` in a separate module so tests can inject a deterministic rng. Use Pydantic `Field` + `field_validator` for input validation: title min_length 1 max_length 200 (strip whitespace, reject if empty), hours `gt=0, le=1000`. Add CORS for `http://localhost:3000`."

Key design choice: **inject `rng` into the scoring function**. This makes the random component fully testable without monkey-patching `random.uniform`.

---

## Phase 3 — Backend tests

> "Write Pytest tests in `backend/tests/`. Cover: (a) urgency keyword detection, (b) deterministic score with a fixed-value rng, (c) score scales linearly with hours (parametrize), (d) edge cases via `TestClient` — empty title, whitespace-only title, negative hours, zero hours, hours over the cap, and title-stripping behavior. Use `autouse` fixture to reset the in-memory store between tests."

Result: 18 tests, ~0.3s runtime.

---

## Phase 4 — Frontend scaffold

> "Scaffold a Next.js 14 App Router project in TypeScript with Tailwind. Three files: `app/page.tsx` (client component holding task state + useEffect for initial fetch), `components/TaskForm.tsx` (controlled inputs, client-side validation mirroring the API, error display), `components/TaskList.tsx` (color-coded vibe badge: Chill < 5, Spicy < 15, Inferno otherwise). API helper in `lib/api.ts` typed with `Task` interface. After successful POST, append to state — no refetch. Read API URL from `NEXT_PUBLIC_API_URL` env var with `http://localhost:8000` fallback."

Key UX choice: **dual-layer validation** (client-side + server-side). The client catches obvious mistakes instantly; the server is still the source of truth and its error messages bubble up to the form.

---

## Phase 5 — Frontend test

> "Add a Vitest + React Testing Library test for `TaskList`. Cover three things: empty state renders, populated state renders all titles/hours/scores by `data-testid`, vibe label switches based on score thresholds. Configure Vitest with `jsdom`, `@testing-library/jest-dom` matchers loaded via a setup file."

---

## Phase 6 — Docker

> "Two Dockerfiles. Backend: `python:3.11-slim`, pip install requirements, uvicorn on :8000. Frontend: multi-stage `node:20-alpine` — deps → builder → runner. `docker-compose.yml`: backend exposes 8000 with a `/health` healthcheck; frontend depends on backend being healthy, exposes 3000, sets `NEXT_PUBLIC_API_URL`."

---

## Phase 7 — Documentation

> "Write a README that: lists the stack, gives the one-command start, includes manual dev instructions, documents the API table + score formula + edge cases, and points readers at PLAN.md for the deeper breakdown. No marketing fluff."

---

## Reflections on AI collaboration under deadline

- **Plan before coding.** Writing PLAN.md first kept later prompts surgical ("implement Stage 2") instead of re-debating scope.
- **Pure functions for testable logic.** Telling the AI to extract `calculate_vibe_score` with an injected rng made the test suite trivial — no mocking framework needed.
- **Run tests early.** A small `parametrize` arithmetic mistake was caught in the first test run; fixing it took 30 seconds. Catching it after writing Docker + docs would have been much worse.
- **Two-layer validation.** Asking the AI to mirror server validation on the client (without removing the server checks) gave snappy UX without sacrificing safety.
