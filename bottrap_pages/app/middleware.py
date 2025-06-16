from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from .utils import is_ip_banned

class IPBanMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        ip = request.client.host
        if is_ip_banned(ip):
            return JSONResponse(status_code=403, content={"detail": "Forbidden – You are banned."})
        response = await call_next(request)
        return response
