from fastapi import APIRouter
from starlette.responses import Response
from starlette import status

from .endpoints import appointment, session, user, provider

api_routers = APIRouter()

@api_routers.get('/api', responses={200: {"model": None}})
def call_api_server():
    """
    Endpoint for start api services
    """
    return Response(status_code=status.HTTP_200_OK)

api_routers.include_router(appointment.router, prefix="/appointments", tags=["appointments"])
api_routers.include_router(user.router, prefix="/users", tags=["users"])
api_routers.include_router(session.router, prefix="/sessions", tags=["sessions"])
api_routers.include_router(provider.router, prefix="/providers", tags=["providers"])
