import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Resume, User
from app.schemas import ResumeCreate, ResumeOut, ResumeSummary, ResumeUpdate

router = APIRouter(prefix="/api/resumes", tags=["resumes"])


def _to_out(resume: Resume) -> ResumeOut:
    try:
        data = json.loads(resume.data) if resume.data else {}
    except json.JSONDecodeError:
        data = {}
    return ResumeOut(
        id=resume.id,
        title=resume.title,
        data=data,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
    )


def _get_owned_resume(resume_id: int, user: User, db: Session) -> Resume:
    resume = db.get(Resume, resume_id)
    if resume is None or resume.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="経歴書が見つかりません",
        )
    return resume


@router.get("", response_model=list[ResumeSummary])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Resume]:
    return (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.updated_at.desc())
        .all()
    )


@router.post("", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
def create_resume(
    payload: ResumeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeOut:
    resume = Resume(
        user_id=current_user.id,
        title=payload.title,
        data=json.dumps(payload.data, ensure_ascii=False),
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return _to_out(resume)


@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeOut:
    resume = _get_owned_resume(resume_id, current_user, db)
    return _to_out(resume)


@router.put("/{resume_id}", response_model=ResumeOut)
def update_resume(
    resume_id: int,
    payload: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeOut:
    resume = _get_owned_resume(resume_id, current_user, db)
    if payload.title is not None:
        resume.title = payload.title
    if payload.data is not None:
        resume.data = json.dumps(payload.data, ensure_ascii=False)
    db.commit()
    db.refresh(resume)
    return _to_out(resume)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    resume = _get_owned_resume(resume_id, current_user, db)
    db.delete(resume)
    db.commit()
