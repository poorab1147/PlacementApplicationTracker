from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationUpdate,
)
from app.services.application_service import (
    create_application,
    delete_application,
    get_application,
    get_applications,
    update_application,
)


router = APIRouter(
    prefix="/api/applications",
    tags=["Applications"],
)


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_application_endpoint(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_application(
        db=db,
        user_id=current_user.id,
        application_data=application_data,
    )


@router.get(
    "",
    response_model=list[ApplicationResponse],
)
def get_applications_endpoint(
    status: str | None = None,
    priority: str | None = None,
    company: str | None = None,
    job_title: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_applications(
        db=db,
        user_id=current_user.id,
        status=status,
        priority=priority,
        company=company,
        job_title=job_title,
    )


@router.get(
    "/{application_id}",
    response_model=ApplicationResponse,
)
def get_application_endpoint(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = get_application(
        db=db,
        user_id=current_user.id,
        application_id=application_id,
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return application


@router.put(
    "/{application_id}",
    response_model=ApplicationResponse,
)
def update_application_endpoint(
    application_id: int,
    application_data: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = update_application(
        db=db,
        user_id=current_user.id,
        application_id=application_id,
        application_data=application_data,
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return application


@router.delete(
    "/{application_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_application_endpoint(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = delete_application(
        db=db,
        user_id=current_user.id,
        application_id=application_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return None