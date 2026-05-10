-- Migration: Add performance indexes for leads and transactions
-- Created at: 2026-05-08

-- Enable pg_trgm extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Leads table indexes
CREATE INDEX IF NOT EXISTS idx_leads_ngay_nhan ON public.leads(ngay_nhan DESC);
CREATE INDEX IF NOT EXISTS idx_leads_nhan_vien ON public.leads(nhan_vien_id);
CREATE INDEX IF NOT EXISTS idx_leads_ho_ten ON public.leads USING gin(ho_ten public.gin_trgm_ops);

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_trans_ngay_gd ON public.transactions(ngay_gd DESC);
CREATE INDEX IF NOT EXISTS idx_trans_nhan_vien ON public.transactions(nhan_vien_id);
