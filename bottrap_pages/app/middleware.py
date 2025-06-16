from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from .utils import is_ip_banned

# app/middleware.py
class IPBanMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        ip = request.client.host

        # ⛔ Exempt localhost
        if ip == "127.0.0.1":
            return await call_next(request)

        # Existing logic
        with open("banned_ips.json", "r") as f:
            banned_ips = json.load(f)
        if ip in banned_ips:
            return JSONResponse(status_code=403, content={"detail": "Forbidden – You are banned."})
        response = await call_next(request)
        return response

