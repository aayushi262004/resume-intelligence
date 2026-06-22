# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import analyze, auth

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="AI-powered resume analysis API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "https://resume-intelligence-seven.vercel.app/login"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(analyze.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.app_name}