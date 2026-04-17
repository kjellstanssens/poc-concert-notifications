# 🎫 POC Concert Notifications

A high-performance notification system for concert events, built with **FastAPI**, **SQLAlchemy 2.0**, and **PostgreSQL**. This project streamlines the process of scraping, storing, and notifying users about upcoming concerts across various venues.

---

## 🛠️ Tech Stack
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **ORM:** [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/) (Postgres driver: `psycopg2-binary`)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Infrastructure:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Migrations:** [Alembic](https://alembic.sqlalchemy.org/)
- **Testing:** [Pytest](https://docs.pytest.org/)

---

## 🚀 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- [Git](https://git-scm.com/)

### Environment Setup
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd poc-concert-notifications
   ```

2. **Build and Start Containers:**
   Launch the API and Database in one command:
   ```bash
   docker compose -f docker/docker-compose.yml up --build
   ```

3. **Stop & Cleanup:**
   To shut down services and remove volumes:
   ```bash
   docker compose -f docker/docker-compose.yml down -v
   ```

---

## 🗄️ Database Management

We use **Alembic** for schema migrations. All commands are executed inside the running `concert_api` container.

### 🔄 Applying Migrations
Apply all pending schema changes to the Postgres instance:
```bash
docker exec -it concert_api alembic upgrade head
```

### ✨ Creating a New Migration
After updating mapping models in `app/models/`, generate a new migration script:
```bash
docker exec -it concert_api alembic revision --autogenerate -m "description of changes"
```

---

## 🧪 Testing

The project uses `pytest` for integration and unit testing.

### Standard Test Run
Run all tests silently:
```bash
docker exec -it concert_api python -m pytest
```

### Verbose Mode with Logs
Run tests with detailed output and print statements (`stdout`):
```bash
docker exec -it concert_api python -m pytest -v -s
```

---

## �️ Database Management

We use **Alembic** for schema migrations. All commands are executed inside the running `concert_api` container.

### 🔄 Applying Migrations
Apply all pending schema changes to the Postgres instance:
```bash
docker exec -it concert_api alembic upgrade head
```

### ✨ Creating a New Migration
When you change a model in `app/models/`, generate a new migration script:
```bash
docker exec -it concert_api alembic revision --autogenerate -m "description of changes"
```

---

```text
server/app/
├── api/        # Endpoint definitions and router logic
├── core/       # Global configuration, database sessions, and base classes
├── models/     # SQLAlchemy 2.0 declarative mapping models
├── schemas/    # Pydantic v2 data validation and serialization models
├── services/   # Business logic layer (The "Bridge" between schemas and models)
└── data/       # Static or seed data storage
```

- **Models**: Define the database schema.
- **Schemas**: Define the API request and response contracts.
- **Services**: Contain logic for database interactions (CRUD, soft deletes, joinedlookups).
- **API**: Handles HTTP routing and dependency injection.

---

## 🛠️ Development Utility Commands

### Container Interaction
- **Access Shell:** `docker exec -it concert_api slash bash`
- **Check Logs:** `docker logs -f concert_api`
- **Python Console:** `docker exec -it concert_api python`

### Seeding Data
If a seed script is provided in `app/seed.py`:
```bash
docker exec -it concert_api python -m app.seed
```

---
*Developed as a Proof of Concept for automated concert notifications.*
