import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import initialDb from '../data/db.json';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [allLeads, setLeads] = useState([]);
  const [allTransactions, setTransactions] = useState([]);
  const [allMarketing, setMarketing] = useState([]);
  const [allFinancials, setFinancials] = useState([]);
  const [sales, setSales] = useState(initialDb.sales || []);
  const [staff, setStaff] = useState(initialDb.staff || []);
  const [loadingData, setLoadingData] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [globalFilter, setGlobalFilter] = useState('all');

  // Pagination, Search & Sort State
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [leadsSearch, setLeadsSearch] = useState('');
  const [leadsSort, setLeadsSort] = useState({ column: 'ngay_nhan', ascending: false });

  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [transSearch, setTransSearch] = useState('');
  const [transSort, setTransSort] = useState({ column: 'ngay_gd', ascending: false });

  const [dashboardStats, setDashboardStats] = useState(null);
  const itemsPerPage = 15;

  // --- SERVER-SIDE FILTER HELPERS ---
  const applyDateRange = (filter) => {
    if (!filter || filter === 'all') return [null, null];
    const [type, val] = filter.split(':');
    let start, end;

    if (type === 'day') {
      const [d, m, y] = val.split('/');
      const dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      start = `${dateStr}T00:00:00+07:00`;
      end = `${dateStr}T23:59:59+07:00`;
    } else if (type === 'month') {
      const [m, y] = val.split('/');
      const monthStr = m.padStart(2, '0');
      const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
      start = `${y}-${monthStr}-01T00:00:00+07:00`;
      end = `${y}-${monthStr}-${lastDay.toString().padStart(2, '0')}T23:59:59+07:00`;
    } else if (type === 'quarter') {
      const parts = val.split('/');
      const quarterNum = parseInt(parts[0].replace('Q', ''));
      const year = parts[1];
      const startMonth = (quarterNum - 1) * 3 + 1;
      const endMonth = quarterNum * 3;
      const lastDay = new Date(parseInt(year), endMonth, 0).getDate();
      start = `${year}-${startMonth.toString().padStart(2, '0')}-01T00:00:00+07:00`;
      end = `${year}-${endMonth.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}T23:59:59+07:00`;
    } else if (type === 'year') {
      start = `${val}-01-01T00:00:00+07:00`;
      end = `${val}-12-31T23:59:59+07:00`;
    }
    return [start, end];
  };

  const applyDateFilter = (query, filter, dateColumn) => {
    const [start, end] = applyDateRange(filter);
    if (start && end) return query.gte(dateColumn, start).lte(dateColumn, end);
    return query;
  };

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoadingData(true);
    try {
      const [start, end] = applyDateRange(globalFilter);

      // 1. Fetch Dashboard Stats (RPC)
      const { data: statsData } = await supabase.rpc('get_dashboard_stats', {
        p_start_date: start || '2000-01-01T00:00:00Z',
        p_end_date: end || '2099-12-31T23:59:59Z',
        p_role: currentUser.role,
        p_ma_nv: currentUser.ma_nv || ''
      });
      setDashboardStats(statsData);

      // 2. Fetch Static Data
      const [empRes, mktListRes] = await Promise.all([
        supabase.from('employees').select('*').order('ho_ten', { ascending: true }),
        supabase.from('marketing_campaigns').select('*')
      ]);

      const employees = empRes.data || [];
      const campaigns = mktListRes.data || [];
      setStaff(employees.map(emp => ({
        "Mã NV": emp.ma_nv,
        "Tên NV": emp.ho_ten,
        "Sàn": emp.phong_ban,
        "Chức vụ": emp.chuc_vu || "",
        "SĐT": emp.sdt ? (String(emp.sdt).startsWith('0') ? String(emp.sdt) : '0' + String(emp.sdt)) : "",
        "Email": emp.email || "",
        "Ngày vào làm": emp.ngay_vao_lam || "",
        "Trạng thái": emp.trang_thai || "Active",
        "Lương (VNĐ)": emp.luong || 0,
        "Quản lý (Mã NV)": emp.quan_ly_id || ""
      })));

      const getEmpName = (id) => employees.find(e => e.ma_nv == id)?.ho_ten || id || "";
      const getCampaignName = (id) => campaigns.find(c => c.ma_chien_dich == id)?.ten_chien_dich || id || "";

      const userRole = (currentUser.role || 'Admin').toLowerCase();
      const isAdminOrBOD = ['admin', 'bod'].includes(userRole);

      // 3. Fetch Paginated Leads
      let leadsQuery = supabase.from('leads').select('*', { count: 'exact' });
      leadsQuery = applyDateFilter(leadsQuery, globalFilter, 'ngay_nhan');
      if (!isAdminOrBOD) leadsQuery = leadsQuery.eq('nhan_vien_id', currentUser.ma_nv);
      if (leadsSearch) leadsQuery = leadsQuery.or(`ho_ten.ilike.%${leadsSearch}%,sdt.ilike.%${leadsSearch}%,ma_lead.ilike.%${leadsSearch}%`);

      const leadsRange = [(leadsPage - 1) * itemsPerPage, leadsPage * itemsPerPage - 1];
      const { data: dbLeads, count: leadsCount } = await leadsQuery
        .range(leadsRange[0], leadsRange[1])
        .order(leadsSort.column, { ascending: leadsSort.ascending });

      if (dbLeads) {
        setLeads(dbLeads.map(l => ({
          "Mã lead": l.ma_lead || "CHƯA CÓ",
          "Ngày nhận": l.ngay_nhan,
          "Họ tên": l.ho_ten,
          "SĐT (đầy đủ)": l.sdt,
          "SĐT (ẩn)": l.sdt ? l.sdt.substring(0, l.sdt.length - 3) + "***" : "",
          "Nguồn": l.nguon || "Khác",
          "Chiến dịch": getCampaignName(l.chien_dich_id),
          "_campaign_id": l.chien_dich_id,
          "Nhu cầu": l.nhu_cau,
          "Trạng thái": l.trang_thai,
          "Sales phụ trách": getEmpName(l.nhan_vien_id),
          "Mã NV": l.nhan_vien_id,
          "_employee_id": l.nhan_vien_id || null,
          "Tên sàn": l.ten_san || "Nội bộ",
          "Ngày hẹn": l.ngay_hen,
          "Ngày FU": l.ngay_fu,
          "Ghi chú": l.ghi_chu
        })));
        setLeadsTotal(leadsCount || 0);
      }

      // 4. Fetch Paginated Transactions
      let transQuery = supabase.from('transactions').select('*', { count: 'exact' });
      transQuery = applyDateFilter(transQuery, globalFilter, 'ngay_gd');
      if (!isAdminOrBOD && userRole !== 'kế toán') transQuery = transQuery.eq('nhan_vien_id', currentUser.ma_nv);
      if (transSearch) transQuery = transQuery.or(`ma_gd.ilike.%${transSearch}%,ma_sp.ilike.%${transSearch}%,khach_hang_id.ilike.%${transSearch}%`);

      const transRange = [(transactionsPage - 1) * itemsPerPage, transactionsPage * itemsPerPage - 1];
      const { data: dbTrans, count: transCount } = await transQuery
        .range(transRange[0], transRange[1])
        .order(transSort.column, { ascending: transSort.ascending });

      if (dbTrans) {
        const leadIds = [...new Set(dbTrans.map(t => t.khach_hang_id).filter(Boolean))];
        const { data: leadNames } = await supabase.from('leads').select('ma_lead, ho_ten').in('ma_lead', leadIds);
        const getLeadName = (id) => leadNames?.find(l => l.ma_lead === id)?.ho_ten || id;

        setTransactions(dbTrans.map(t => ({
          "Mã GD": t.ma_gd,
          "Ngày GD": t.ngay_gd,
          "Mã SP": t.ma_sp,
          "Phân khu": t.phan_khu,
          "Giá (VNĐ)": t.gia,
          "Tiền cọc": t.tien_coc,
          "Hoa hồng": t.hoa_hong,
          "Trạng thái": t.trang_thai,
          "Ghi chú": t.ghi_chu,
          "Sales": getEmpName(t.nhan_vien_id),
          "Mã nhân viên": t.nhan_vien_id,
          "Khách hàng": getLeadName(t.khach_hang_id),
          "Mã Lead": t.khach_hang_id
        })));
        setTransactionsTotal(transCount || 0);
      }

      // 5. Marketing & Financials
      const [mktRes, finRes] = await Promise.all([
        supabase.from('marketing_campaigns').select('*').order('ma_chien_dich', { ascending: false }),
        supabase.from('financial_records').select('*').order('thang', { ascending: false })
      ]);

      if (mktRes.data) {
        setMarketing(mktRes.data.map(m => ({
          "Tháng": m.thang, "Kênh": m.kenh, "Tên chiến dịch": m.ten_chien_dich,
          "CP (tr)": m.chi_phi ? (m.chi_phi / 1000000).toFixed(1) : 0,
          "Lead": m.so_lead, "Booking": m.so_booking, "Tỷ lệ CĐ": m.ty_le_chuyen_doi,
          "CPL (tr)": m.chi_phi_moi_lead ? (m.chi_phi_moi_lead / 1000000).toFixed(1) : 0,
          "CP/Book (tr)": m.chi_phi_moi_booking ? (m.chi_phi_moi_booking / 1000000).toFixed(1) : 0,
          "Click": m.luot_click, "Ghi chú": m.ghi_chu, "_id": m.ma_chien_dich
        })));
      }

      if (finRes.data) {
        setFinancials(finRes.data.map(f => ({
          "Tháng": f.thang, "Hạng mục": f.hang_muc, "Loại": f.loai,
          "Thực tế (tỷ)": f.thuc_te ? (f.thuc_te / 1000000000).toFixed(2) : 0,
          "KH (tỷ)": f.ke_hoach ? (f.ke_hoach / 1000000000).toFixed(2) : 0,
          "% Hoàn thành": f.ty_le_hoan_thanh,
          "Chênh lệch": f.chenh_lech ? (f.chenh_lech / 1000000000).toFixed(2) : 0,
          "Ghi chú": f.ghi_chu, "Người duyệt": getEmpName(f.nguoi_duyet_id), "_approver_id": f.nguoi_duyet_id, "_id": f.ma_tc
        })));
      }

      // 6. Sales Performance (Now uses Aggregated DS for all employees)
      const { data: salesAgg } = await supabase.from('transactions').select('nhan_vien_id, gia');
      const salesData = employees.map(emp => {
        const initialSale = initialDb.sales.find(s => s["Tên NV"] === emp.ho_ten) || {};
        const kpi = initialSale["KH DS (tỷ)"] || 10;
        const totalSales = (salesAgg?.filter(t => t.nhan_vien_id === emp.ma_nv).reduce((sum, t) => sum + Number(t.gia || 0), 0) || 0) / 1000000000;
        const pctKPI = kpi > 0 ? (totalSales / kpi) : 0;
        return {
          "Mã NV": emp.ma_nv, "Tên NV": emp.ho_ten, "Sàn": emp.phong_ban, "KH DS (tỷ)": kpi,
          "Doanh số (tỷ)": totalSales.toFixed(2), "DS thực (tỷ)": totalSales.toFixed(2), "% KPI": pctKPI,
          "XẾP LOẠI KPI": pctKPI >= 1 ? 'Xuất sắc' : pctKPI >= 0.8 ? 'Tốt' : 'Kém',
          "Lương cứng (tr)": initialSale["Lương cứng (tr)"] || 5, "Gọi điện": initialSale["Gọi điện"] || 0,
          "Site Visit": initialSale["Site Visit"] || 0, "KH Site Visit": initialSale["KH Site Visit"] || 5,
          "HĐMB THỰC TẾ": initialSale["HĐMB THỰC TẾ"] || 0, "KH HĐMB": initialSale["KH HĐMB"] || 1,
          "CỌC": initialSale["CỌC"] || 0, "KH CỌC": initialSale["KH CỌC"] || 2
        };
      }).filter(s => Number(s["Doanh số (tỷ)"]) > 0 || s["Sàn"] === 'Sales' || s["Sàn"] === 'Operations');
      setSales(salesData);

    } catch (error) {
      console.error("Critical error in fetchData:", error);
    } finally {
      setLoadingData(false);
    }
  }, [globalFilter, leadsPage, leadsSearch, leadsSort, transactionsPage, transSearch, transSort, currentUser]);

  const subscribeToTable = (tableName) => {
    return supabase
      .channel(`${tableName}-realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
        const userCode = currentUser?.ma_nv;
        const isAdmin = ['Admin', 'BOD'].includes(currentUser?.role);

        let isRelevant = isAdmin;
        if (!isRelevant && tableName === 'leads') {
          isRelevant = payload.new?.nhan_vien_id === userCode || payload.old?.nhan_vien_id === userCode;
        } else if (!isRelevant && tableName === 'transactions') {
          isRelevant = payload.new?.nhan_vien_id === userCode || payload.old?.nhan_vien_id === userCode || currentUser?.role === 'Kế toán';
        }

        if (isRelevant) {
          fetchData();
        }
      })
      .subscribe();
  };

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (profile) {
            // Capitalize role to match App.jsx requirements
            const normalizedRole = profile.role ? (profile.role.charAt(0).toUpperCase() + profile.role.slice(1).toLowerCase()) : 'Admin';
            setCurrentUser({
              id: session.user.id,
              email: session.user.email,
              role: normalizedRole === 'Admin' ? 'Admin' : (profile.role || 'Admin'),
              ma_nv: profile.employee_code || 'ADMIN01',
              full_name: profile.full_name || session.user.email.split('@')[0]
            });
          } else {
            console.warn('Profile not found. Defaulting to Admin.');
            setCurrentUser({
              id: session.user.id,
              email: session.user.email,
              role: 'Admin',
              ma_nv: 'ADMIN01',
              full_name: session.user.email.split('@')[0]
            });
          }
        } else {
          // No session - default to Guest Admin for development or redirect to login
          setCurrentUser({ role: 'Admin', ma_nv: 'ADMIN01', full_name: 'Guest Admin' });
        }
      } catch (err) {
        console.error('Auth error:', err);
        setCurrentUser({ role: 'Admin', ma_nv: 'ADMIN01', full_name: 'Guest Admin' });
      }
    };

    handleAuth();

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') handleAuth();
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setLeads([]);
        setTransactions([]);
      }
    });

    return () => {
      authSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [fetchData]);

  useEffect(() => {
    let leadSub, transSub;
    if (currentUser) {
      leadSub = subscribeToTable('leads');
      transSub = subscribeToTable('transactions');
    }
    return () => {
      leadSub?.unsubscribe();
      transSub?.unsubscribe();
    };
  }, [currentUser]);

  // --- MUTATION FUNCTIONS (Supabase Sync) ---
  const addLead = async (newLead) => {
    const dbLead = {
      ma_lead: newLead["Mã lead"],
      ngay_nhan: newLead["Ngày nhận"] || null,
      ho_ten: newLead["Họ tên"],
      sdt: newLead["SĐT (đầy đủ)"],
      nguon: newLead["Nguồn"],
      chien_dich_id: newLead["_campaign_id"] || null,
      nhu_cau: newLead["Nhu cầu"],
      trang_thai: newLead["Trạng thái"],
      nhan_vien_id: newLead["Mã NV"] || null,
      ten_san: newLead["Tên sàn"],
      ngay_hen: newLead["Ngày hẹn"] || null,
      ngay_fu: newLead["Ngày FU"] || null,
      ghi_chu: newLead["Ghi chú"]
    };
    const { error } = await supabase.from('leads').insert([dbLead]);
    if (error) { alert("Lỗi: " + error.message); } else { fetchData(); }
  };

  const editLead = async (updatedLead) => {
    const dbLead = {
      ho_ten: updatedLead["Họ tên"],
      sdt: updatedLead["SĐT (đầy đủ)"],
      nguon: updatedLead["Nguồn"],
      chien_dich_id: updatedLead["_campaign_id"] || null,
      nhu_cau: updatedLead["Nhu cầu"],
      trang_thai: updatedLead["Trạng thái"],
      nhan_vien_id: updatedLead["Mã NV"] || null,
      ten_san: updatedLead["Tên sàn"],
      ngay_hen: updatedLead["Ngày hẹn"] || null,
      ngay_fu: updatedLead["Ngày FU"] || null,
      ghi_chu: updatedLead["Ghi chú"]
    };
    const { error } = await supabase.from('leads').update(dbLead).eq('ma_lead', updatedLead["Mã lead"]);
    if (error) { alert("Lỗi: " + error.message); } else { fetchData(); }
  };

  const addMultipleLeads = async (newLeadsArray) => {
    const dbLeads = newLeadsArray.map(l => ({
      ma_lead: l["Mã lead"],
      ngay_nhan: l["Ngày nhận"],
      ho_ten: l["Họ tên"],
      sdt: l["SĐT (đầy đủ)"],
      nguon: l["Nguồn"],
      chien_dich_id: l["_campaign_id"] || null,
      nhu_cau: l["Nhu cầu"],
      trang_thai: l["Trạng thái"],
      nhan_vien_id: l["Mã NV"] || null,
      ten_san: l["Tên sàn"],
      ngay_hen: l["Ngày hẹn"] || null,
      ngay_fu: l["Ngày FU"] || null,
      ghi_chu: l["Ghi chú"]
    }));
    const { error } = await supabase.from('leads').upsert(dbLeads);
    if (error) { alert("Lỗi: " + error.message); } else { fetchData(); }
  };

  const updateLeads = async (updatedLeadsArray) => {
    const dbLeads = updatedLeadsArray.map(l => ({
      ma_lead: l["Mã lead"],
      nhan_vien_id: l["_employee_id"] || l["Mã NV"],
      trang_thai: l["Trạng thái"],
      ghi_chu: l["Ghi chú"]
    }));
    const { error } = await supabase.from('leads').upsert(dbLeads);
    if (error) { alert("Lỗi: " + error.message); } else { fetchData(); }
  };

  const addTransaction = async (newTransaction) => {
    const dbTrans = {
      ma_gd: newTransaction["Mã GD"],
      ngay_gd: newTransaction["Ngày GD"] || null,
      khach_hang_id: newTransaction["Mã Lead"],
      nhan_vien_id: newTransaction["Mã nhân viên"],
      ma_sp: newTransaction["Mã SP"],
      phan_khu: newTransaction["Phân khu"],
      gia: Number(newTransaction["Giá (VNĐ)"]),
      tien_coc: Number(newTransaction["Tiền cọc"]),
      hoa_hong: Number(newTransaction["Hoa hồng"]),
      trang_thai: newTransaction["Trạng thái"],
      ghi_chu: newTransaction["Ghi chú"]
    };
    const { error } = await supabase.from('transactions').insert([dbTrans]);
    if (error) { alert("Lỗi: " + error.message); } else { fetchData(); }
  };

  const editTransaction = async (updatedTransaction) => {
    const dbTrans = {
      ngay_gd: updatedTransaction["Ngày GD"] || null,
      khach_hang_id: updatedTransaction["Mã Lead"],
      nhan_vien_id: updatedTransaction["Mã nhân viên"],
      ma_sp: updatedTransaction["Mã SP"],
      phan_khu: updatedTransaction["Phân khu"],
      gia: Number(updatedTransaction["Giá (VNĐ)"]),
      tien_coc: Number(updatedTransaction["Tiền cọc"]),
      hoa_hong: Number(updatedTransaction["Hoa hồng"]),
      trang_thai: updatedTransaction["Trạng thái"],
      ghi_chu: updatedTransaction["Ghi chú"]
    };
    const { error } = await supabase.from('transactions').update(dbTrans).eq('ma_gd', updatedTransaction["Mã GD"]);
    if (error) { alert("Lỗi: " + error.message); } else { fetchData(); }
  };

  const addMarketing = async (newMarketing) => {
    const dbMkt = {
      ma_chien_dich: newMarketing["Tên chiến dịch"],
      thang: newMarketing["Tháng"],
      kenh: newMarketing["Kênh"],
      ten_chien_dich: newMarketing["Tên chiến dịch"],
      chi_phi: Number(newMarketing["CP (tr)"]) * 1000000,
      so_lead: Number(newMarketing["Lead"]),
      so_booking: Number(newMarketing["Booking"]),
      ty_le_chuyen_doi: Number(newMarketing["Tỷ lệ CĐ"]),
      chi_phi_moi_lead: Number(newMarketing["CPL (tr)"]) * 1000000,
      chi_phi_moi_booking: Number(newMarketing["CP/Book (tr)"]) * 1000000,
      luot_click: Number(newMarketing["Click"]),
      ghi_chu: newMarketing["Ghi chú"]
    };
    const { error } = await supabase.from('marketing_campaigns').insert([dbMkt]);
    if (!error) fetchData();
  };

  const editMarketing = async (updatedMarketing) => {
    const dbMkt = {
      thang: updatedMarketing["Tháng"],
      kenh: updatedMarketing["Kênh"],
      ten_chien_dich: updatedMarketing["Tên chiến dịch"],
      chi_phi: Number(updatedMarketing["CP (tr)"]) * 1000000,
      so_lead: Number(updatedMarketing["Lead"]),
      so_booking: Number(updatedMarketing["Booking"]),
      ty_le_chuyen_doi: Number(updatedMarketing["Tỷ lệ CĐ"]),
      chi_phi_moi_lead: Number(updatedMarketing["CPL (tr)"]) * 1000000,
      chi_phi_moi_booking: Number(updatedMarketing["CP/Book (tr)"]) * 1000000,
      luot_click: Number(updatedMarketing["Click"]),
      ghi_chu: updatedMarketing["Ghi chú"]
    };
    const { error } = await supabase.from('marketing_campaigns').update(dbMkt).eq('ma_chien_dich', updatedMarketing["_id"]);
    if (!error) fetchData();
  };

  const addFinancial = async (newFinancial) => {
    const dbFin = {
      thang: newFinancial["Tháng"],
      hang_muc: newFinancial["Hạng mục"],
      loai: newFinancial["Loại"],
      thuc_te: Number(newFinancial["Thực tế (tỷ)"]) * 1000000000,
      ke_hoach: Number(newFinancial["KH (tỷ)"]) * 1000000000,
      ty_le_hoan_thanh: Number(newFinancial["% Hoàn thành"]),
      chenh_lech: Number(newFinancial["Chênh lệch"]) * 1000000000,
      ghi_chu: newFinancial["Ghi chú"],
      nguoi_duyet_id: newFinancial["_approver_id"]
    };
    const { error } = await supabase.from('financial_records').insert([dbFin]);
    if (!error) fetchData();
  };

  const editFinancial = async (updatedFinancial) => {
    const dbFin = {
      loai: updatedFinancial["Loại"],
      thuc_te: Number(updatedFinancial["Thực tế (tỷ)"]) * 1000000000,
      ke_hoach: Number(updatedFinancial["KH (tỷ)"]) * 1000000000,
      ty_le_hoan_thanh: Number(updatedFinancial["% Hoàn thành"]),
      chenh_lech: Number(updatedFinancial["Chênh lệch"]) * 1000000000,
      ghi_chu: updatedFinancial["Ghi chú"],
      nguoi_duyet_id: updatedFinancial["_approver_id"]
    };
    const { error } = await supabase.from('financial_records').update(dbFin).eq('ma_tc', updatedFinancial["_id"]);
    if (!error) fetchData();
  };

  const addStaff = async (newStaff) => {
    const dbStaff = {
      ma_nv: newStaff["Mã NV"],
      ho_ten: newStaff["Tên NV"],
      phong_ban: newStaff["Sàn"],
      chuc_vu: newStaff["Chức vụ"],
      sdt: newStaff["SĐT"],
      email: newStaff["Email"],
      ngay_vao_lam: newStaff["Ngày vào làm"] || null,
      trang_thai: newStaff["Trạng thái"],
      luong: Number(newStaff["Lương (VNĐ)"]),
      quan_ly_id: newStaff["Quản lý (Mã NV)"]
    };
    const { error } = await supabase.from('employees').insert([dbStaff]);
    if (error) { alert("Lỗi: " + error.message); } else { fetchData(); }
  };

  const editStaff = async (updatedStaff) => {
    const dbStaff = {
      ho_ten: updatedStaff["Tên NV"],
      phong_ban: updatedStaff["Sàn"],
      chuc_vu: updatedStaff["Chức vụ"],
      sdt: updatedStaff["SĐT"],
      email: updatedStaff["Email"],
      ngay_vao_lam: updatedStaff["Ngày vào làm"] || null,
      trang_thai: updatedStaff["Trạng thái"],
      luong: Number(updatedStaff["Lương (VNĐ)"]),
      quan_ly_id: updatedStaff["Quản lý (Mã NV)"]
    };
    const { error } = await supabase.from('employees').update(dbStaff).eq('ma_nv', updatedStaff["Mã NV"]);
    if (error) { alert("Lỗi: " + error.message); } else { fetchData(); }
  };

  const deleteLead = async (id) => {
    const { error } = await supabase.from('leads').delete().eq('ma_lead', id);
    if (!error) fetchData();
  };

  const deleteTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('ma_gd', id);
    if (!error) fetchData();
  };

  const deleteStaff = async (id) => {
    const { error } = await supabase.from('employees').delete().eq('ma_nv', id);
    if (!error) fetchData();
  };

  const deleteMarketing = async (id) => {
    const { error } = await supabase.from('marketing_campaigns').delete().eq('ma_chien_dich', id);
    if (!error) fetchData();
  };

  const deleteFinancial = async (id) => {
    const { error } = await supabase.from('financial_records').delete().eq('ma_tc', id);
    if (!error) fetchData();
  };

  return (
    <DataContext.Provider value={{
      globalFilter, setGlobalFilter,
      leads: allLeads,
      transactions: allTransactions,
      marketing: allMarketing,
      financials: allFinancials,
      sales,
      staff,
      loadingData,
      currentUser,
      leadsPage, setLeadsPage, leadsTotal, leadsSearch, setLeadsSearch, leadsSort, setLeadsSort,
      transactionsPage, setTransactionsPage, transactionsTotal, transSearch, setTransSearch, transSort, setTransSort,
      dashboardStats, itemsPerPage,
      addLead, editLead, deleteLead, addMultipleLeads, updateLeads,
      addTransaction, editTransaction, deleteTransaction,
      addMarketing, editMarketing, deleteMarketing,
      addFinancial, editFinancial, deleteFinancial,
      addStaff, editStaff, deleteStaff,
      refreshData: () => fetchData()
    }}>
      {children}
    </DataContext.Provider>
  );
};
