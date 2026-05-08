-- Migration: Enable Row Level Security (RLS) for all tables
-- Created at: 2026-05-08
-- Purpose: Prevent unauthorized data access by enforcing RBAC at the database level.

-- 1. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'BOD'))
);

-- 2. EMPLOYEES (Staff list)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view staff list" ON public.employees;
CREATE POLICY "Authenticated users can view staff list" ON public.employees FOR SELECT TO authenticated USING (true);

-- 3. LEADS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view relevant leads" ON public.leads;
CREATE POLICY "Staff can view relevant leads" ON public.leads FOR SELECT TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'BOD', 'Marketing')
  OR nhan_vien_id = (SELECT employee_code FROM public.profiles WHERE id = auth.uid())
);
DROP POLICY IF EXISTS "Staff can update own leads" ON public.leads;
CREATE POLICY "Staff can update own leads" ON public.leads FOR UPDATE TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'BOD')
  OR nhan_vien_id = (SELECT employee_code FROM public.profiles WHERE id = auth.uid())
);

-- 4. TRANSACTIONS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view relevant transactions" ON public.transactions;
CREATE POLICY "Staff can view relevant transactions" ON public.transactions FOR SELECT TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'BOD', 'Kế toán')
  OR nhan_vien_id = (SELECT employee_code FROM public.profiles WHERE id = auth.uid())
);

-- 5. MARKETING CAMPAIGNS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Marketing/Admin can view campaigns" ON public.marketing_campaigns;
CREATE POLICY "Marketing/Admin can view campaigns" ON public.marketing_campaigns FOR SELECT TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'BOD', 'Marketing')
);

-- 6. FINANCIAL RECORDS
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Finance/Admin can view records" ON public.financial_records;
CREATE POLICY "Finance/Admin can view records" ON public.financial_records FOR SELECT TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'BOD', 'Kế toán')
);

-- 7. KPI TARGETS
ALTER TABLE public.kpi_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view targets" ON public.kpi_targets;
CREATE POLICY "Users can view targets" ON public.kpi_targets FOR SELECT TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'BOD')
  OR employee_code = (SELECT employee_code FROM public.profiles WHERE id = auth.uid())
);
