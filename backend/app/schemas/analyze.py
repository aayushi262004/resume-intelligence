# backend/app/schemas/analyze.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AnalysisResult(BaseModel):
    ats_score: int
    matched_skills: list[str]
    missing_skills: list[str]
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]
    recommended_projects: list[str]
    recruiter_summary: str

class AnalysisResponse(BaseModel):
    id: int
    created_at: datetime
    job_description: str
    result: Optional[AnalysisResult] = None