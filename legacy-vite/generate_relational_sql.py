import csv
import os
import random

def read_csv(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

def escape_sql(val):
    if not val:
        return "NULL"
    val_escaped = val.replace("'", "''")
    return f"'{val_escaped}'"

sql = ""

sql += "DROP TABLE IF EXISTS public.transactions CASCADE;\n"
sql += "DROP TABLE IF EXISTS public.leads CASCADE;\n"
sql += "DROP TABLE IF EXISTS public.financial_records CASCADE;\n"
sql += "DROP TABLE IF EXISTS public.marketing_campaigns CASCADE;\n"
sql += "DROP TABLE IF EXISTS public.employees CASCADE;\n\n"

sql += """CREATE TABLE public.employees (
    id TEXT PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    department TEXT,
    position TEXT,
    hire_date DATE,
    status TEXT,
    salary NUMERIC,
    manager_id TEXT
);\n\n"""

sql += """CREATE TABLE public.marketing_campaigns (
    id TEXT PRIMARY KEY,
    month TEXT,
    channel TEXT,
    campaign_name TEXT,
    cost NUMERIC,
    leads INTEGER,
    bookings INTEGER,
    conversion_rate NUMERIC,
    cpl NUMERIC,
    cpb NUMERIC,
    clicks INTEGER,
    notes TEXT
);\n\n"""

sql += """CREATE TABLE public.leads (
    id TEXT PRIMARY KEY,
    received_date TIMESTAMPTZ,
    full_name TEXT,
    phone TEXT,
    source TEXT,
    campaign_id TEXT REFERENCES public.marketing_campaigns(id),
    requirement TEXT,
    status TEXT,
    employee_id TEXT REFERENCES public.employees(id),
    agency TEXT,
    appointment_date TIMESTAMPTZ,
    follow_up_date TIMESTAMPTZ,
    notes TEXT
);\n\n"""

sql += """CREATE TABLE public.transactions (
    id TEXT PRIMARY KEY,
    transaction_date DATE,
    lead_id TEXT REFERENCES public.leads(id),
    employee_id TEXT REFERENCES public.employees(id),
    product_code TEXT,
    zone TEXT,
    price NUMERIC,
    deposit NUMERIC,
    commission NUMERIC,
    status TEXT,
    notes TEXT
);\n\n"""

sql += """CREATE TABLE public.financial_records (
    id TEXT PRIMARY KEY,
    month TEXT,
    category TEXT,
    type TEXT,
    actual_amount NUMERIC,
    target_amount NUMERIC,
    completion_rate NUMERIC,
    difference NUMERIC,
    notes TEXT,
    approver_id TEXT REFERENCES public.employees(id)
);\n\n"""

emps = read_csv('sample_data/employees.csv')
emp_ids = []
for row in emps:
    cols = ', '.join(row.keys())
    vals = ', '.join([escape_sql(v) for v in row.values()])
    sql += f"INSERT INTO public.employees ({cols}) VALUES ({vals});\n"
    emp_ids.append(row['id'])

mkts = read_csv('sample_data/marketing_campaigns.csv')
mkt_map = {}
for i, row in enumerate(mkts):
    m_id = f"MKT{i+1:03d}"
    mkt_map[row['campaign_name']] = m_id
    
    cols = "id, month, channel, campaign_name, cost, leads, bookings, conversion_rate, cpl, cpb, clicks, notes"
    vals = f"{escape_sql(m_id)}, {escape_sql(row['month'])}, {escape_sql(row['channel'])}, {escape_sql(row['campaign_name'])}, {escape_sql(row['cost'])}, {escape_sql(row['leads'])}, {escape_sql(row['bookings'])}, {escape_sql(row['conversion_rate'])}, {escape_sql(row['cpl'])}, {escape_sql(row['cpb'])}, {escape_sql(row['clicks'])}, {escape_sql(row['notes'])}"
    sql += f"INSERT INTO public.marketing_campaigns ({cols}) VALUES ({vals});\n"

leads = read_csv('sample_data/leads.csv')
lead_ids = []
for row in leads:
    l_id = row['lead_code']
    c_id = mkt_map.get(row['campaign'])
    if not c_id and len(mkt_map) > 0:
        c_id = list(mkt_map.values())[0]
    
    e_id = random.choice(emp_ids)
    
    cols = "id, received_date, full_name, phone, source, campaign_id, requirement, status, employee_id, agency, appointment_date, follow_up_date, notes"
    vals = f"{escape_sql(l_id)}, {escape_sql(row['received_date'])}, {escape_sql(row['full_name'])}, {escape_sql(row['phone_number_full'])}, {escape_sql(row['source'])}, {escape_sql(c_id)}, {escape_sql(row['requirement'])}, {escape_sql(row['status'])}, {escape_sql(e_id)}, {escape_sql(row['agency'])}, {escape_sql(row['appointment_date'])}, {escape_sql(row['follow_up_date'])}, {escape_sql(row['notes'])}"
    sql += f"INSERT INTO public.leads ({cols}) VALUES ({vals});\n"
    lead_ids.append(l_id)

trans = read_csv('sample_data/transactions.csv')
for i, row in enumerate(trans):
    t_id = row.get('transaction_code', f"TX{i+1:05d}")
    l_id = row.get('Lead ID')
    if l_id and l_id.startswith('Lead ID: '):
        l_id = l_id.replace('Lead ID: ', '')
    if not l_id:
        notes = row.get('notes', '')
        if notes.startswith('Lead ID: '):
            l_id = notes.replace('Lead ID: ', '')
    if not l_id or l_id not in lead_ids:
        l_id = random.choice(lead_ids)

    e_id = random.choice(emp_ids)
    
    cols = "id, transaction_date, lead_id, employee_id, product_code, zone, price, deposit, commission, status, notes"
    vals = f"{escape_sql(t_id)}, {escape_sql(row.get('transaction_date', '2026-01-01'))}, {escape_sql(l_id)}, {escape_sql(e_id)}, {escape_sql(row.get('product_code', 'PROD-A'))}, {escape_sql(row.get('zone', 'North'))}, {escape_sql(row.get('price', '1000'))}, {escape_sql(row.get('deposit', '100'))}, {escape_sql(row.get('commission', '10'))}, {escape_sql(row.get('status', 'Completed'))}, {escape_sql(row.get('notes', ''))}"
    sql += f"INSERT INTO public.transactions ({cols}) VALUES ({vals});\n"

fins = read_csv('sample_data/financial_records.csv')
for i, row in enumerate(fins):
    f_id = f"FIN{i+1:03d}"
    a_id = random.choice(emp_ids)
    
    cols = "id, month, category, type, actual_amount, target_amount, completion_rate, difference, notes, approver_id"
    vals = f"{escape_sql(f_id)}, {escape_sql(row.get('month'))}, {escape_sql(row.get('category'))}, {escape_sql(row.get('type'))}, {escape_sql(row.get('actual_amount'))}, {escape_sql(row.get('target_amount'))}, {escape_sql(row.get('completion_rate'))}, {escape_sql(row.get('difference'))}, {escape_sql(row.get('notes'))}, {escape_sql(a_id)}"
    sql += f"INSERT INTO public.financial_records ({cols}) VALUES ({vals});\n"

with open('seed.sql', 'w', encoding='utf-8') as f:
    f.write(sql)
