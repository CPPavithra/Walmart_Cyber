from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
import uvicorn
import json
import requests
import asyncio
from datetime import datetime
from typing import List, Dict

app = FastAPI()

# Configure paths
BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"

# Create directories if they don't exist
STATIC_DIR.mkdir(exist_ok=True)
TEMPLATES_DIR.mkdir(exist_ok=True)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Mount static files and templates
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=TEMPLATES_DIR)

# Fake product database
FAKE_PRODUCTS = [
    {"id": 1, "name": "4K Ultra HD Smart TV", "price": 399.99, "image": "tv.jpg"},
    {"id": 2, "name": "Wireless Bluetooth Headphones", "price": 89.99, "image": "headphones.jpg"},
    {"id": 3, "name": "Gaming Laptop", "price": 1299.99, "image": "laptop.jpg"},
    {"id": 4, "name": "Smartphone Pro Max", "price": 1099.99, "image": "phone.jpg"},
]

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/products")
async def get_products():
    return FAKE_PRODUCTS

@app.post("/api/checkout")
async def fake_checkout(request: Request):
    ip = request.client.host
    user_agent = request.headers.get("user-agent", "")
    
    is_bot = any(bot in user_agent.lower() for bot in ["bot", "crawl", "spider"])
    request_data = await request.json()
    
    if is_bot or "honeypot" in request_data:
        metadata = get_ip_metadata(ip)
        attack_data = {
            "type": "attack_blocked",
            "ip": ip,
            "timestamp": datetime.now().isoformat(),
            "attack_type": "checkout_scraper",
            "metadata": metadata
        }
        await manager.broadcast(json.dumps(attack_data))
        return JSONResponse(
            status_code=403,
            content={"status": "error", "message": "Order processing failed"}
        )
    
    return {"status": "success", "message": "Order placed successfully"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Verify origin - important for security
    #origin = websocket.headers.get("origin")
    #if origin not in ["http://localhost:3000", "http://127.0.0.1:3000"]:
      #  await websocket.close(code=1008)
      #  return

    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

def get_ip_metadata(ip: str):
    try:
        response = requests.get(f"https://ipapi.co/{ip}/json/", timeout=3)
        return response.json()
    except:
        return {"error": "Metadata lookup failed"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
