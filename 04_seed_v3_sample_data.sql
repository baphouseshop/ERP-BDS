-- ERP BĐS V3 - SEED SAMPLE DATA
-- Author: Antigravity AI
-- Description: Realistic sample data for Marketing, Reports, and Accounting modules.

DO $$
DECLARE
    -- Developers
    dev_vin_id UUID := 'd1111111-1111-4111-a111-111111111111';
    dev_namlong_id UUID := 'd2222222-2222-4222-a222-222222222222';
    dev_sonkim_id UUID := 'd3333333-3333-4333-a333-333333333333';
    
    -- Projects
    proj_vhgp_id UUID := 'p1111111-1111-4111-b111-111111111111';
    proj_akari_id UUID := 'p2222222-2222-4222-b222-222222222222';
    proj_stellars_id UUID := 'p3333333-3333-4333-b333-333333333333';
    
    -- Employees
    emp_admin_id UUID := 'e1111111-1111-4111-c111-111111111111';
    emp_sale_mgr_id UUID := 'e2222222-2222-4222-c222-222222222222';
    emp_leader_id UUID := 'e3333333-3333-4333-c333-333333333333';
    emp_sale1_id UUID := 'e4444444-4444-4444-c444-444444444444';
    emp_accountant_id UUID := 'e5555555-5555-5555-c555-555555555555';
    emp_marketing_id UUID := 'e6666666-6666-6666-c666-666666666666';
    
    -- Customers
    cust1_id UUID := 'c1111111-1111-4111-d111-111111111111';
    cust2_id UUID := 'c2222222-2222-4222-d222-222222222222';
    
    -- Units
    unit1_id UUID := 'u1111111-1111-4111-f111-111111111111';
    unit2_id UUID := 'u2222222-2222-4222-f222-222222222222';
    
    -- Contracts
    contract1_id UUID := 'a1111111-1111-4111-e111-111111111111';
    contract2_id UUID := 'a2222222-2222-4222-e222-222222222222';

    -- Distribution Contracts
    dist_vin_id UUID := 'b1111111-1111-4111-8111-111111111111';
BEGIN
    -- CLEANUP (Optional - Uncomment to reset)
    -- DELETE FROM public.internal_commissions;
    -- DELETE FROM public.commission_records;
    -- DELETE FROM public.expenses;
    -- DELETE FROM public.cancellations;
    -- DELETE FROM public.sale_contracts;
    -- DELETE FROM public.bookings;
    -- DELETE FROM public.units;
    -- DELETE FROM public.projects;
    -- DELETE FROM public.developers;
    -- DELETE FROM public.employees;

    -- 1. DEVELOPERS
    INSERT INTO public.developers (id, code, name, tax_code, address) VALUES
    (dev_vin_id, 'VIN', 'Vingroup / Vinhomes', '0101245486', 'Số 7 Đường Bằng Lăng 1, Vinhomes Riverside, Long Biên, Hà Nội'),
    (dev_namlong_id, 'NLG', 'Nam Long Group', '0301430957', 'Số 6 Nguyễn Khắc Viện, P. Tân Phú, Quận 7, TP.HCM'),
    (dev_sonkim_id, 'SKL', 'SonKim Land', '0312678945', '53-55 Nguyễn Đình Chiểu, P.6, Quận 3, TP.HCM')
    ON CONFLICT (id) DO NOTHING;

    -- 2. PROJECTS
    INSERT INTO public.projects (id, code, name, developer_id, project_type, default_commission_rate, vat_rate, total_units) VALUES
    (proj_vhgp_id, 'VHGP', 'Vinhomes Grand Park', dev_vin_id, 'Apartment', 0.035, 0.10, 44000),
    (proj_akari_id, 'AKARI', 'Akari City', dev_namlong_id, 'Apartment', 0.030, 0.10, 5000),
    (proj_stellars_id, 'STELLARS', 'The 9 Stellars', dev_sonkim_id, 'Villa/Apartment', 0.040, 0.10, 800)
    ON CONFLICT (id) DO NOTHING;

    -- 3. EMPLOYEES
    INSERT INTO public.employees (id, code, full_name, role, email, phone, is_active) VALUES
    (emp_admin_id, 'EMP001', 'Nguyễn Quản Trị', 'admin', 'admin@erpbds.vn', '0901111111', true),
    (emp_sale_mgr_id, 'EMP002', 'Lê Giám Đốc', 'sales_manager', 'director@erpbds.vn', '0902222222', true),
    (emp_leader_id, 'EMP003', 'Trần Trưởng Nhóm', 'team_leader', 'leader@erpbds.vn', '0903333333', true),
    (emp_sale1_id, 'EMP004', 'Phạm Nhân Viên', 'sales', 'sale1@erpbds.vn', '0904444444', true),
    (emp_accountant_id, 'EMP005', 'Hoàng Kế Toán', 'accountant', 'acc@erpbds.vn', '0905555555', true),
    (emp_marketing_id, 'EMP006', 'Vũ Marketing', 'admin', 'mkt@erpbds.vn', '0906666666', true)
    ON CONFLICT (id) DO NOTHING;

    -- Update hierarchy
    UPDATE public.employees SET manager_id = emp_sale_mgr_id WHERE id = emp_leader_id;
    UPDATE public.employees SET team_leader_id = emp_leader_id, manager_id = emp_sale_mgr_id WHERE id = emp_sale1_id;

    -- 4. DISTRIBUTION CONTRACTS
    INSERT INTO public.distribution_contracts (id, contract_number, project_id, developer_id, signed_date, commission_rate) VALUES
    (dist_vin_id, 'DC/VIN/VHGP/2026', proj_vhgp_id, dev_vin_id, '2026-01-01', 0.035)
    ON CONFLICT (id) DO NOTHING;

    -- 5. CUSTOMERS
    INSERT INTO public.customers (id, code, full_name, phone, email, source) VALUES
    (cust1_id, 'CUS001', 'Trần Đại Gia', '0988888888', 'daigia@gmail.com', 'Facebook Ads'),
    (cust2_id, 'CUS002', 'Lý Đầu Tư', '0977777777', 'dautu@yahoo.com', 'Event')
    ON CONFLICT (id) DO NOTHING;

    -- 6. UNITS
    INSERT INTO public.units (id, project_id, code, block, floor, unit_number, list_price, status) VALUES
    (unit1_id, proj_vhgp_id, 'OR1-10.05', 'OR1', '10', '05', 3500000000, 'contracted'),
    (unit2_id, proj_akari_id, 'AK2-05.12', 'AK2', '05', '12', 2800000000, 'reserved')
    ON CONFLICT (id) DO NOTHING;

    -- 7. BOOKINGS
    INSERT INTO public.bookings (booking_number, unit_id, customer_id, sales_id, booking_date, booking_amount, status) VALUES
    ('BK001', unit2_id, cust2_id, emp_sale1_id, CURRENT_DATE - INTERVAL '5 days', 50000000, 'active')
    ON CONFLICT DO NOTHING;

    -- 8. SALE CONTRACTS
    INSERT INTO public.sale_contracts (id, contract_number, unit_id, customer_id, sales_id, team_leader_id, distribution_contract_id, signed_date, total_value, agreed_commission_rate, expected_commission_amount) VALUES
    (contract1_id, 'HĐMB/VHGP/OR1/1005', unit1_id, cust1_id, emp_sale1_id, emp_leader_id, dist_vin_id, CURRENT_DATE - INTERVAL '30 days', 3500000000, 0.035, 122500000)
    ON CONFLICT (id) DO NOTHING;

    -- 9. EXPENSES (MARKETING & OPERATIONS)
    INSERT INTO public.expenses (expense_number, expense_date, category, amount, description, project_id, employee_id, payment_status) VALUES
    ('EXP001', CURRENT_DATE - INTERVAL '15 days', 'marketing', 25000000, 'Chạy Facebook Ads Vinhomes GP - Chiến dịch tháng 5', proj_vhgp_id, emp_marketing_id, 'paid'),
    ('EXP002', CURRENT_DATE - INTERVAL '10 days', 'event_open_sale', 45000000, 'Tổ chức sự kiện trải nghiệm thực tế Akari City', proj_akari_id, emp_marketing_id, 'paid'),
    ('EXP003', CURRENT_DATE - INTERVAL '5 days', 'office_rent', 15000000, 'Thuê sàn giao dịch Masteri Centre Point', proj_stellars_id, emp_admin_id, 'pending'),
    ('EXP004', CURRENT_DATE - INTERVAL '2 days', 'marketing', 12000000, 'Zalo Ads & Google Search - Akari City', proj_akari_id, emp_marketing_id, 'paid')
    ON CONFLICT DO NOTHING;

    -- 10. COMMISSION RECORDS (RECEIVABLES FROM DEVELOPERS)
    INSERT INTO public.commission_records (record_number, sale_contract_id, distribution_contract_id, developer_id, project_id, recognition_date, base_amount, commission_rate, commission_amount, status) VALUES
    ('CR/2026/001', contract1_id, dist_vin_id, dev_vin_id, proj_vhgp_id, CURRENT_DATE - INTERVAL '20 days', 3500000000, 0.035, 122500000, 'recognized')
    ON CONFLICT DO NOTHING;

    -- 11. INTERNAL COMMISSIONS (PAYOUTS)
    -- Sale: 65%, Leader: 10%, Manager: 5% (based on split policy)
    INSERT INTO public.internal_commissions (sale_contract_id, recipient_type, recipient_employee_id, base_commission_amount, rate, amount_before_tax, net_amount, status) VALUES
    (contract1_id, 'sales', emp_sale1_id, 122500000, 0.65, 79625000, 71662500, 'approved'),
    (contract1_id, 'team_leader', emp_leader_id, 122500000, 0.10, 12250000, 11025000, 'calculated'),
    (contract1_id, 'manager', emp_sale_mgr_id, 122500000, 0.05, 6125000, 5512500, 'calculated')
    ON CONFLICT DO NOTHING;

    -- 12. CHART OF ACCOUNTS (Refill if needed)
    INSERT INTO public.chart_of_accounts (account_code, account_name, account_type) VALUES
    ('111', 'Tiền mặt', 'Asset'),
    ('112', 'Tiền gửi ngân hàng', 'Asset'),
    ('131', 'Phải thu khách hàng', 'Asset'),
    ('1311', 'Phải thu Chủ đầu tư (Hoa hồng)', 'Asset'),
    ('331', 'Phải trả người bán', 'Liability'),
    ('334', 'Phải trả nhân viên (Hoa hồng)', 'Liability'),
    ('511', 'Doanh thu dịch vụ môi giới', 'Revenue'),
    ('641', 'Chi phí bán hàng / Marketing', 'Expense')
    ON CONFLICT (account_code) DO NOTHING;

END $$;
