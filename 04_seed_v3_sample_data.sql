-- =====================================================================
-- SEED DATA FOR ERP V3 (CLEAN ARCHITECTURE)
-- Dữ liệu mẫu chuẩn hóa để kiểm thử tính năng Tài chính & KPI
-- =====================================================================

-- 1. Xóa dữ liệu cũ (nếu có - Cẩn thận khi chạy)
-- truncate projects, units, customers, employees, f2_agencies cascade;

-- 2. Thiết lập Nhân sự mẫu
insert into employees (full_name, email, role, department, status) values
('Nguyễn Văn Admin', 'admin@erp.com', 'admin', 'Ban Giám Đốc', 'active'),
('Trần Thị Kế Toán', 'accounting@erp.com', 'accountant', 'Tài Chính', 'active'),
('Lê Văn Trưởng Phòng', 'manager@erp.com', 'manager', 'Kinh Doanh 1', 'active'),
('Hoàng Thị Sale 1', 'sale1@erp.com', 'sale', 'Kinh Doanh 1', 'active'),
('Phạm Văn Sale 2', 'sale2@erp.com', 'sale', 'Kinh Doanh 1', 'active');

-- 3. Thiết lập Đại lý F2 (Liên kết)
insert into f2_agencies (name, contact_person, email, commission_rate_default) values
('Đại Lý Đất Việt', 'Anh Việt', 'viet@datviet.com', 0.025);

-- 4. Dự án mẫu
insert into projects (name, developer_name, location, project_type, status, commission_rate_standard) values
('Vinhomes Grand Park', 'Vinhomes', 'TP. Thủ Đức', 'apartment', 'selling', 0.035),
('Masteri Centre Point', 'Masterise Homes', 'TP. Thủ Đức', 'apartment', 'selling', 0.04);

-- 5. Sản phẩm (Units) mẫu
insert into units (project_id, code, block, floor, type, area, price_gross, status)
select 
  id as project_id,
  'S101-0' || i as code,
  'S1.01' as block,
  i as floor,
  '2BR' as type,
  65.5 as area,
  2500000000 + (i * 50000000) as price_gross,
  'available' as status
from projects, generate_series(5, 10) i
where name = 'Vinhomes Grand Park';

-- 6. Khách hàng mẫu
insert into customers (full_name, phone, email, lead_source) values
('Nguyễn Thị Khách', '0901234567', 'khach@gmail.com', 'Facebook Ads'),
('Trần Văn Mua', '0988776655', 'mua@hotmail.com', 'Google Search');

-- 7. Chính sách hoa hồng nội bộ mẫu
insert into commission_split_policies (project_id, sale_rate, manager_rate, company_rate)
select id, 0.45, 0.1, 0.45 from projects;

-- 8. Tạo Hợp đồng mẫu (Contract 1: Đã thanh toán 1 đợt)
do $$
declare
  v_proj_id uuid;
  v_unit_id uuid;
  v_cust_id uuid;
  v_sale_id uuid;
  v_contract_id uuid;
begin
  select id into v_proj_id from projects where name = 'Vinhomes Grand Park' limit 1;
  select id into v_unit_id from units where project_id = v_proj_id limit 1;
  select id into v_cust_id from customers limit 1;
  select id into v_sale_id from employees where role = 'sale' limit 1;

  -- Tạo hợp đồng
  insert into sale_contracts (
    project_id, unit_id, customer_id, sales_id, 
    contract_number, contract_date, total_value, status
  ) values (
    v_proj_id, v_unit_id, v_cust_id, v_sale_id,
    'HĐ-VGP-001', current_date - interval '10 days', 2800000000, 'active'
  ) returning id into v_contract_id;

  -- Cập nhật trạng thái căn
  update units set status = 'sold' where id = v_unit_id;

  -- Tạo lịch thanh toán
  insert into payment_schedules (sale_contract_id, installment_number, description, amount, due_date, status) values
  (v_contract_id, 1, 'Đợt 1 - Ký HĐ', 500000000, current_date - interval '5 days', 'paid'),
  (v_contract_id, 2, 'Đợt 2 - Xây móng', 300000000, current_date + interval '25 days', 'pending');
end $$;

-- 9. Thêm chỉ tiêu KPI cho tháng hiện tại
insert into kpi_targets (employee_id, month, year, target_revenue, target_units)
select id, extract(month from current_date), extract(year from current_date), 5000000000, 2
from employees where role = 'sale';

-- 10. Chi phí Marketing mẫu (để test P&L)
insert into expenses (project_id, category, amount, description, expense_date)
select id, 'Marketing', 50000000, 'Chạy quảng cáo Facebook tháng ' || extract(month from current_date), current_date - interval '2 days'
from projects;
