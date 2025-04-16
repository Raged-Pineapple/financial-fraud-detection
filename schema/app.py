from flask import Flask, jsonify
from faker import Faker
import random
import uuid
from datetime import datetime
from pymongo import MongoClient
import os

app = Flask(__name__)
fake = Faker()

# MongoDB Atlas connection setup
MONGO_URI = 'mongodb+srv://sushmaaditya717:rdqdcaYTLY7p50za@adityaadi.vztbe.mongodb.net/mern_1_db'
client = MongoClient(MONGO_URI)
db = client["telnet"]  # Replace with your database name
collection = db["report"]  # Collection to store reports

def generate_fraud_report():
    return {
        "account_id": str(uuid.uuid4()),
        "transaction_id": str(uuid.uuid4())[:12],
        "amount": round(random.uniform(10.0, 5000.0), 2),
        "asset": random.choice(["XLM", "BTC", "ETH", "USDC"]),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "suspicion": {
            "reason": random.choice(["High frequency", "Unusual location", "Volume spike"]),
            "detection_score": round(random.uniform(0.5, 0.99), 2),
            "detection_method": random.choice(["isolation_forest", "logistic_regression", "manual_flag"]),
            "rule_triggered": random.choice(["TX_PER_MINUTE > 10", "GEO_MISMATCH", "AMOUNT > 1000"])
        },
        "status": random.choice(["flagged", "ignored", "confirmed", "escalated"]),
        "review": {
            "reviewed_by": fake.user_name(),
            "reviewed_at": datetime.utcnow().isoformat() + "Z",
            "notes": fake.sentence()
        },
        "meta": {
            "source_account": "G" + fake.lexify(text="?????").upper(),
            "destination_account": "G" + fake.lexify(text="?????").upper(),
            "operation_type": random.choice(["payment", "offer", "create_account"]),
            "tx_hash": str(uuid.uuid4())[:16],
            "stellar_ledger": random.randint(5000000, 6000000)
        },
        "tags": random.sample(["volume_spike", "repeat_pattern", "suspicious_geo", "high_value"], k=2),
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

def save_to_mongodb(report):
    # Insert the generated report into MongoDB
    collection.insert_one(report)

def generate_and_save_report():
    report = generate_fraud_report()
    save_to_mongodb(report)  # Save the report to MongoDB
    print("Report generated and saved to MongoDB")

@app.route("/generate_report", methods=["GET"])
def generate_and_save_report_api():
    report = generate_fraud_report()
    save_to_mongodb(report)
    return jsonify(report)

if __name__ == "__main__":
    generate_and_save_report()  # Automatically generate and save the report when the app starts
    app.run(debug=True)