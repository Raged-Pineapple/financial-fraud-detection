import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Load all transactions
csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "all_transactions.csv"))
df = pd.read_csv(csv_path, parse_dates=["created_at"])

# 1. Bar chart: Suspicious vs. Normal
plt.figure(figsize=(6, 4))
sns.countplot(data=df, x="is_suspicious")
plt.title("Suspicious vs. Normal Transactions")
plt.xlabel("Transaction Type")
plt.ylabel("Count")
plt.xticks([0, 1], ['Normal', 'Suspicious'])
plt.tight_layout()
bar_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "bar_chart.png"))
plt.savefig(bar_path)
plt.close()

# 2. Time-series: Transaction amounts over time
plt.figure(figsize=(10, 4))
df_sorted = df.sort_values("created_at")
sns.lineplot(data=df_sorted, x="created_at", y="amount", hue="is_suspicious", palette={0: 'green', 1: 'red'})
plt.title("Transaction Amounts Over Time")
plt.xlabel("Time")
plt.ylabel("Amount")
plt.legend(title="Suspicious")
plt.tight_layout()
ts_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "time_series.png"))
plt.savefig(ts_path)
plt.close()

# 3. Histogram: Distribution of suspicious transaction amounts
plt.figure(figsize=(6, 4))
sns.histplot(df[df["is_suspicious"] == True]["amount"], bins=20, kde=True, color="red")
plt.title("Histogram of Suspicious Transaction Amounts")
plt.xlabel("Amount")
plt.ylabel("Frequency")
plt.tight_layout()
hist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "histogram.png"))
plt.savefig(hist_path)
plt.close()

print("✅ Graphs saved:")
print(f" - Bar Chart:         {bar_path}")
print(f" - Time Series Chart: {ts_path}")
print(f" - Histogram:         {hist_path}")
