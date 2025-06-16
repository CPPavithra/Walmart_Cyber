import requests
import random
import time
from fake_useragent import UserAgent
import json
from datetime import datetime

class BotSimulator:
    def __init__(self):
        self.ua = UserAgent()
        self.base_url = "http://localhost:8000"
        self.targets = [
            ("/api/products", 0.8, "GET"),
            ("/api/checkout", 0.3, "POST"),
            ("/hidden-admin", 0.1, "GET"),
            ("/checkout_fake", 0.2, "GET"),
            ("/hidden-trap", 0.15, "GET")
        ]
        self.bot_types = [
            "grinch-bot",
            "scraper-bot",
            "checkout-bot",
            "inventory-bot",
            "price-scraper"
        ]
        
    def get_random_headers(self):
        return {
            "User-Agent": self.ua.random,
            "X-Bot-Type": random.choice(self.bot_types),
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": f"{self.base_url}/"
        }
    
    def simulate_request(self):
        url, prob, method = random.choice(self.targets)
        if random.random() < prob:
            try:
                headers = self.get_random_headers()
                full_url = f"{self.base_url}{url}"
                
                # Special handling for checkout which might be a honeypot
                if url == "/api/checkout":
                    data = {"honeypot": "true"} if random.random() < 0.7 else {}
                    response = requests.post(full_url, json=data, headers=headers)
                elif method == "POST":
                    response = requests.post(full_url, headers=headers)
                else:
                    response = requests.get(full_url, headers=headers)
                
                self.log_attack(url, response.status_code, headers)
                print(f"Bot visited {url} - Status: {response.status_code}")
            except Exception as e:
                print(f"Bot error: {e}")
    
    def log_attack(self, endpoint, status, headers):
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "endpoint": endpoint,
            "status": status,
            "bot_type": headers.get("X-Bot-Type"),
            "user_agent": headers.get("User-Agent")
        }
        with open("bot_attacks.log", "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    
    def run(self):
        print("Starting bot simulator...")
        while True:
            self.simulate_request()
            time.sleep(random.uniform(0.1, 2))

if __name__ == "__main__":
    simulator = BotSimulator()
    simulator.run()
