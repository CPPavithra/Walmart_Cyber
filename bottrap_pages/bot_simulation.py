import httpx

URLS = [
    "http://127.0.0.1:8000/checkout_fake",
    "http://127.0.0.1:8000/hidden-trap"
]

for url in URLS:
    try:
        print(f"Bot hitting: {url}")
        resp = httpx.get(url)
        print(f"Response: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Error: {e}")
