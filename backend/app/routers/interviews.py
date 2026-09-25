from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.interview import (
    InterviewCreate,
    InterviewResponse,
    InterviewUpdate,
)
from app.services.interview_service import (
    create_interview,
    delete_interview,
    get_interview,
    get_interviews,
    update_interview,
)


router = APIRouter(
    prefix="/api/applications/{application_id}/interviews",
    tags=["Interviews"],
)


@router.post(
    "",
    response_model=InterviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_interview_endpoint(
    application_id: int,
    data: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interview = create_interview(
        db=db,
        user_id=current_user.id,
        application_id=application_id,
        data=data,
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return interview


@router.get(
    "",
    response_model=list[InterviewResponse],
)
def get_interviews_endpoint(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interviews = get_interviews(
        db=db,
        user_id=current_user.id,
        application_id=application_id,
    )

    if interviews is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return interviews


@router.get(
    "/{interview_id}",
    response_model=InterviewResponse,
)
def get_interview_endpoint(
    application_id: int,
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interview = get_interview(
        db=db,
        user_id=current_user.id,
        application_id=application_id,
        interview_id=interview_id,
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )

    return interview


@router.put(
    "/{interview_id}",
    response_model=InterviewResponse,
)
def update_interview_endpoint(
    application_id: int,
    interview_id: int,
    data: InterviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interview = update_interview(
        db=db,
        user_id=current_user.id,
        application_id=application_id,
        interview_id=interview_id,
        data=data,
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )

    return interview


@router.delete(
    "/{interview_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_interview_endpoint(
    application_id: int,
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = delete_interview(
        db=db,
        user_id=current_user.id,
        application_id=application_id,
        interview_id=interview_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )

    return None