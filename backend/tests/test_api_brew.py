from apothecaria.db.seed import seed_database


def test_brew_exact_recipe_returns_match(client, db_engine):
    with db_engine.connect() as conn:
        seed_database(conn)
    response = client.post("/api/brew", json={"ingredient_slugs": ["moonpetal", "sage", "root"]})
    assert response.status_code == 200
    body = response.json()
    assert body["matched_recipe_slug"] == "sleep_draught"
    assert body["matched_ailment_category"] == "sleep"
    assert body["quality_score"] == 1.0


def test_brew_unknown_returns_no_match(client, db_engine):
    with db_engine.connect() as conn:
        seed_database(conn)
    response = client.post("/api/brew", json={"ingredient_slugs": ["moonpetal", "feather"]})
    assert response.status_code == 200
    body = response.json()
    assert body["matched_recipe_slug"] is None
    assert body["matched_ailment_category"] is None
    assert body["quality_score"] == 0.0


def test_brew_empty_returns_400(client, db_engine):
    with db_engine.connect() as conn:
        seed_database(conn)
    response = client.post("/api/brew", json={"ingredient_slugs": []})
    assert response.status_code == 400
