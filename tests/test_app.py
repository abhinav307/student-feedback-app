import os
import pytest
from app import app, get_db

@pytest.fixture
def client():
    # Use a temporary database for testing
    app.config["TESTING"] = True
    # We will use an in-memory sqlite db for tests by overriding the DATABASE config
    global DATABASE
    DATABASE = ':memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db = get_db()
            db.execute('''
                CREATE TABLE IF NOT EXISTS feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    receipt_id TEXT UNIQUE,
                    name TEXT NOT NULL,
                    course TEXT NOT NULL,
                    feedback TEXT NOT NULL,
                    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            db.execute('DELETE FROM feedback') # clear before test
            db.commit()
        yield client

def test_landing_page(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"Welcome to EduFeedback" in response.data

def test_student_submit(client):
    response = client.post(
        "/student",
        data={"name": "Alice", "course": "Python", "feedback": "Great!"},
        follow_redirects=True,
    )
    assert response.status_code == 200
    assert b"Feedback Received" in response.data
    assert b"Alice" in response.data

def test_manager_login_fail(client):
    response = client.post(
        "/manager/login",
        data={"password": "wrongpassword"},
        follow_redirects=True,
    )
    assert b"Invalid password!" in response.data

def test_manager_login_success(client):
    response = client.post(
        "/manager/login",
        data={"password": "admin123"},
        follow_redirects=True,
    )
    assert b"Feedback Dashboard" in response.data

def test_manager_access_denied(client):
    response = client.get("/manager", follow_redirects=True)
    assert b"Manager Portal" in response.data # Redirected to login
