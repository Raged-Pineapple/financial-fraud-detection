from flask import Flask, jsonify
from faker import Faker
import random
import uuid
from datetime import datetime

app = Flask(__name__)
fake = Faker()

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

@app.route('/fraud-report', methods=['GET'])
def get_fraud_report():
    report = generate_fraud_report()
    return jsonify(report)

if __name__ == '__main__':
    app.run(debug=True, port=8080)
