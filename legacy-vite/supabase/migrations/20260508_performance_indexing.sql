-- Enable pg_trgm extension for fast text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Optimize Leads queries (Filtering by date, staff, and name search)
CREATE INDEX IF NOT EXISTS idx_leads_ngay_nhan ON leads(ngay_nhan DESC);
CREATE INDEX IF NOT EXISTS idx_leads_nhan_vien ON leads(nhan_vien_id);
CREATE INDEX IF NOT EXISTS idx_leads_ho_ten_trgm ON leads USING gin(ho_ten gin_trgm_ops);

-- Optimize Transactions queries (Filtering by date and staff)
CREATE INDEX IF NOT EXISTS idx_trans_ngay_gd ON transactions(ngay_gd DESC);
CREATE INDEX IF NOT EXISTS idx_trans_nhan_vien ON transactions(nhan_vien_id);

-- Optimize Profiles lookup (used frequently in Row Level Security policies)
CREATE INDEX IF NOT EXISTS idx_profiles_employee_code ON profiles(employee_code);
