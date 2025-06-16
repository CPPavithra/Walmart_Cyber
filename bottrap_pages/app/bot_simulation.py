import httpx
import random
import time

USER_AGENTS = [
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112 Safari/537.36",
    "curl/7.68.0"
]

URLS = [
    "http://127.0.0.1:8000/checkout_fake",
    "http://127.0.0.1:8000/hidden-trap"
]

for i in range(5):
    headers = {"User-Agent": random.choice(USER_AGENTS)}
    url = random.choice(URLS)
    print(f"Bot hitting: {url}")
    try:
        r = httpx.get(url, headers=headers)
        print(f"Response: {r.status_code} - {r.text}")
    except Exception as e:
        print("Bot failed:", e)
    time.sleep(random.uniform(1, 3))
