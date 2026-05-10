-- Task 3: SQL indexes for scalability
-- This migration adds indexes to optimize common queries and filtering operations.

-- Leads Table Indexes
-- Optimization for sorting by date and filtering by status/assigned staff
CREATE INDEX IF NOT EXISTS idx_leads_ngay_nhan_desc ON public.leads (ngay_nhan DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status_assigned ON public.leads (trang_thai, nhan_vien_id);
-- Composite index for the most common filter: status + date
CREATE INDEX IF NOT EXISTS idx_leads_status_date ON public.leads (trang_thai, ngay_nhan DESC);

-- Transactions Table Indexes
-- Optimization for sorting by transaction date and filtering by status/agent
CREATE INDEX IF NOT EXISTS idx_transactions_ngay_gd_desc ON public.transactions (ngay_gd DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status_agent ON public.transactions (trang_thai, nhan_vien_id);
-- Composite index for status + date filtering
CREATE INDEX IF NOT EXISTS idx_transactions_status_date ON public.transactions (trang_thai, ngay_gd DESC);

-- Employees (Staff) Table Indexes
-- Optimization for sorting by join date and filtering by role/status
CREATE INDEX IF NOT EXISTS idx_employees_ngay_vao_lam_desc ON public.employees (ngay_vao_lam DESC);
CREATE INDEX IF NOT EXISTS idx_employees_role_status ON public.employees (chuc_vu, trang_thai);
-- Composite index for role + status + date
CREATE INDEX IF NOT EXISTS idx_employees_role_status_date ON public.employees (chuc_vu, trang_thai, ngay_vao_lam DESC);
