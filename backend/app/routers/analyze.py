# backend/app/routers/analyze.py
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.pdf_service import extract_text_from_pdf
from app.services.groq_service import analyze_resume_with_groq
from app.schemas.analyze import AnalysisResponse, AnalysisResult
from app.core.database import get_db
from app.models.analysis import Analysis
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("", response_model=AnalysisResponse)
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    file_bytes = await resume.read()
    resume_text = extract_text_from_pdf(file_bytes)

    analysis = Analysis(
        user_id=current_user.id,
        resume_text=resume_text,
        job_description=job_description,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    ai_result = await analyze_resume_with_groq(resume_text, job_description)

    analysis.result = ai_result.model_dump()
    db.commit()
    db.refresh(analysis)

    return AnalysisResponse(
        id=analysis.id,
        created_at=analysis.created_at,
        job_description=analysis.job_description,
        result=ai_result,
    )


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    result = AnalysisResult(**analysis.result) if analysis.result else None

    return AnalysisResponse(
        id=analysis.id,
        created_at=analysis.created_at,
        job_description=analysis.job_description,
        result=result,
    )


@router.get("", response_model=list[AnalysisResponse])
def list_my_analyses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analyses = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )

    return [
        AnalysisResponse(
            id=a.id,
            created_at=a.created_at,
            job_description=a.job_description,
            result=AnalysisResult(**a.result) if a.result else None,
        )
        for a in analyses
    ]