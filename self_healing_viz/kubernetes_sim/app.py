# app.py (Flask Microservice)
from flask import Flask, jsonify
import random
import os

app = Flask(__name__)

@app.route('/health')
def health():
    # Simulate 90% healthy, 10% anomaly (for demo)
    if random.random() < 0.1:
        os._exit(1)  # Crash container
    return jsonify(status="healthy")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
