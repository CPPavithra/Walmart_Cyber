import requests
import os
from dotenv import load_dotenv

# Load the API key from .env file
load_dotenv()
API_KEY = os.getenv("RAPIDAPI_KEY")

def check_email_breach(email):
    url = "https://breachdirectory.p.rapidapi.com/"

    querystring = {"func": "auto", "term": email}
    headers = {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "breachdirectory.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)
    print(response.json())

    if response.status_code != 200:
        print(f"⚠️ API Error: {response.status_code} - {response.text}")
        return

    data = response.json()

    if data.get("success") == False:
        print(f"\n✅ No breach found for '{email}'!")
    else:
        print(f"\n🛑 Breach found for '{email}':")
        for breach in data.get("result", []):
            print(f" - {breach}")

if __name__ == "__main__":
    print("🔐 BreachDirectory Email Checker\n")
    email = input("Enter your email/username to check: ").strip()
    check_email_breach(email)

