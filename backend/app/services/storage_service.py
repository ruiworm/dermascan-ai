import os
import uuid
import logging
import aiofiles
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.models.analysis import Image

logger = logging.getLogger(__name__)


class StorageService:
    """Local file storage service — saves uploaded files to disk."""

    def __init__(self):
        self.upload_dir = os.path.join(settings.KNOWLEDGE_BASE_DIR, "temp")
        os.makedirs(self.upload_dir, exist_ok=True)
        logger.info(f"StorageService initialized. Upload directory: {self.upload_dir}")

    async def save_upload_file(self, upload_file: UploadFile, user_id: int, db: Session) -> Image:
        """
        Save an uploaded file to local disk and create a database record.
        """
        # Read file content
        content = await upload_file.read()
        file_size = len(content)

        # Determine file extension
        original_filename = upload_file.filename or "unknown_image"
        file_extension = original_filename.split(".")[-1] if "." in original_filename else "jpg"

        # Generate safe unique filename
        safe_filename = f"{uuid.uuid4().hex}.{file_extension}"
        local_path = os.path.join(self.upload_dir, safe_filename)

        # Write file to local disk
        async with aiofiles.open(local_path, 'wb') as f:
            await f.write(content)

        logger.info(f"Saved file locally: {local_path} ({file_size} bytes)")

        # URL path for frontend to access the file via static mount
        file_url = f"/api/v1/static/{safe_filename}"

        # Create database record
        db_image = Image(
            user_id=user_id,
            filename=original_filename,
            file_path=file_url,
            content_type=upload_file.content_type,
            file_size=file_size
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)

        # Attach local path for downstream model processing
        setattr(db_image, "_local_path", local_path)

        return db_image


storage_service = StorageService()
