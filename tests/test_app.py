"""
Unit tests for the Student Feedback Web Application.
"""

import pytest
from app import app


@pytest.fixture
def client():
    """Create a test client for the Flask application."""
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture(autouse=True)
def clear_feedbacks():
    """Clear feedback list before each test."""
    from app import feedbacks
    feedbacks.clear()


def test_index_page_loads(client):
    """Test that the home page loads successfully."""
    response = client.get("/")
    assert response.status_code == 200
    assert b"Student Feedback Form" in response.data


def test_submit_feedback(client):
    """Test submitting feedback via POST."""
    response = client.post(
        "/submit",
        data={"name": "Alice", "course": "Python", "feedback": "Great course!"},
        follow_redirects=True,
    )
    assert response.status_code == 200
    assert b"Alice" in response.data
    assert b"Python" in response.data
    assert b"Great course!" in response.data


def test_empty_fields_ignored(client):
    """Test that empty submissions do not add a feedback entry."""
    client.post(
        "/submit",
        data={"name": "", "course": "", "feedback": ""},
        follow_redirects=True,
    )
    response = client.get("/")
    assert b"No feedback submitted yet." in response.data


def test_multiple_feedbacks(client):
    """Test that multiple feedback entries are displayed."""
    client.post(
        "/submit",
        data={"name": "Bob", "course": "Java", "feedback": "Loved it!"},
        follow_redirects=True,
    )
    client.post(
        "/submit",
        data={"name": "Carol", "course": "C++", "feedback": "Very helpful."},
        follow_redirects=True,
    )
    response = client.get("/")
    assert b"Bob" in response.data
    assert b"Carol" in response.data
