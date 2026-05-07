from collections.abc import Iterator

from fastapi import Request
from sqlalchemy.orm import Session

from apothecaria.db.session import SessionLocal
from apothecaria.domain.customer_queue import CustomerStore


def get_session() -> Iterator[Session]:
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_customer_store(request: Request) -> CustomerStore:
    store: CustomerStore = request.app.state.customer_store
    return store
