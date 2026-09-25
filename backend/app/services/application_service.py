from sqlalchemy.orm import Session

from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdate


def create_application(
    db: Session,
    user_id: int,
    application_data: ApplicationCreate,
) -> Application:
    data = application_data.model_dump()

    if data.get("application_url") is not None:
        data["application_url"] = str(data["application_url"])

    application = Application(
        user_id=user_id,
        **data,
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return application


def get_applications(
    db: Session,
    user_id: int,
    status: str | None = None,
    priority: str | None = None,
    company: str | None = None,
    job_title: str | None = None,
) -> list[Application]:

    query = db.query(Application).filter(
        Application.user_id == user_id
    )

    if status:
        query = query.filter(Application.status == status)

    if priority:
        query = query.filter(Application.priority == priority)

    if company:
        query = query.filter(
            Application.company_name.ilike(f"%{company}%")
        )

    if job_title:
        query = query.filter(
            Application.job_title.ilike(f"%{job_title}%")
        )

    return (
        query
        .order_by(Application.created_at.desc())
        .all()
    )


def get_application(
    db: Session,
    user_id: int,
    application_id: int,
) -> Application | None:
    return (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == user_id,
        )
        .first()
    )


def update_application(
    db: Session,
    user_id: int,
    application_id: int,
    application_data: ApplicationUpdate,
) -> Application | None:

    application = get_application(
        db,
        user_id,
        application_id,
    )

    if not application:
        return None

    update_data = application_data.model_dump(
        exclude_unset=True
    )

    if "application_url" in update_data:
        if update_data["application_url"] is not None:
            update_data["application_url"] = str(
                update_data["application_url"]
            )

    for field, value in update_data.items():
        setattr(application, field, value)

    db.commit()
    db.refresh(application)

    return application


def delete_application(
    db: Session,
    user_id: int,
    application_id: int,
) -> bool:

    application = get_application(
        db,
        user_id,
        application_id,
    )

    if not application:
        return False

    db.delete(application)
    db.commit()

    return True