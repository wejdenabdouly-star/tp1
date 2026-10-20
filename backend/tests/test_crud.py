import os

# Base SQLite jetable pour les tests automatiques (n'affecte pas PostgreSQL)
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c


SAMPLE = {"name": "Clavier", "description": "Mécanique", "price": 49.9, "quantity": 10}


def test_create(client):
    r = client.post("/api/products", json=SAMPLE)
    assert r.status_code == 201
    body = r.json()
    assert body["id"] == 1 and body["name"] == "Clavier"


def test_list(client):
    client.post("/api/products", json=SAMPLE)
    client.post("/api/products", json={**SAMPLE, "name": "Souris"})
    r = client.get("/api/products")
    assert r.status_code == 200
    assert [p["name"] for p in r.json()] == ["Clavier", "Souris"]


def test_read_one(client):
    pid = client.post("/api/products", json=SAMPLE).json()["id"]
    r = client.get(f"/api/products/{pid}")
    assert r.status_code == 200 and r.json()["price"] == 49.9


def test_read_not_found(client):
    assert client.get("/api/products/999").status_code == 404


def test_update(client):
    pid = client.post("/api/products", json=SAMPLE).json()["id"]
    r = client.put(f"/api/products/{pid}", json={**SAMPLE, "price": 59.0, "quantity": 3})
    assert r.status_code == 200
    assert r.json()["price"] == 59.0 and r.json()["quantity"] == 3
    assert client.get(f"/api/products/{pid}").json()["price"] == 59.0


def test_update_not_found(client):
    assert client.put("/api/products/999", json=SAMPLE).status_code == 404


def test_delete(client):
    pid = client.post("/api/products", json=SAMPLE).json()["id"]
    assert client.delete(f"/api/products/{pid}").status_code == 204
    assert client.get(f"/api/products/{pid}").status_code == 404
    assert client.get("/api/products").json() == []


def test_delete_not_found(client):
    assert client.delete("/api/products/999").status_code == 404


def test_validation(client):
    r = client.post("/api/products", json={"name": "", "price": -1})
    assert r.status_code == 422
