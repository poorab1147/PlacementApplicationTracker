import os
import uuid

from fastapi import HTTPException, UploadFile, status


ALLOWED_MIME_TYPES = {
    "application/pdf",
}

ALLOWED_EXTENSIONS = {
    ".pdf",
}


def validate_pdf(
    file: UploadFile,
    max_size_mb: int,
) -> None:
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required",
        )

    extension = os.path.splitext(
        file.filename
    )[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed",
        )

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type",
        )


def generate_stored_filename(
    original_filename: str,
) -> str:
    extension = os.path.splitext(
        original_filename
    )[1].lower()

    return f"{uuid.uuid4()}{extension}"