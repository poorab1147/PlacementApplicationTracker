from sqlalchemy.orm import Session

from app.models.interview import Interview
from app.models.application import Application
from app.schemas.interview import InterviewCreate, InterviewUpdate


def get_user_application(
    db: Session,
    user_id: int,
    application_id: int,
):
    return (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == user_id,
        )
        .first()
    )


def create_interview(
    db: Session,
    user_id: int,
    application_id: int,
    data: InterviewCreate,
):
    application = get_user_application(
        db,
        user_id,
        application_id,
    )

    if not application:
        return None

    interview = Interview(
        application_id=application_id,
        **data.model_dump(),
    )

    db.add(interview)
    db.commit()
    db.refresh(interview)

    return interview


def get_interviews(
    db: Session,
    user_id: int,
    application_id: int,
):
    application = get_user_application(
        db,
        user_id,
        application_id,
    )

    if not application:
        return None

    return (
        db.query(Interview)
        .filter(
            Interview.application_id == application_id
        )
        .order_by(Interview.scheduled_at.asc())
        .all()
    )


def get_interview(
    db: Session,
    user_id: int,
    application_id: int,
    interview_id: int,
):
    application = get_user_application(
        db,
        user_id,
        application_id,
    )

    if not application:
        return None

    return (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.application_id == application_id,
        )
        .first()
    )


def update_interview(
    db: Session,
    user_id: int,
    application_id: int,
    interview_id: int,
    data: InterviewUpdate,
):
    interview = get_interview(
        db,
        user_id,
        application_id,
        interview_id,
    )

    if not interview:
        return None

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(interview, field, value)

    db.commit()
    db.refresh(interview)

    return interview


def delete_interview(
    db: Session,
    user_id: int,
    application_id: int,
    interview_id: int,
):
    interview = get_interview(
        db,
        user_id,
        application_id,
        interview_id,
    )

    if not interview:
        return False

    db.delete(interview)
    db.commit()

    return True