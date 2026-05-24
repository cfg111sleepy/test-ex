"""Unit tests for the scoring module — deterministic via injected rng."""
import pytest

from scoring import calculate_vibe_score, urgency_factor


def fixed_rng(value: float):
    """Return a callable that always returns `value`."""
    return lambda a, b: value


class TestUrgencyFactor:
    def test_urgent_keyword_triggers_boost(self):
        assert urgency_factor("Fix urgent login bug") == 1.5

    def test_asap_keyword_triggers_boost(self):
        assert urgency_factor("Deploy ASAP") == 1.5

    def test_normal_title_no_boost(self):
        assert urgency_factor("Refactor dashboard") == 1.0


class TestCalculateVibeScore:
    def test_basic_score_is_deterministic_with_fixed_rng(self):
        # title="Test" (len=4), hours=2, urgency=1.0, rng=2.0
        # → 2*1.0 + 4*0.1 + 2.0 = 4.4
        score = calculate_vibe_score("Test", 2.0, rng=fixed_rng(2.0))
        assert score == 4.4

    def test_urgent_title_boosts_score(self):
        # title="urgent" (len=6), hours=2, urgency=1.5, rng=1.0
        # → 2*1.5 + 6*0.1 + 1.0 = 4.6
        score = calculate_vibe_score("urgent", 2.0, rng=fixed_rng(1.0))
        assert score == 4.6

    def test_score_is_rounded_to_2_decimals(self):
        score = calculate_vibe_score("abc", 1.0, rng=fixed_rng(1.23456789))
        # 1*1.0 + 3*0.1 + 1.23456789 = 2.53456789 → 2.53
        assert score == 2.53

    @pytest.mark.parametrize("hours,expected", [(1.0, 2.3), (5.0, 6.3), (10.0, 11.3)])
    def test_score_scales_with_hours(self, hours, expected):
        # title="ab" (len=2 → bonus=0.2), urgency=1.0, rng=1.1
        # → hours*1.0 + 0.2 + 1.1
        score = calculate_vibe_score("ab", hours, rng=fixed_rng(1.1))
        assert score == expected
