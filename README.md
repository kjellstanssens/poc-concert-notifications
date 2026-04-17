# 🎫 POC Concert Notifications (Monorepo)

A scalable, distributed concert notification system.

## 📂 Project Structure

- **[server/](server/)**: FastAPI backend, Celery workers, and Scraper engine.
- **[web-user/](web-user/)**: User-facing React application for managing subscriptions.
- **[web-admin/](web-admin/)**: Admin dashboard for system monitoring (Planned).

---

## 🚀 Quick Start (Full Stack)

Launch the entire infrastructure using Docker Compose from the root:

```bash
docker compose up --build
```

### Services Summary
- **API**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Flower (Celery Monitor)**: [http://localhost:5555](http://localhost:5555)
- **Maildev (Email Inbox)**: [http://localhost:1080](http://localhost:1080)
- **pgAdmin**: [http://localhost:5050](http://localhost:5050)

---

## 🛠️ Development

### Server
See [server/README.md](server/README.md) for backend-specific details.

### Web User
Currently in development.

| Service | URL | Note |
| :--- | :--- | :--- |
| **FastAPI Swagger UI** | [http://localhost:8000/docs](http://localhost:8000/docs) | API Documentation & Testing |
| **Flower (Celery)** | [http://localhost:5555](http://localhost:5555) | Monitor background tasks & workers |
| **pgAdmin 4** | [http://localhost:5050](http://localhost:5050) | `admin@admin.com` / `admin` |
| **Redis** | `localhost:6380` | External access port |

---

## 🕷️ Scraper Operations

The scraper is configuration-driven via `server/configs/scraper_config.yaml`.

### Run Scraper (Parallelized)
Trigger a full scrape of all configured venues. This script dispatches items to Celery workers for parallel processing:
```bash
docker exec -it concert_api python run_scraper.py
```

### Lifecycle Management
- **New**: Concerts added to DB with an `active` status.
- **Updated**: If the `content_hash` changes (e.g., date rescheduled), the record is updated.
- **Cancelled**: If a concert is no longer present in the source, it is marked as `cancelled`.

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
