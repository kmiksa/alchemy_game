from apothecaria.db.seed import seed_database


def test_inventory_returns_six_ingredients(client, db_engine):
    with db_engine.connect() as conn:
        seed_database(conn)
    response = client.get("/api/inventory")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 6
    slugs = {item["slug"] for item in data}
    assert {"moonpetal", "sage", "root", "feather", "mushroom", "eye-of-newt"} == slugs


def test_inventory_item_shape(client, db_engine):
    with db_engine.connect() as conn:
        seed_database(conn)
    response = client.get("/api/inventory")
    item = response.json()[0]
    assert {"slug", "name", "lore", "sprite"} <= set(item.keys())
