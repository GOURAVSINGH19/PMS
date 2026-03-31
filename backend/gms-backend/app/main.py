from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

# Import ALL models so SQLAlchemy creates all tables
from app.models import user, team, goal, subtask, progress, feedback, score
from app.models import probation, review, notification

Base.metadata.create_all(bind=engine)

from app.routers import users, teams, goals, weightage, auth
from app.routers import probation as probation_router
from app.routers import reviews as reviews_router
from app.routers import notifications as notifications_router
from app.routers import dashboard as dashboard_router
from app.routers import admin as admin_router
from app.routers import admin_flags as admin_flags_router

app = FastAPI(title="PMS — Performance & Goal Management Platform", version="2.0.0")

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"[DEBUG] {request.method} {request.url.path}")
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# ── Existing routes ────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/api/v1/auth",      tags=["auth"])
app.include_router(teams.router,     prefix="/api/v1/teams",     tags=["teams"])
app.include_router(users.router,     prefix="/api/v1/users",     tags=["users"])
app.include_router(goals.router,     prefix="/api/v1/goals",     tags=["goals"])
app.include_router(weightage.router, prefix="/api/v1",           tags=["weightage"])

# ── New PMS routes ─────────────────────────────────────────────────────────
app.include_router(probation_router.router,     prefix="/api/v1/probation",      tags=["probation"])
app.include_router(reviews_router.router,       prefix="/api/v1",                tags=["reviews"])
app.include_router(notifications_router.router, prefix="/api/v1/notifications",  tags=["notifications"])
app.include_router(dashboard_router.router,     prefix="/api/v1/dashboard",      tags=["dashboard"])
app.include_router(admin_router.router,         prefix="/api/v1/admin",          tags=["admin"])
app.include_router(admin_flags_router.router,   prefix="/api/v1/admin",          tags=["admin-flags"])


@app.on_event("startup")
def startup():
    from app.scheduler import start_scheduler
    try:
        start_scheduler()
    except Exception as e:
        print(f"[SCHEDULER] Failed to start: {e}")


@app.on_event("shutdown")
def shutdown():
    from app.scheduler import stop_scheduler
    stop_scheduler()


@app.get("/health")
def health():
    return {"status": "healthy", "version": "2.0.0"}
