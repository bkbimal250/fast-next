"""
CV upload handling
"""

import os
import uuid
from fastapi import UploadFile
from app.core.config import settings


async def save_cv_file(file: UploadFile) -> str:
    """
    Save uploaded CV file and return file path
    """
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    if file_ext not in settings.ALLOWED_CV_EXTENSIONS:
        raise ValueError(f"File type {file_ext} not allowed")
    
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, "cvs", filename)
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    # Save file
    with open(file_path, "wb") as f:
        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise ValueError("File too large")
        f.write(content)
    
    return file_path

