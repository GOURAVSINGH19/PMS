from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

# Import all models before creating tables
from app.models import user, team, goal, subtask, progress, feedback, score

Base.metadata.create_all(bind=engine)

from app.routers import users, teams, goals, weightage, auth

app = FastAPI(title="Goal Management System", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(teams.router, prefix="/api/v1/teams", tags=["teams"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(goals.router, prefix="/api/v1/goals", tags=["goals"])
app.include_router(weightage.router, prefix="/api/v1", tags=["weightage"])

@app.get("/health")
def health():
    return {"status": "healthy"}
