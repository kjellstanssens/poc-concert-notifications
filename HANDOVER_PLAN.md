# 🚀 Project Handover: Scraper & Admin Portal (DB-Migration Phase)

## 📍 Current Status
We have successfully pivoted from **static YAML configuration files** to a **dynamic Database-driven architecture**. The system is now prepared for deployment where venues and scraper settings can be added/edited at runtime without server restarts.

### ✅ Completed
- **Database Schema**: Updated `Venue` model with `scraper_config: JSON` and `is_active` fields.
- **Alembic Migrations**: Reset to a clean initial state (`11f67fda1e7a`) for SQLite compatibility.
- **Backend API**: Added CRUD endpoints for `Venues` in FastAPI, allowing management of scraper selectors via JSON.
- **Database Seeding**: Populated `server/data/app.db` with sample venues (AB, Trix, etc.) including their scraper logic.
- **Visual Builder (v1.5)**: Refactored the "Studio" UI in `web-admin` to fetch and save directly to the API instead of files.

---

## 📅 Plan of Action for Next Session

### 1. 🛠️ Finalize Admin UI Wiring
- **Verify Save Flow**: Ensure the "Publish Nodes" button in `web-admin/src/app/page.tsx` correctly hits the `PATCH /api/venues/{id}` endpoint.
- **Config Sync**: Double-check that `scraper_config` in the DB correctly maps to the `selectors`, `date_masking`, and `performer_strategy` fields in the UI.

### 2. 🤖 Scraper Engine Refactor
- **Transition from YAML to DB**: Update `server/run_scraper.py` and `server/scraper/engine.py`.
    - *Current*: Reads from `configs/scraper_config.yaml`.
    - *Target*: Query the `Venue` table for all rows where `is_active=True` and use their `scraper_config` field for scraping logic.
- **Async Scraping**: Ensure the Celery workers can handle the JSON configuration passed from the DB.

### 3. 🌐 Web-User Discovery Portal
- **Build Search/Filter**: Implement the frontend for `web-user` to browse the concerts gathered by the scraper.
- **Subscription Engine**: Start the work on allowing users to subscribe to specific performers or venues (logic already in `server/app/models/subscription.py`).

---

## 🏗️ Technical Cheat Sheet

### Running the Project
- **Backend API**: `cd server ; uvicorn app.main:app --reload` (Port 8000)
- **Admin Studio**: `cd web-admin ; npm run dev -- -p 3001` (Port 3001)
- **Database**: `server/data/app.db` (SQLite)
- **Python Path**: Always set `$env:PYTHONPATH = "server"` when running scripts from the root.

### Key Files
- `server/app/models/venue.py`: The "Source of Truth" for scraper settings.
- `web-admin/src/app/page.tsx`: The Visual Config Builder.
- `server/app/seed.py`: Run this to reset sample data.

---
*Generated for handover on April 17, 2026. Ready for the next agent to pick up at the Scraper Engine refactor step.*
