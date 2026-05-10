import csv
import os

def read_csv(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)[:15] # ONLY TAKE 15 ROWS MAX TO KEEP SQL SMALL

def escape_sql(val):
    if not val:
        return "NULL"
    # double single quotes to escape
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
    campaign_id TEXT REFERENCES public.marketing_campaigns(id),
    requirement TEXT,
    status TEXT,
    employee_id TEXT REFERENCES public.employees(id),
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

# Insert employees
emps = read_csv('sample_data/employees.csv')
for row in emps:
    cols = ', '.join(row.keys())
    vals = ', '.join([escape_sql(v) for v in row.values()])
    sql += f"INSERT INTO public.employees ({cols}) VALUES ({vals});\n"

# Insert marketing_campaigns
mkts = read_csv('sample_data/marketing_campaigns.csv')
for row in mkts:
    cols = ', '.join(row.keys())
    vals = ', '.join([escape_sql(v) for v in row.values()])
    sql += f"INSERT INTO public.marketing_campaigns ({cols}) VALUES ({vals});\n"

# Insert leads
leads = read_csv('sample_data/leads.csv')
for row in leads:
    cols = ', '.join(row.keys())
    vals = ', '.join([escape_sql(v) for v in row.values()])
    sql += f"INSERT INTO public.leads ({cols}) VALUES ({vals});\n"

# Insert transactions
trans = read_csv('sample_data/transactions.csv')
for row in trans:
    cols = ', '.join(row.keys())
    vals = ', '.join([escape_sql(v) for v in row.values()])
    sql += f"INSERT INTO public.transactions ({cols}) VALUES ({vals});\n"

# Insert financial_records
fins = read_csv('sample_data/financial_records.csv')
for row in fins:
    cols = ', '.join(row.keys())
    vals = ', '.join([escape_sql(v) for v in row.values()])
    sql += f"INSERT INTO public.financial_records ({cols}) VALUES ({vals});\n"

with open('seed.sql', 'w', encoding='utf-8') as f:
    f.write(sql)
