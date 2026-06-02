import os
import tempfile

os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.mktemp(suffix='.db')}"
os.environ["SECRET_KEY"] = "test-secret"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

client = TestClient(app)


def _register(email: str = "test@example.com", password: str = "password123"):
    return client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "name": "テスト太郎"},
    )


def test_health():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_register_login_and_resume_crud():
    resp = _register("crud@example.com")
    assert resp.status_code == 201, resp.text
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # duplicate registration is rejected
    dup = _register("crud@example.com")
    assert dup.status_code == 409

    # login works
    login = client.post(
        "/api/auth/login",
        json={"email": "crud@example.com", "password": "password123"},
    )
    assert login.status_code == 200, login.text

    # me endpoint
    me = client.get("/api/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "crud@example.com"

    # create resume
    payload = {
        "title": "私の職務経歴書",
        "data": {"summary": "Webエンジニア", "experiences": [{"company": "ABC社"}]},
    }
    created = client.post("/api/resumes", json=payload, headers=headers)
    assert created.status_code == 201, created.text
    resume_id = created.json()["id"]
    assert created.json()["data"]["summary"] == "Webエンジニア"

    # list resumes
    listed = client.get("/api/resumes", headers=headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    # update resume
    updated = client.put(
        f"/api/resumes/{resume_id}",
        json={"title": "更新後タイトル"},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "更新後タイトル"

    # delete resume
    deleted = client.delete(f"/api/resumes/{resume_id}", headers=headers)
    assert deleted.status_code == 204
    assert client.get("/api/resumes", headers=headers).json() == []


def test_requires_auth():
    assert client.get("/api/resumes").status_code == 401


def test_other_user_cannot_access():
    a = _register("a@example.com").json()["access_token"]
    b = _register("b@example.com").json()["access_token"]
    created = client.post(
        "/api/resumes",
        json={"title": "Aの経歴書", "data": {}},
        headers={"Authorization": f"Bearer {a}"},
    )
    rid = created.json()["id"]
    resp = client.get(f"/api/resumes/{rid}", headers={"Authorization": f"Bearer {b}"})
    assert resp.status_code == 404
