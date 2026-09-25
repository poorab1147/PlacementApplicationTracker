from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.application import Application
from app.models.interview import Interview
from app.models.user import User


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats")
def dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_applications = (
        db.query(func.count(Application.id))
        .filter(
            Application.user_id == current_user.id
        )
        .scalar()
    )

    status_rows = (
        db.query(
            Application.status,
            func.count(Application.id),
        )
        .filter(
            Application.user_id == current_user.id
        )
        .group_by(Application.status)
        .order_by(
            func.count(Application.id).desc()
        )
        .all()
    )

    interview_count = (
        db.query(func.count(Interview.id))
        .join(Application)
        .filter(
            Application.user_id == current_user.id
        )
        .scalar()
    )

    offers = (
        db.query(func.count(Application.id))
        .filter(
            Application.user_id == current_user.id,
            Application.status == "Offer",
        )
        .scalar()
    )

    rejections = (
        db.query(func.count(Application.id))
        .filter(
            Application.user_id == current_user.id,
            Application.status == "Rejected",
        )
        .scalar()
    )

    return {
        "total_applications": total_applications,
        "interviews": interview_count,
        "offers": offers,
        "rejections": rejections,
        "applications_by_status": {
            status: count
            for status, count in status_rows
        },
    }


@router.get("/upcoming-deadlines")
def upcoming_deadlines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = datetime.now(
        timezone.utc
    ).date()

    next_week = today + timedelta(days=7)

    applications = (
        db.query(Application)
        .filter(
            Application.user_id == current_user.id,
            Application.deadline >= today,
            Application.deadline <= next_week,
        )
        .order_by(
            Application.deadline.asc()
        )
        .all()
    )

    return [
        {
            "id": application.id,
            "company_name": application.company_name,
            "job_title": application.job_title,
            "deadline": application.deadline,
            "status": application.status,
            "priority": application.priority,
        }
        for application in applications
    ]


@router.get("/upcoming-interviews")
def upcoming_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)

    rows = (
        db.query(
            Application.company_name,
            Application.job_title,
            Interview.round_name,
            Interview.interview_type,
            Interview.scheduled_at,
        )
        .join(
            Interview,
            Interview.application_id
            == Application.id,
        )
        .filter(
            Application.user_id == current_user.id,
            Interview.scheduled_at >= now,
        )
        .order_by(
            Interview.scheduled_at.asc()
        )
        .all()
    )

    return [
        {
            "company_name": row.company_name,
            "job_title": row.job_title,
            "round_name": row.round_name,
            "interview_type": row.interview_type,
            "scheduled_at": row.scheduled_at,
        }
        for row in rows
    ]