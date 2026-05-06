import os
import urllib.request
import json

token = os.environ.get("SUPABASE_ACCESS_TOKEN")
project_ref = "tdcnbwrmxyqtcfsaelau"

with open("seed.sql", "r", encoding="utf-8") as f:
    sql = f.read()

url = f"https://api.supabase.com/v1/projects/{project_ref}/query"
data = json.dumps({"query": sql}).encode('utf-8')
req = urllib.request.Request(url, data=data, method='POST')
req.add_header('Authorization', f'Bearer {token}')
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Response:", response.read().decode('utf-8')[:1000])
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    print("Response:", e.read().decode('utf-8')[:1000])
