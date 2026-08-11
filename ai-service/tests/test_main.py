import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "youtube-shorts-ai"

def test_generate_script_valid():
    """Test script generation with valid input"""
    response = client.post("/generate-script", json={
        "topic": "How to make coffee",
        "style": "educational",
        "max_length": 60,
        "tone": "casual"
    })
    assert response.status_code == 200
    data = response.json()
    assert "script" in data
    assert "tokens_used" in data
    assert "model" in data
    assert len(data["script"]) > 0

def test_generate_script_with_defaults():
    """Test script generation with default parameters"""
    response = client.post("/generate-script", json={
        "topic": "Python programming"
    })
    assert response.status_code == 200
    assert "script" in response.json()

def test_generate_script_invalid_topic():
    """Test script generation with invalid topic"""
    response = client.post("/generate-script", json={
        "topic": "AB"  # Too short
    })
    assert response.status_code == 400

def test_generate_script_invalid_max_length():
    """Test script generation with invalid max_length"""
    response = client.post("/generate-script", json={
        "topic": "Valid topic",
        "max_length": 200  # Too long
    })
    assert response.status_code == 400

def test_validate_script():
    """Test script validation"""
    script_text = "This is a test script with enough content to validate properly."
    response = client.post("/validate-script", json={
        "script": script_text
    })
    assert response.status_code == 200
    data = response.json()
    assert "valid" in data
    assert "word_count" in data
    assert "estimated_duration" in data

def test_validate_script_empty():
    """Test validation with empty script"""
    response = client.post("/validate-script", json={
        "script": ""
    })
    assert response.status_code == 400

def test_validate_script_short():
    """Test validation with very short script"""
    response = client.post("/validate-script", json={
        "script": "Short"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] == False

def test_generate_script_empty_topic():
    """Test script generation with empty topic"""
    response = client.post("/generate-script", json={
        "topic": ""
    })
    assert response.status_code == 400

def test_concurrent_requests():
    """Test handling multiple concurrent requests"""
    topics = ["Topic 1", "Topic 2", "Topic 3"]
    responses = [
        client.post("/generate-script", json={"topic": topic})
        for topic in topics
    ]
    assert all(r.status_code == 200 for r in responses)
    assert all("script" in r.json() for r in responses)
