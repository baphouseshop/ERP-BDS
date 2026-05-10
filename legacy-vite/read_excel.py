import pandas as pd
import json

file_path = 'FILE_1_MASTER.xlsx'
xls = pd.ExcelFile(file_path)

data = {}
for sheet_name in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name=sheet_name)
    # Convert dates to string to avoid JSON serialization errors
    df = df.astype(str)
    data[sheet_name] = df.to_dict(orient='records')

with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Sheets found: {xls.sheet_names}")
