from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
import requests
from datetime import datetime, timedelta
import asyncio
import re
from .models import BotTrapEvent

router = APIRouter()

# Connected WebSocket clients
connected_clients = []

# Fake product listings
FAKE_PRODUCTS = [
    {
        "id": 1, 
        "name": "4K Ultra HD Smart TV", 
        "price": 399.99, 
        "image": "tv.jpg",
        "description": "Limited time offer! 75-inch 4K Smart TV with HDR. Only 3 left in stock!",
        "discount": "70% OFF",
        "fake_reviews": [
            {"rating": 5, "text": "Amazing deal! Got mine before they sold out!"},
            {"rating": 4, "text": "Great TV for the price. Delivery was fast."}
        ]
    },
    {
        "id": 2, 
        "name": "Wireless Noise Cancelling Headphones", 
        "price": 89.99, 
        "image": "headphones.jpg",
        "description": "Premium Bluetooth headphones with 40hr battery life. 50% off today only!",
        "discount": "50% OFF",
        "fake_reviews": [
            {"rating": 5, "text": "Best headphones I've ever owned!"},
            {"rating": 5, "text": "Noise cancellation works perfectly."}
        ]
    },
]

# Known bad actors
KNOWN_BAD_IPS = set()
SUSPICIOUS_USER_AGENTS = [
    "scrapy", "bot", "crawl", "spider", "python", "curl", "wget", 
    "httpclient", "java", "php", "ruby", "perl", "go-http", "rust"
]

recent_requests = {}

PRODUCT_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta name="robots" content="index,follow">
  <style>
    body {{ font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }}
    .product {{ display: flex; gap: 30px; margin-top: 20px; }}
    .product-image {{ width: 500px; height: 500px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; }}
    .product-info {{ flex: 1; }}
    .price {{ font-size: 24px; color: #B12704; }}
    .discount {{ color: #CC0C39; font-weight: bold; }}
    .stock {{ color: #008A00; font-weight: bold; }}
    .reviews {{ margin-top: 30px; }}
    .review {{ border-bottom: 1px solid #ddd; padding: 10px 0; }}
    #checkout-btn {{ background: #FFD814; border: none; padding: 10px 30px; font-size: 16px; border-radius: 8px; cursor: pointer; margin-top: 20px; }}
    .hidden {{ display: none; }}
  </style>
</head>
<body>
  <h1>{name}</h1>
  <div class="product">
    <div class="product-image">
      <img src="/static/images/{image}" alt="{name}" width="400">
    </div>
    <div class="product-info">
      <div class="price">${price}</div>
      <div class="discount">{discount}</div>
      <div class="stock">{stock_message}</div>
      <p>{description}</p>

      <button id="checkout-btn">Buy Now - Limited Stock!</button>

      <div class="hidden">
        <input type="text" id="honeypot" name="honeypot">
      </div>

      <div class="reviews">
        <h3>Customer Reviews</h3>
        {reviews_html}
      </div>
    </div>
  </div>

  <script>
    document.getElementById('checkout-btn').addEventListener('click', function() {{
      const honeypotValue = document.getElementById('honeypot').value;
      const payload = {{
        product_id: {product_id},
        honeypot: honeypotValue
      }};
      fetch('/bot-trap/checkout', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify(payload)
      }}).then(response => response.json())
        .then(data => alert(data.message))
        .catch(err => console.error('Error:', err));
    }});
  </script>
</body>
</html>
"""

@router.get("/products")
async def get_products():
    return FAKE_PRODUCTS

@router.get("/product/{product_id}")
@router.get("/deals/special-offer")
@router.get("/clearance/item")
async def get_product_page(request: Request, product_id: int):
    ip = request.client.host
    user_agent = request.headers.get("user-agent", "").lower()
    referer = request.headers.get("referer", "")

    # Rate limiting
    if ip in recent_requests and (datetime.now() - recent_requests[ip] < timedelta(seconds=2)):
        raise HTTPException(status_code=429, detail="Too many requests")
    recent_requests[ip] = datetime.now()

    is_bot = (
        any(bot in user_agent for bot in SUSPICIOUS_USER_AGENTS)
        or not referer
        or ip in KNOWN_BAD_IPS
        or re.search(r'bot|spider|crawl|scraper', user_agent, re.I)
        or "accept" not in request.headers
        or "accept-encoding" not in request.headers
    )

    if is_bot:
        metadata = get_ip_metadata(ip)
        attack_data = {
            "type": "bot_detected",
            "ip": ip,
            "timestamp": datetime.now().isoformat(),
            "user_agent": user_agent,
            "metadata": metadata,
            "product_id": product_id,
            "detection_method": "user_agent" if any(bot in user_agent for bot in SUSPICIOUS_USER_AGENTS) else "behavioral"
        }
        await broadcast_json(attack_data)
        await log_bot_event(attack_data)
        KNOWN_BAD_IPS.add(ip)

    product = next((p for p in FAKE_PRODUCTS if p["id"] == product_id), FAKE_PRODUCTS[0])
    reviews_html = "\n".join(
        f'<div class="review"><strong>{review["rating"]} stars</strong>: {review["text"]}</div>'
        for review in product.get("fake_reviews", [])
    )

    html_content = PRODUCT_TEMPLATE.format(
        title=f"{product['name']} - Amazing Deal!",
        description=product['description'],
        name=product['name'],
        price=product['price'],
        discount=product.get('discount', ''),
        stock_message="Only 3 left in stock!" if is_bot else "In stock",
        image=product['image'],
        reviews_html=reviews_html,
        product_id=product['id']
    )

    return HTMLResponse(content=html_content, status_code=200)

@router.post("/checkout")
async def fake_checkout(request: Request):
    ip = request.client.host
    user_agent = request.headers.get("user-agent", "").lower()
    request_data = await request.json()

    is_bot = (
        any(bot in user_agent for bot in SUSPICIOUS_USER_AGENTS)
        or request_data.get("honeypot", "") != ""
        or ip in KNOWN_BAD_IPS
        or request.headers.get("accept") != "application/json"
        or not request.headers.get("referer")
    )

    metadata = get_ip_metadata(ip)
    attack_data = {
        "type": "checkout_attempt",
        "ip": ip,
        "timestamp": datetime.now().isoformat(),
        "user_agent": user_agent,
        "metadata": metadata,
        "product_id": request_data.get("product_id"),
        "honeypot_triggered": request_data.get("honeypot", "") != ""
    }

    if is_bot:
        attack_data["attack_type"] = "checkout_scraper"
        attack_data["detection_method"] = (
            "honeypot" if request_data.get("honeypot", "") != ""
            else "user_agent" if any(bot in user_agent for bot in SUSPICIOUS_USER_AGENTS)
            else "behavioral"
        )
        await broadcast_json(attack_data)
        await log_bot_event(attack_data)
        KNOWN_BAD_IPS.add(ip)
        return JSONResponse(status_code=403, content={"status": "error", "message": "Order processing failed"})

    return {"status": "success", "message": "Order placed successfully"}

@router.websocket("/ws-bot")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    print(f"🟢 WebSocket connected: {websocket.client.host}")
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        print(f"🔴 WebSocket disconnected: {websocket.client.host}")

@router.get("/events")
async def get_bot_events():
    events = await BotTrapEvent.find_all()
    return events

async def broadcast_json(message: dict):
    for client in connected_clients:
        try:
            await client.send_json(message)
        except:
            connected_clients.remove(client)

def get_ip_metadata(ip: str):
    try:
        response = requests.get(f"https://ipapi.co/{ip}/json/", timeout=3)
        return response.json()
    except:
        return {"error": "Metadata lookup failed"}

async def log_bot_event(event_data: dict):
    event = BotTrapEvent(
        ip=event_data["ip"],
        event_type=event_data["type"],
        user_agent=event_data.get("user_agent", ""),
        metadata=event_data["metadata"],
        timestamp=datetime.fromisoformat(event_data["timestamp"]),
        product_id=event_data.get("product_id")
    )
    await event.save()

