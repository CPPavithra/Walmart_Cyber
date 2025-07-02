import requests
import random
from datetime import datetime

# Common bot user agents
BOT_AGENTS = [
    "Googlebot/2.1 (+http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "python-requests/2.28.1",
    "curl/7.68.0"
]

# Generate 20 bot fingerprints
for _ in range(20):
    bot_data = {
        "ip": f"{random.randint(50,200)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
        "headers": {
            "user-agent": random.choice(BOT_AGENTS),
            "accept": "*/*",
            "x-forwarded-for": "1.1.1.1"
        },
        "clicks": random.randint(60, 120),  # Definitely bot territory
        "user_agent": random.choice(BOT_AGENTS),
        "request_path": random.choice(["/wp-admin", "/.env", "/api/data"])
    }
    
    response = requests.post(
        "http://localhost:8000/merkel-logging/fingerprint",
        json=bot_data
    )
    print(f"Created bot: {response.json()}")
