from pathlib import Path
import cloudinary
import cloudinary.uploader
import cloudinary.api
import cloudinary.utils
import uuid

from app.core.config import settings

def save(file: bytes) -> str:
    if settings.CLOUDINARY_CLOUD_NAME:
        data = cloudinary.uploader.upload(file, folder=settings.CLOUDINARY_FOLDER_PATH)
        return data["public_id"]
    
    else:
        file_id = f"{uuid.uuid4().hex}.png"
        path = settings.BASE_DIR.joinpath(settings.MEDIA_ROOT, file_id)
        with open(path, "wb") as w:
            w.write(file)

        return file_id

def update(file: bytes, file_id: str) -> str:
    if settings.CLOUDINARY_CLOUD_NAME:
        data = cloudinary.uploader.upload(
            file,
            public_id=file_id
        )
        return data["public_id"]

    else:
        old_path = settings.BASE_DIR.joinpath(settings.MEDIA_ROOT, file_id)
        Path.unlink(old_path)

        new_file_id = f"{uuid.uuid4().hex}.png"
        new_path = settings.BASE_DIR.joinpath(settings.MEDIA_ROOT, new_file_id)
        with open(new_path, "wb") as w:
            w.write(file)
            
        return new_file_id

def get_url(file_id: str) -> str:
    if settings.CLOUDINARY_CLOUD_NAME:
        data = cloudinary.api.resource(file_id)
        return data["url"]
        
    else:
        return f"{settings.API_SERVER_URL}/tmp/{file_id}"

