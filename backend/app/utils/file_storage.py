import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import io
from app.config import settings

def validate_and_save_image(file: UploadFile) -> str:
    """
    Validates file extension, size, and actual image content using Pillow.
    Saves to the uploads folder and returns the relative file path for storage in DB.
    """
    # 1. Extension check
    file_ext = Path(file.filename or "plant.jpg").suffix.lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format '{file_ext}'. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # 2. Read bytes & check size limit
    content = file.file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image file exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
        )
    
    # 3. Validate image data with PIL to ensure it is not a corrupted or malicious file
    try:
        image = Image.open(io.BytesIO(content))
        image.verify()  # Verifies file integrity
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted image file: {str(e)}"
        )
    
    # Reopen to convert / save cleanly
    image = Image.open(io.BytesIO(content))
    
    # If RGBA and saving as jpg, convert to RGB
    if image.mode in ("RGBA", "P") and file_ext in (".jpg", ".jpeg"):
        image = image.convert("RGB")
        
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    destination_path = Path(settings.UPLOAD_DIR) / unique_filename
    
    # Save optimized copy
    image.save(destination_path, quality=90, optimize=True)
    
    # Reset file pointer
    file.file.seek(0)
    
    # Return web-accessible path
    return f"/uploads/{unique_filename}"
