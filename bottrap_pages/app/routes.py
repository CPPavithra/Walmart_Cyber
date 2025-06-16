from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, JSONResponse
from starlette.templating import Jinja2Templates
from .utils import log_access, ban_ip, is_ip_banned

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    log_access(request)
    return templates.TemplateResponse("index.html", {"request": request})

@router.get("/checkout_fake")
async def fake_checkout(request: Request):
    ip = request.client.host
    log_access(request, trap=True)
    ban_ip(ip)
    return JSONResponse(status_code=403, content={"detail": "You’ve been identified as a bot. IP banned."})

@router.get("/botview", response_class=HTMLResponse)
async def botview(request: Request):
    log_access(request)
    return templates.TemplateResponse("botview.html", {"request": request})

@router.get("/hidden-trap")
async def trap_link(request: Request):
    log_access(request, trap=True)
    ban_ip(request.client.host)
    return JSONResponse(status_code=403, content={"detail": "Access denied: honeypot triggered."})


