import pandas as pd
import json
import os
import math

def clean_value(val):
    if isinstance(val, float) and math.isnan(val):
        return None
    return val

def process_excel():
    file_path = 'FILE_1_MASTER.xlsx'
    xls = pd.ExcelFile(file_path)
    
    db = {
        "leads": [],
        "transactions": [],
        "sales": [],
        "marketing": [],
        "financials": []
    }
    
    # Process LEAD_MASTER
    if "LEAD_MASTER" in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name="LEAD_MASTER")
        db["leads"] = [{k: clean_value(v) for k, v in row.items()} for row in df.to_dict('records')]
        
    # Process GIAO_DICH
    if "💼 GIAO_DICH" in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name="💼 GIAO_DICH", header=2)
        # Drop rows where "Mã GD" is "TỔNG" or NaN
        if "Mã GD" in df.columns:
            df = df[df["Mã GD"].notna() & (df["Mã GD"] != "TỔNG")]
        db["transactions"] = [{k: clean_value(v) for k, v in row.items()} for row in df.to_dict('records')]
        
    # Process SALES_TEAM
    if "👥 SALES_TEAM" in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name="👥 SALES_TEAM", header=2)
        if "Mã NV" in df.columns:
             df = df[df["Mã NV"].notna()]
        db["sales"] = [{k: clean_value(v) for k, v in row.items()} for row in df.to_dict('records')]
        
    # Process MARKETING
    if "📣 MARKETING" in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name="📣 MARKETING", header=2)
        if "Tháng" in df.columns:
            df = df[df["Tháng"].notna() & (df["Tháng"] != "TỔNG / TB")]
        db["marketing"] = [{k: clean_value(v) for k, v in row.items()} for row in df.to_dict('records')]
        
    # Process TAI_CHINH
    if "💰 TAI_CHINH" in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name="💰 TAI_CHINH", header=2)
        if "Tháng" in df.columns:
            df = df[df["Tháng"].notna()]
        db["financials"] = [{k: clean_value(v) for k, v in row.items()} for row in df.to_dict('records')]
        
    os.makedirs('src/data', exist_ok=True)
    with open('src/data/db.json', 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
        
    print("Successfully created src/data/db.json")

if __name__ == "__main__":
    process_excel()
