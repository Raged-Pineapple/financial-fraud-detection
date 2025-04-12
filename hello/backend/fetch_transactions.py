from stellar_sdk import Server

server = Server("https://horizon-testnet.stellar.org")

def fetch_recent_transactions(account_id, limit=100):
    transactions = server.transactions().for_account(account_id).limit(limit).order(desc=True).call()['_embedded']['records']
    for tx in transactions:
        print(f"Hash: {tx['hash']}, Time: {tx['created_at']}")
    return transactions

# Replace with your test account public key
test_account = "GDIMPUYW4K5HDZZSTOBJUS4U2GGYRWRAOCMHE3FRG7P25X5VZJ2B4VBO"
fetch_recent_transactions(test_account)
