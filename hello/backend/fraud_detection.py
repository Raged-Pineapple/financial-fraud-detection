import pandas as pd
from sklearn.ensemble import IsolationForest
import random
from datetime import datetime, timedelta
import os
import numpy as np

def generate_sample_data(n=200):
    data = []
    base_time = datetime.now()
    for i in range(n):
        tx = {
            "hash": f"tx_{i}",
            "created_at": (base_time - timedelta(seconds=random.randint(0, 10000))).isoformat(),
            "amount": round(random.uniform(0.01, 1000), 2),
            "source_account": "G" + str(random.randint(1000000, 9999999)),
            "destination_account": "G" + str(random.randint(1000000, 9999999))
        }
        data.append(tx)
    return pd.DataFrame(data)

# Generate dummy transactions
df = generate_sample_data()
print(df.head())

# Rule-based features
df["micro_transfer"] = df["amount"] < 1.0
threshold = df["amount"].quantile(0.95)
df["large_transfer"] = df["amount"] > threshold

# ML-based anomaly detection
df["timestamp"] = pd.to_datetime(df["created_at"]).astype(np.int64) / 10**9
features = df[["amount", "timestamp"]]

model = IsolationForest(contamination=0.05, random_state=42)
df["anomaly"] = model.fit_predict(features)

# Final flagging
df["is_suspicious"] = df["anomaly"] == -1
df["is_suspicious"] = df["is_suspicious"] | df["micro_transfer"] | df["large_transfer"]

# Save suspicious transactions
suspicious_df = df[df["is_suspicious"]]
suspicious_output = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "suspicious_transactions.csv"))
suspicious_df.to_csv(suspicious_output, index=False)

# Save all transactions (for visualization)
all_output = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "all_transactions.csv"))
df.to_csv(all_output, index=False)

print(f"✅ Suspicious transactions: {len(suspicious_df)} saved to suspicious_transactions.csv")
print(f"📦 All transactions saved to all_transactions.csv")
