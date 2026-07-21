"""
Lightweight fuzzy matching helpers for chatbot search.
"""

from __future__ import annotations

import re
from difflib import SequenceMatcher
from typing import Iterable

try:
    from rapidfuzz import fuzz, process
except ImportError:  # pragma: no cover - keeps local dev safe if dependency is missing
    fuzz = None
    process = None


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value.lower().strip())


def unique_values(values: Iterable[str | None]) -> list[str]:
    seen = set()
    result = []

    for value in values:
        normalized = normalize_text(value)
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        result.append(normalized)

    return result


def find_text_matches(message: str, candidates: Iterable[str | None], score_cutoff: int = 82) -> set[str]:
    """
    Return normalized candidate values mentioned in a user message.

    Exact word/phrase matches are preferred. RapidFuzz is used for typo-tolerant
    matching when available, with difflib as a lightweight fallback.
    """
    message_normalized = normalize_text(message)
    candidate_values = unique_values(candidates)
    matches = set()

    if not message_normalized or not candidate_values:
        return matches

    for candidate in candidate_values:
        if re.search(r"\b" + re.escape(candidate) + r"\b", message_normalized):
            matches.add(candidate)
            continue

        candidate_parts = [part for part in candidate.split(" ") if len(part) >= 4]
        if any(re.search(r"\b" + re.escape(part) + r"\b", message_normalized) for part in candidate_parts):
            matches.add(candidate)

    if matches:
        return matches

    if process and fuzz:
        best = process.extractOne(
            message_normalized,
            candidate_values,
            scorer=fuzz.token_set_ratio,
            score_cutoff=score_cutoff,
        )
        if best:
            matches.add(best[0])
            return matches

        message_tokens = [token for token in re.findall(r"[a-z0-9]+", message_normalized) if len(token) >= 4]
        for candidate in candidate_values:
            candidate_tokens = [token for token in re.findall(r"[a-z0-9]+", candidate) if len(token) >= 4]
            if not candidate_tokens:
                continue
            for message_token in message_tokens:
                token_score = max(fuzz.ratio(message_token, candidate_token) for candidate_token in candidate_tokens)
                if token_score >= score_cutoff:
                    matches.add(candidate)
                    break
        return matches

    for candidate in candidate_values:
        score = SequenceMatcher(None, message_normalized, candidate).ratio() * 100
        if score >= score_cutoff:
            matches.add(candidate)

    return matches
