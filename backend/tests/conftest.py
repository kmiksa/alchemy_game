from collections.abc import Iterator

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from apothecaria.db.session import Base


@pytest.fixture
def db_engine():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture
def db_session(db_engine) -> Iterator[Session]:
    SessionLocal = sessionmaker(
        bind=db_engine, autoflush=False, expire_on_commit=False, class_=Session
    )
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
