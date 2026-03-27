from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
from app.config import settings
from app.database import SessionLocal

scheduler = None


def _run_probation_checks():
    from app.services.probation_service import probation_service
    db = SessionLocal()
    try:
        probation_service.check_and_fire_triggers(db)
    except Exception as e:
        print(f"[SCHEDULER] Probation check error: {e}")
    finally:
        db.close()


def _run_review_reminders():
    from app.services.review_service import review_service
    db = SessionLocal()
    try:
        review_service.send_reminders(db)
    except Exception as e:
        print(f"[SCHEDULER] Review reminder error: {e}")
    finally:
        db.close()


def start_scheduler():
    global scheduler

    # SQLAlchemyJobStore ensures only ONE pod runs each job (cluster-safe)
    jobstores = {
        "default": SQLAlchemyJobStore(url=settings.database_url)
    }
    executors = {"default": ThreadPoolExecutor(4)}
    job_defaults = {"coalesce": True, "max_instances": 1, "misfire_grace_time": 300}

    scheduler = BackgroundScheduler(
        jobstores=jobstores,
        executors=executors,
        job_defaults=job_defaults,
    )

    scheduler.add_job(
        _run_probation_checks,
        "interval",
        hours=6,
        id="probation_check",
        replace_existing=True,
    )
    scheduler.add_job(
        _run_review_reminders,
        "interval",
        hours=24,
        id="review_reminders",
        replace_existing=True,
    )

    scheduler.start()
    print("[SCHEDULER] Started — probation checks every 6h, review reminders every 24h")


def stop_scheduler():
    global scheduler
    if scheduler and scheduler.running:
        scheduler.shutdown(wait=False)
        print("[SCHEDULER] Stopped")
