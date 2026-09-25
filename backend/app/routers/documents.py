import os

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentResponse
from app.services.document_service import (
    delete_document,
    get_document,
    get_documents,
    get_user_application,
)
from app.utils.file_validation import (
    generate_stored_filename,
    validate_pdf,
)


router = APIRouter(
    prefix="/api/applications/{application_id}/documents",
    tags=["Documents"],
)


@router.post(
    "",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    application_id: int,
    document_type: str = Form("Resume"),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = get_user_application(
        db,
        current_user.id,
        application_id,
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    max_size_mb = 5

    validate_pdf(
        file,
        max_size_mb,
    )

    contents = await file.read()

    max_size_bytes = max_size_mb * 1024 * 1024

    if len(contents) > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds 5 MB limit",
        )

    stored_filename = generate_stored_filename(
        file.filename
    )

    upload_dir = os.path.join(
        "uploads",
        "resumes",
    )

    os.makedirs(
        upload_dir,
        exist_ok=True,
    )

    file_path = os.path.join(
        upload_dir,
        stored_filename,
    )

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    document = Document(
        application_id=application_id,
        document_type=document_type,
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_path=file_path,
        mime_type=file.content_type,
        file_size=len(contents),
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


@router.get(
    "",
    response_model=list[DocumentResponse],
)
def list_documents(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    documents = get_documents(
        db,
        current_user.id,
        application_id,
    )

    if documents is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return documents


@router.get("/{document_id}")
def download_document(
    application_id: int,
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = get_document(
        db,
        current_user.id,
        document_id,
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    if not os.path.exists(document.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    return FileResponse(
        path=document.file_path,
        media_type=document.mime_type,
        filename=document.original_filename,
    )


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_document_endpoint(
    application_id: int,
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = delete_document(
        db,
        current_user.id,
        document_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    return None