-- Migration: Create kpi_targets table
-- Created at: 2026-05-08

CREATE TABLE IF NOT EXISTS public.kpi_targets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_code text REFERENCES public.employees(ma_nv) ON DELETE CASCADE UNIQUE,
  kpi_revenue_billion numeric DEFAULT 10,
  salary_million numeric DEFAULT 5,
  target_site_visits integer DEFAULT 5,
  target_contracts integer DEFAULT 1,
  target_deposits integer DEFAULT 2,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kpi_targets ENABLE ROW LEVEL SECURITY;

-- Policy for Select
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'kpi_targets' AND policyname = 'Allow authenticated users to read kpi_targets'
    ) THEN
        CREATE POLICY "Allow authenticated users to read kpi_targets"
        ON public.kpi_targets FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END
$$;

-- Insert sample data
INSERT INTO public.kpi_targets (employee_code, kpi_revenue_billion, salary_million, target_site_visits, target_contracts, target_deposits)
VALUES 
('EMP001', 15.45, 20, 20, 2, 2),
('EMP002', 11.26, 18, 15, 2, 2),
('EMP003', 10.07, 18, 25, 1, 1),
('EMP004', 9.47, 18, 10, 1, 1),
('EMP005', 8.5, 15, 10, 1, 1),
('EMP006', 9.0, 15, 10, 1, 1)
ON CONFLICT (employee_code) DO NOTHING;
