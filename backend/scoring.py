"""Pure scoring logic — extracted so it's easy to unit-test deterministically."""
from __future__ import annotations

import random
from typing import Callable

URGENCY_KEYWORDS = ("urgent", "asap", "critical", "now", "hotfix")
URGENT_FACTOR = 1.5
NORMAL_FACTOR = 1.0
TITLE_BONUS_PER_CHAR = 0.1
RANDOM_RANGE = (1.0, 3.0)


def urgency_factor(title: str) -> float:
    """Return 1.5 if title contains an urgency keyword, else 1.0."""
    lowered = title.lower()
    return URGENT_FACTOR if any(k in lowered for k in URGENCY_KEYWORDS) else NORMAL_FACTOR


def calculate_vibe_score(
    title: str,
    hours: float,
    rng: Callable[[float, float], float] = random.uniform,
) -> float:
    """Compute Vibe Score.

    Formula: hours * urgency_factor + len(title) * 0.1 + rng(1.0, 3.0)
    `rng` is injected so tests can pass a deterministic callable.
    """
    base = hours * urgency_factor(title)
    bonus = len(title) * TITLE_BONUS_PER_CHAR
    vibe = rng(*RANDOM_RANGE)
    return round(base + bonus + vibe, 2)
