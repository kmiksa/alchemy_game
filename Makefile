.PHONY: dev test lint format type seed db-reset clean help

PYTHON := uv run

help:
	@echo "Targets: dev, test, lint, format, type, seed, db-reset, clean"

dev:
	$(PYTHON) uvicorn apothecaria.main:app --reload --host 0.0.0.0 --port 8000 --app-dir backend

test:
	$(PYTHON) pytest

lint:
	$(PYTHON) ruff check backend

format:
	$(PYTHON) ruff format backend

type:
	$(PYTHON) mypy backend/apothecaria

seed:
	$(PYTHON) python -m apothecaria.db.seed

db-reset:
	rm -f apothecaria.sqlite apothecaria.sqlite-journal
	$(MAKE) seed

clean:
	rm -rf .venv .pytest_cache .mypy_cache .ruff_cache *.egg-info __pycache__
	find . -type d -name __pycache__ -exec rm -rf {} +
