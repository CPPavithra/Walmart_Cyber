from fastapi import FastAPI, Request, Response, status
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from starlette.templating import Jinja2Templates
from starlette.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
import logging, time

app = FastAPI()

#app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")
logger = logging.getLogger("bottrap")
handler = logging.FileHandler("bottrap.log")
logger.addHandler(handler)
logger.setLevel(logging.INFO)

BANNED_IPS = set()
COOKIE_NAME = "bot_cookie"
HONEYPOTS = ["/checkout_fake", "/hidden_offer", "/hidden_cart"]

class BotDetectionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        ip = request.client.host
        ua = request.headers.get("user-agent", "none")
        if ip in BANNED_IPS:
            return JSONResponse({"error": "Access Denied"}, status_code=403)

        # Log basic info
        logger.info(f"Access: IP={ip}, UA={ua}, Path={request.url.path}")

        # Cookie test
        cookie = request.cookies.get(COOKIE_NAME)
        if not cookie:
            response = await call_next(request)
            response.set_cookie(key=COOKIE_NAME, value="human_test", max_age=3600)
            return response

        return await call_next(request)

app.add_middleware(BotDetectionMiddleware)

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/checkout_fake")
@app.get("/hidden_offer")
@app.get("/hidden_cart")
async def fake_checkout(request: Request):
    ip = request.client.host
    ua = request.headers.get("user-agent", "none")
    BANNED_IPS.add(ip)
    logger.warning(f"BOT TRIGGERED: IP={ip}, UA={ua}, PATH={request.url.path}")
    return JSONResponse({"alert": "Bot trap triggered. IP logged and blocked."})

@app.get("/gridge")
async def gridge(request: Request):
    return templates.TemplateResponse("gridge.html", {"request": request})

@app.get("/simulate")
async def simulate_bot():
    import httpx
    urls = ["http://localhost:8000/checkout_fake", "http://localhost:8000/hidden_offer"]
    for url in urls:
        try:
            r = httpx.get(url, headers={"User-Agent": "GridgeBot/1.0"})
            print(f"Bot hit {url} — Response: {r.status_code} | {r.json()}")
        except Exception as e:
            print(f"Simulation error: {e}")
    return {"status": "Simulated bot hits complete."}
