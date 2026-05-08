-- 1. CLEANUP: Remove generic permissive policies that bypass security
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND (
            policyname ILIKE '%Enable read access for all authenticated users%' OR
            policyname ILIKE '%Enable insert for authenticated users%' OR
            policyname ILIKE '%Enable update for authenticated users%' OR
            policyname ILIKE '%Enable delete for authenticated users%' OR
            policyname ILIKE '%Allow authenticated users to read%' OR
            policyname ILIKE '%Allow reading logs%' OR
            policyname ILIKE '%Allow system to insert logs%'
        )
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 2. LEADS: Security
DROP POLICY IF EXISTS "Staff can view relevant leads" ON leads;
DROP POLICY IF EXISTS "Staff can update own leads" ON leads;

CREATE POLICY "Leads: Admin/BOD/Marketing can see all, Sales see own" 
ON leads FOR SELECT 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'BOD', 'Marketing') OR 
  nhan_vien_id = (SELECT employee_code FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Leads: Sales/Marketing/Admin can insert" 
ON leads FOR INSERT 
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'BOD', 'Marketing', 'Sales')
);

CREATE POLICY "Leads: Admin/BOD or Owner can update" 
ON leads FOR UPDATE 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'BOD') OR 
  nhan_vien_id = (SELECT employee_code FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Leads: Only Admin/BOD can delete" 
ON leads FOR DELETE 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'BOD')
);


-- 3. TRANSACTIONS: Security
DROP POLICY IF EXISTS "Staff can view relevant transactions" ON transactions;

CREATE POLICY "Transactions: Admin/BOD/Kế toán see all, Sales see own" 
ON transactions FOR SELECT 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'BOD', 'Kế toán') OR 
  nhan_vien_id = (SELECT employee_code FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Transactions: Admin/BOD/Kế toán or Owner can update" 
ON transactions FOR UPDATE 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'BOD', 'Kế toán') OR 
  nhan_vien_id = (SELECT employee_code FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Transactions: Only Admin/BOD/Kế toán can insert/delete" 
ON transactions FOR ALL 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'BOD', 'Kế toán')
);


-- 4. FINANCIAL RECORDS: Security
DROP POLICY IF EXISTS "Finance/Admin can view records" ON financial_records;

CREATE POLICY "Financials: Restricted to Admin/BOD/Kế toán" 
ON financial_records FOR ALL 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'BOD', 'Kế toán')
);


-- 5. MARKETING CAMPAIGNS: Security
DROP POLICY IF EXISTS "Marketing/Admin can view campaigns" ON marketing_campaigns;

CREATE POLICY "Marketing: Restricted to Admin/BOD/Marketing" 
ON marketing_campaigns FOR ALL 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'BOD', 'Marketing')
);


-- 6. EMPLOYEES (Staff): Security
DROP POLICY IF EXISTS "Authenticated users can view staff list" ON employees;

CREATE POLICY "Staff: Everyone can view basic info" 
ON employees FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Staff: Only Admin/BOD/HR can modify" 
ON employees FOR ALL 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'BOD', 'HR')
);


-- 7. KPI TARGETS: Security
DROP POLICY IF EXISTS "Users can view targets" ON kpi_targets;

CREATE POLICY "KPI: Admin/BOD see all, Staff see own" 
ON kpi_targets FOR SELECT 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'BOD') OR 
  employee_code = (SELECT employee_code FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "KPI: Only Admin/BOD can modify" 
ON kpi_targets FOR ALL 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'BOD')
);


-- 8. AUDIT LOGS: Security
CREATE POLICY "Logs: Restricted to Admin/BOD" 
ON audit_logs FOR ALL 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'BOD')
);

-- 9. PROFILES: Security Cleanup
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;

-- Ensure RLS is active on all
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
