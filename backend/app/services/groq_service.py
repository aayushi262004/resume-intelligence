# backend/app/services/groq_service.py
import json
from groq import AsyncGroq
from app.core.config import settings
from app.schemas.analyze import AnalysisResult
from fastapi import HTTPException

client = AsyncGroq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """
You are an expert ATS (Applicant Tracking System) and technical recruiter.
Analyze the provided resume against the job description and return ONLY a
valid JSON object — no markdown, no explanation, no backticks. Just the JSON.

The JSON must exactly follow this schema:
{
  "ats_score": <integer 0-100>,
  "matched_skills": [<list of skills present in both resume and JD>],
  "missing_skills": [<list of skills in JD but absent from resume>],
  "strengths": [<list of 3-5 candidate strengths relevant to this role>],
  "weaknesses": [<list of 2-3 gaps or concerns for this role>],
  "suggestions": [<list of 3-5 specific, actionable resume improvements>],
  "recommended_projects": [<list of 2-3 project ideas that would close skill gaps>],
  "recruiter_summary": "<2-3 sentence summary a recruiter would write>"
}

Rules:
- ats_score must reflect genuine fit. 90+ means exceptional match.
- All list items must be plain strings, not objects.
- recruiter_summary must be professional third-person tone.
- Return nothing except the JSON object.
"""

async def analyze_resume_with_groq(
    resume_text: str,
    job_description: str,
) -> AnalysisResult:

    user_message = f"""
RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}
"""

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.2,
            max_tokens=1500,
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"AI service unavailable: {str(e)}"
        )

    raw_content = response.choices[0].message.content.strip()

    try:
        parsed = json.loads(raw_content)
        return AnalysisResult(**parsed)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI returned malformed response. Try again. Error: {str(e)}"
        )