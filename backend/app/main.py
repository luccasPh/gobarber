import cloudinary
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from mongoengine.connection import connect
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings
from app.api.routers import api_routers


limiter = Limiter(key_func=get_remote_address, default_limits=["50/minute"])
app = FastAPI(title=settings.PROJECT_NAME, debug=settings.DEBUG,)

@app.on_event("startup")
async def startup_event():
    if settings.MONGO_DB_URI:
        connect(host=settings.MONGO_DB_URI)
    else:
        connect(settings.MONGO_DB, host=settings.MONGO_HOST, port=settings.MONGO_PORT)
    if settings.CLOUDINARY_CLOUD_NAME:
        cloudinary.config(
            cloud_name = settings.CLOUDINARY_CLOUD_NAME,
            api_key = settings.CLOUDINARY_API_KEY ,
            api_secret = settings.CLOUDINARY_API_SECRET
        )

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
app.add_middleware(
    SlowAPIMiddleware
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

if settings.DEBUG and settings.MEDIA_ROOT:
    app.mount(
        f"/{settings.MEDIA_ROOT}", 
        StaticFiles(directory=settings.MEDIA_ROOT), 
        name=settings.MEDIA_ROOT
)

app.include_router(api_routers)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)