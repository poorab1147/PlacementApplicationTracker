import os

from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.document import Document


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


def get_documents(
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
        db.query(Document)
        .filter(
            Document.application_id == application_id
        )
        .order_by(Document.uploaded_at.desc())
        .all()
    )


def get_document(
    db: Session,
    user_id: int,
    document_id: int,
):
    return (
        db.query(Document)
        .join(Application)
        .filter(
            Document.id == document_id,
            Application.user_id == user_id,
        )
        .first()
    )


def delete_document(
    db: Session,
    user_id: int,
    document_id: int,
) -> bool:
    document = get_document(
        db,
        user_id,
        document_id,
    )

    if not document:
        return False

    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    db.delete(document)
    db.commit()

    return True