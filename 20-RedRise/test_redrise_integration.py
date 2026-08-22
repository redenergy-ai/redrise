"""
RedRise end-to-end integration tests.

Run after the RedRise stack is available:

    pytest -v test_redrise_integration.py

Optionally override the API URL:

    REDRISE_API_URL=http://localhost:8000 pytest -v test_redrise_integration.py
"""

import os

import pytest
import requests


BASE_URL = os.getenv("REDRISE_API_URL", "http://localhost:8000").rstrip("/")
HEALTH_URL = f"{BASE_URL}/health"
RAG_URL = f"{BASE_URL}/api/redrise/rag"

REQUEST_TIMEOUT = 30
HEALTH_TIMEOUT = 5


def redrise_service_available() -> bool:
    """
    Return True only when the RedRise FastAPI health endpoint is reachable.

    A connection error, timeout, non-200 response, or malformed response means
    the integration environment is not ready, so the suite is skipped rather
    than reported as a product failure.
    """
    try:
        response = requests.get(HEALTH_URL, timeout=HEALTH_TIMEOUT)
        return response.status_code == 200
    except requests.RequestException:
        return False


pytestmark = pytest.mark.skipif(
    not redrise_service_available(),
    reason=f"RedRise service is not available at {BASE_URL}",
)


def post_rag(query: str, phase: str | None = None) -> requests.Response:
    """Send a request to the RedRise RAG endpoint."""
    payload = {"query": query}

    if phase is not None:
        payload["phase"] = phase

    return requests.post(
        RAG_URL,
        json=payload,
        timeout=REQUEST_TIMEOUT,
    )


def assert_contains_any(text: str, expected_terms: tuple[str, ...]) -> None:
    """Assert that text contains at least one expected term, case-insensitively."""
    normalized = text.casefold()

    assert any(term.casefold() in normalized for term in expected_terms), (
        f"Expected response to contain one of {expected_terms!r}, "
        f"but received: {text!r}"
    )


def test_health_endpoint() -> None:
    """
    Verify that FastAPI is healthy and that ChromaDB has been populated.

    A record count greater than zero confirms that knowledge ingestion has
    completed successfully.
    """
    response = requests.get(HEALTH_URL, timeout=HEALTH_TIMEOUT)

    assert response.status_code == 200

    data = response.json()

    assert data.get("status") == "ok"
    assert "records" in data
    assert isinstance(data["records"], int)
    assert data["records"] > 0, (
        "ChromaDB contains no records. Run the RedRise ingestion step first."
    )


def test_herbal_phase_routing_and_response() -> None:
    """
    Verify automatic routing to Phase 1 for an herbal/health-related query.

    The generated answer should include expected herbal knowledge terminology.
    """
    response = post_rag("I have insomnia and palpitations")

    assert response.status_code == 200

    data = response.json()

    assert data.get("phase") == "herbal"

    answer = data.get("answer")
    assert isinstance(answer, str)
    assert answer.strip()

    assert_contains_any(
        answer,
        (
            "Suan Zao Ren",
            "adaptogen",
        ),
    )


def test_clarification_response() -> None:
    """
    Verify that an ambiguous request triggers the clarification state.

    The API should ask the user to choose Phase 1, 2, or 3.
    """
    response = post_rag("I need help")

    assert response.status_code == 200

    data = response.json()

    assert data.get("phase") == "clarify"

    clarification = data.get("clarification")
    assert isinstance(clarification, str)
    assert clarification.strip()

    assert "Reply 1, 2, or 3" in clarification


def test_pause_phase_routing_and_response() -> None:
    """
    Verify automatic routing to the Pause phase.

    The answer should draw from the stillness/breath-practice knowledge base.
    """
    response = post_rag("Help me pause")

    assert response.status_code == 200

    data = response.json()

    assert data.get("phase") == "pause"

    answer = data.get("answer")
    assert isinstance(answer, str)
    assert answer.strip()

    assert_contains_any(
        answer,
        (
            "breath",
            "stillness",
        ),
    )


def test_journey_phase_routing_and_response() -> None:
    """
    Verify automatic routing to the Guided Journey phase.

    Session 1 should produce reflective or invitation-oriented material.
    """
    response = post_rag("Session 1 of the journey")

    assert response.status_code == 200

    data = response.json()

    assert data.get("phase") == "journey"

    answer = data.get("answer")
    assert isinstance(answer, str)
    assert answer.strip()

    assert_contains_any(
        answer,
        (
            "invitation",
            "reflect",
        ),
    )
