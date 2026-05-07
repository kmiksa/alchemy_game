def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_lifespan_creates_customer_store(client):
    """The lifespan startup hook should attach a CustomerStore to app.state."""
    from apothecaria.domain.customer_queue import CustomerStore

    assert isinstance(client.app.state.customer_store, CustomerStore)
