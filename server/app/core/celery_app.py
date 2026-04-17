import os
from celery import Celery

# Inside Docker, we use the service name 'redis'
# Outside Docker, we might need 'localhost'
REDIS_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")

celery_app = Celery(
    "concert_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.services.concert"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    # Optimize for many short-lived scraping tasks
    worker_prefetch_multiplier=1,
)

if __name__ == "__main__":
    celery_app.start()
