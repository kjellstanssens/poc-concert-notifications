# 🚀 Server Project

FastAPI backend, Scraper engine, and Celery workers.

## 🛠️ Tech Stack
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **Task Queue:** [Celery](https://docs.celeryq.dev/)
- **ORM:** [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
- **Scraping:** [Scrapling](https://github.com/v1a0/scrapling)

## 🏃 Running Locally (No Docker)

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the API:
   ```bash
   uvicorn app.main:app --reload
   ```

Note: Managing Redis and PostgreSQL locally is required if not using the root Docker Compose.
