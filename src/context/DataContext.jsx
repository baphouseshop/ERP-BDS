import React, { createContext, useState, useContext, useEffect } from 'react';
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

  const [globalFilter, setGlobalFilter] = useState('all'); // Changed from month:04/2026 to 'all' so new data isn't hidden

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch data including employees to map names
        const [leadsRes, transRes, mktRes, finRes, empRes] = await Promise.all([
          supabase.from('leads').select('*'),
          supabase.from('transactions').select('*'),
          supabase.from('marketing_campaigns').select('*'),
          supabase.from('financial_records').select('*'),
          supabase.from('employees').select('*')
        ]);

        const employees = empRes.data || [];
        const campaigns = mktRes.data || [];

        // Helper to find employee name (using new Vietnamese column names)
        const getEmpName = (id) => {
          if (!id) return "";
          const emp = employees.find(e => e.ma_nv == id);
          return emp ? emp.ho_ten : id;
        };

        // Helper to find campaign name
        const getCampaignName = (id) => {
          if (!id) return "";
          const camp = campaigns.find(c => c.ma_chien_dich == id);
          return camp ? camp.ten_chien_dich : id;
        };

        // Helper to find lead/customer name
        const leadsData = leadsRes.data || [];
        const getLeadName = (id) => {
          if (!id) return "";
          const lead = leadsData.find(l => l.ma_lead == id);
          return lead ? lead.ho_ten : id;
        };

        if (leadsRes.data) {
          setLeads(leadsRes.data.map(dbLead => ({
            "Mã lead": dbLead.ma_lead || "CHƯA CÓ",
            "Ngày nhận": dbLead.ngay_nhan,
            "Họ tên": dbLead.ho_ten,
            "SĐT (đầy đủ)": dbLead.sdt,
            "SĐT (ẩn)": dbLead.sdt ? dbLead.sdt.substring(0, dbLead.sdt.length - 3) + "***" : "",
            "Nguồn": dbLead.nguon || "Khác",
            "Chiến dịch": getCampaignName(dbLead.chien_dich_id),
            "_campaign_id": dbLead.chien_dich_id,
            "Nhu cầu": dbLead.nhu_cau,
            "Trạng thái": dbLead.trang_thai,
            "Sales phụ trách": getEmpName(dbLead.nhan_vien_id),
            "Mã NV": dbLead.nhan_vien_id,
            "_employee_id": dbLead.nhan_vien_id || null, // Internal: used for RBAC filtering
            "Tên sàn": dbLead.ten_san || "Nội bộ",
            "Ngày hẹn": dbLead.ngay_hen,
            "Ngày FU": dbLead.ngay_fu,
            "Ghi chú": dbLead.ghi_chu,
            "_created_at": dbLead.created_at
          })));
        }

        if (transRes.data) {
          setTransactions(transRes.data.map(dbTrans => ({
            "Mã GD": dbTrans.ma_gd,
            "Ngày GD": dbTrans.ngay_gd,
            "Mã SP": dbTrans.ma_sp,
            "Phân khu": dbTrans.phan_khu,
            "Giá (VNĐ)": dbTrans.gia,
            "Tiền cọc": dbTrans.tien_coc,
            "Hoa hồng": dbTrans.hoa_hong,
            "Trạng thái": dbTrans.trang_thai,
            "Ghi chú": dbTrans.ghi_chu,
            "Sales": getEmpName(dbTrans.nhan_vien_id),
            "Mã nhân viên": dbTrans.nhan_vien_id,
            "Khách hàng": getLeadName(dbTrans.khach_hang_id),
            "Mã Lead": dbTrans.khach_hang_id,
            "_created_at": dbTrans.created_at
          })));
        }

        if (mktRes.data) {
          setMarketing(mktRes.data.map(dbMkt => ({
            "Tháng": dbMkt.thang,
            "Kênh": dbMkt.kenh,
            "Tên chiến dịch": dbMkt.ten_chien_dich,
            "CP (tr)": dbMkt.chi_phi ? (dbMkt.chi_phi / 1000000).toFixed(1) : 0,
            "Lead": dbMkt.so_lead,
            "Booking": dbMkt.so_booking,
            "Tỷ lệ CĐ": dbMkt.ty_le_chuyen_doi,
            "CPL (tr)": dbMkt.chi_phi_moi_lead ? (dbMkt.chi_phi_moi_lead / 1000000).toFixed(1) : 0,
            "CP/Book (tr)": dbMkt.chi_phi_moi_booking ? (dbMkt.chi_phi_moi_booking / 1000000).toFixed(1) : 0,
            "Click": dbMkt.luot_click,
            "Ghi chú": dbMkt.ghi_chu,
            "_id": dbMkt.ma_chien_dich,
            "_created_at": dbMkt.created_at
          })));
        }

        if (finRes.data) {
          setFinancials(finRes.data.map(dbFin => ({
            "Tháng": dbFin.thang,
            "Hạng mục": dbFin.hang_muc,
            "Loại": dbFin.loai,
            "Thực tế (tỷ)": dbFin.thuc_te ? (dbFin.thuc_te / 1000000000).toFixed(2) : 0,
            "KH (tỷ)": dbFin.ke_hoach ? (dbFin.ke_hoach / 1000000000).toFixed(2) : 0,
            "% Hoàn thành": dbFin.ty_le_hoan_thanh,
            "Chênh lệch": dbFin.chenh_lech ? (dbFin.chenh_lech / 1000000000).toFixed(2) : 0,
            "Ghi chú": dbFin.ghi_chu,
            "Người duyệt": getEmpName(dbFin.nguoi_duyet_id),
            "_approver_id": dbFin.nguoi_duyet_id,
            "_id": dbFin.ma_tc,
            "_created_at": dbFin.created_at
          })));
        }

        // Map and set staff from employees
        if (empRes.data) {
          setStaff(empRes.data.map(emp => ({
            "Mã NV": emp.ma_nv,
            "Tên NV": emp.ho_ten,
            "Sàn": emp.phong_ban,
            "Chức vụ": emp.chuc_vu || "",
            "SĐT": emp.sdt ? (String(emp.sdt).startsWith('0') ? String(emp.sdt) : '0' + String(emp.sdt)) : "",
            "Email": emp.email || "",
            "Ngày vào làm": emp.ngay_vao_lam || "",
            "Trạng thái": emp.trang_thai || "Active",
            "Lương (VNĐ)": emp.luong || 0,
            "Quản lý (Mã NV)": emp.quan_ly_id || "",
            "_created_at": emp.created_at
          })));

          // Dynamically calculate sales from employees
          const salesData = empRes.data.map(emp => {
            const initialSale = initialDb.sales.find(s => s["Tên NV"] === emp.ho_ten) || {};
            const kpi = initialSale["KH DS (tỷ)"] || 10; // Default 10 tỷ
            const empTrans = transRes.data ? transRes.data.filter(t => t.nhan_vien_id === emp.ma_nv) : [];
            const totalSales = empTrans.reduce((sum, t) => sum + Number(t.gia || 0), 0) / 1000000000;
            const pctKPI = kpi > 0 ? (totalSales / kpi) : 0;
            let rating = 'Kém';
            if (pctKPI >= 1) rating = 'Xuất sắc';
            else if (pctKPI >= 0.8) rating = 'Tốt';

            return {
              "Mã NV": emp.ma_nv,
              "Tên NV": emp.ho_ten,
              "Sàn": emp.phong_ban,
              "KH DS (tỷ)": kpi,
              "Doanh số (tỷ)": totalSales.toFixed(2),
              "DS thực (tỷ)": totalSales.toFixed(2),
              "% KPI": pctKPI,
              "XẾP LOẠI KPI": rating,
              "Lương cứng (tr)": initialSale["Lương cứng (tr)"] || 5,
              "Gọi điện": initialSale["Gọi điện"] || Math.floor(Math.random() * 50),
              "Site Visit": initialSale["Site Visit"] || 0,
              "KH Site Visit": initialSale["KH Site Visit"] || 5,
              "HĐMB THỰC TẾ": initialSale["HĐMB THỰC TẾ"] || 0,
              "KH HĐMB": initialSale["KH HĐMB"] || 1,
              "CỌC": initialSale["CỌC"] || 0,
              "KH CỌC": initialSale["KH CỌC"] || 2
            };
          }).filter(s => s["Doanh số (tỷ)"] > 0 || s["Sàn"] === 'Sales' || s["Sàn"] === 'Operations');
          
          setSales(salesData);
        }
      } catch (error) {
        console.error("Error fetching data from Supabase:", error);
      }

      // Determine current user and role
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user && empRes?.data) {
          const userEmail = session.user.email;
          const userEmp = empRes.data.find(emp => emp.email === userEmail);
          
          let role = 'Admin';
          if (userEmp) {
             const dept = userEmp.phong_ban || '';
             if (dept.includes('BOD') || dept.includes('Admin')) role = 'Admin';
             else if (dept.includes('Sales') || dept.includes('Sàn')) role = 'Sales';
             else if (dept.includes('Marketing')) role = 'Marketing';
             else if (dept.includes('Kế toán') || dept.includes('Finance')) role = 'Kế toán';
             else if (dept.includes('HR') || dept.includes('Nhân sự')) role = 'HR';
             else role = dept || 'User';
          }
          
          setCurrentUser({ ...(userEmp || {}), id: userEmp?.ma_nv, email: userEmail, role });
        } else {
          setCurrentUser({ role: 'Admin' }); // Default role for local testing or unrecognized users
        }
      } catch (error) {
        console.error("Error setting current user:", error);
        setCurrentUser({ role: 'Admin' });
      }

      setLoadingData(false);
    };

    // First check if session exists right now
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchData();
      } else {
        setLoadingData(false);
      }
    });

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchData();
      } else {
        // Clear data on logout
        setLeads([]);
        setTransactions([]);
        setMarketing([]);
        setFinancials([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- MUTATION FUNCTIONS (Supabase Sync) ---

  const addLead = async (newLead) => {
    const dbLead = {
      ma_lead: newLead["Mã lead"],
      ngay_nhan: newLead["Ngày nhận"] || null,
      ho_ten: newLead["Họ tên"],
      sdt: newLead["SĐT (đầy đủ)"],
      nguon: newLead["Nguồn"],
      chien_dich_id: newLead["_campaign_id"] || null, // Map from campaign name if needed
      nhu_cau: newLead["Nhu cầu"],
      trang_thai: newLead["Trạng thái"],
      nhan_vien_id: newLead["Mã NV"] || null,
      ten_san: newLead["Tên sàn"],
      ngay_hen: newLead["Ngày hẹn"] || null,
      ngay_fu: newLead["Ngày FU"] || null,
      ghi_chu: newLead["Ghi chú"]
    };

    if (currentUser?.name) {
      await supabase.rpc('set_current_user_name', { user_name: currentUser.name });
    }

    const { error } = await supabase.from('leads').insert([dbLead]);
    if (!error) {
      setLeads(prev => [newLead, ...prev]);
    } else {
      console.error("Error adding lead:", error);
      alert("Lỗi khi thêm Lead: " + error.message);
    }
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

    if (currentUser?.name) {
      await supabase.rpc('set_current_user_name', { user_name: currentUser.name });
    }

    const { error } = await supabase.from('leads').update(dbLead).eq('ma_lead', updatedLead["Mã lead"]);
    if (!error) {
      setLeads(prev => prev.map(l => 
        l['Mã lead'] === updatedLead['Mã lead'] ? updatedLead : l
      ));
    } else {
      console.error("Error editing lead:", error);
      alert("Lỗi khi cập nhật Lead: " + error.message);
    }
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
    if (!error) {
      setLeads(prevLeads => {
        let updatedLeads = [...prevLeads];
        newLeadsArray.forEach(newLead => {
          const existingIndex = updatedLeads.findIndex(l => l['Mã lead'] === newLead['Mã lead']);
          if (existingIndex !== -1) {
            updatedLeads[existingIndex] = newLead;
          } else {
            updatedLeads.unshift(newLead);
          }
        });
        return updatedLeads;
      });
    } else {
      console.error("Error batch adding leads:", error);
      alert("Lỗi khi nhập dữ liệu Lead: " + error.message);
    }
  };

  const updateLeads = async (updatedLeadsArray) => {
    // This is used for "Distribute Leads" which updates multiple records
    const dbLeads = updatedLeadsArray.map(l => ({
      ma_lead: l["Mã lead"],
      nhan_vien_id: l["_employee_id"] || l["Mã NV"], // Use internal ID if available
      trang_thai: l["Trạng thái"],
      ghi_chu: l["Ghi chú"]
    }));

    const { error } = await supabase.from('leads').upsert(dbLeads);
    if (!error) {
      setLeads(updatedLeadsArray);
    } else {
      console.error("Error updating leads:", error);
      alert("Lỗi khi cập nhật danh sách Lead: " + error.message);
    }
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

    if (currentUser?.name) {
      await supabase.rpc('set_current_user_name', { user_name: currentUser.name });
    }

    const { error } = await supabase.from('transactions').insert([dbTrans]);
    if (!error) {
      setTransactions(prev => [newTransaction, ...prev]);
    } else {
      console.error("Error adding transaction:", error);
      alert("Lỗi khi thêm giao dịch: " + error.message);
    }
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

    if (currentUser?.name) {
      await supabase.rpc('set_current_user_name', { user_name: currentUser.name });
    }

    const { error } = await supabase.from('transactions').update(dbTrans).eq('ma_gd', updatedTransaction["Mã GD"]);
    if (!error) {
      setTransactions(prev => prev.map(t => 
        t['Mã GD'] === updatedTransaction['Mã GD'] ? updatedTransaction : t
      ));
    } else {
      console.error("Error editing transaction:", error);
      alert("Lỗi khi cập nhật giao dịch: " + error.message);
    }
  };

  const addMarketing = async (newMarketing) => {
    const dbMkt = {
      ma_chien_dich: newMarketing["Tên chiến dịch"], // Assuming name is ID if no ID provided
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

    if (currentUser?.name) {
      await supabase.rpc('set_current_user_name', { user_name: currentUser.name });
    }

    const { error } = await supabase.from('marketing_campaigns').insert([dbMkt]);
    if (!error) {
      setMarketing(prev => [newMarketing, ...prev]);
    } else {
      console.error("Error adding marketing:", error);
    }
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

    if (currentUser?.name) {
      await supabase.rpc('set_current_user_name', { user_name: currentUser.name });
    }

    const { error } = await supabase.from('marketing_campaigns').update(dbMkt).eq('ma_chien_dich', updatedMarketing["_id"] || updatedMarketing["Tên chiến dịch"]);
    if (!error) {
      setMarketing(prev => prev.map(m => 
        m['_id'] === updatedMarketing['_id'] ? updatedMarketing : m
      ));
    } else {
      console.error("Error editing marketing:", error);
      alert("Lỗi khi cập nhật chiến dịch: " + error.message);
    }
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

    if (currentUser?.name) {
      await supabase.rpc('set_current_user_name', { user_name: currentUser.name });
    }

    const { error } = await supabase.from('financial_records').insert([dbFin]);
    if (!error) {
      setFinancials(prev => [newFinancial, ...prev]);
    } else {
      console.error("Error adding financial:", error);
    }
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

    if (currentUser?.name) {
      await supabase.rpc('set_current_user_name', { user_name: currentUser.name });
    }

    const { error } = await supabase.from('financial_records').update(dbFin).eq('ma_tc', updatedFinancial["_id"] || "");
    
    if (!error) {
      setFinancials(prev => prev.map(f => 
        f['_id'] === updatedFinancial['_id'] ? updatedFinancial : f
      ));
    } else {
      console.error("Error editing financial:", error);
      alert("Lỗi khi cập nhật tài chính: " + error.message);
    }
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

    if (currentUser?.name) {
      await supabase.rpc('set_current_user_name', { user_name: currentUser.name });
    }

    const { error } = await supabase.from('employees').insert([dbStaff]);
    if (!error) {
      setStaff(prev => [newStaff, ...prev]);
    } else {
      console.error("Error adding staff:", error);
      alert("Lỗi khi thêm nhân viên: " + error.message);
    }
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

    if (currentUser?.name) {
      await supabase.rpc('set_current_user_name', { user_name: currentUser.name });
    }

    const { error } = await supabase.from('employees').update(dbStaff).eq('ma_nv', updatedStaff["Mã NV"]);
    if (!error) {
      setStaff(prev => prev.map(s => 
        s['Mã NV'] === updatedStaff['Mã NV'] ? updatedStaff : s
      ));
    } else {
      console.error("Error editing staff:", error);
      alert("Lỗi khi cập nhật nhân viên: " + error.message);
    }
  };

  const deleteLead = async (id) => {
    if (currentUser?.name) {
      await supabase.rpc('set_current_user_name', { user_name: currentUser.name });
    }

    const { error } = await supabase.from('leads').delete().eq('ma_lead', id);
    if (!error) {
      setLeads(prev => prev.filter(l => l['Mã lead'] !== id));
    } else {
      console.error("Error deleting lead:", error);
      alert("Lỗi khi xóa Lead: " + error.message);
    }
  };

  const deleteTransaction = async (id) => {
    if (currentUser?.name) {
      await supabase.rpc('set_current_user_name', { user_name: currentUser.name });
    }

    const { error } = await supabase.from('transactions').delete().eq('ma_gd', id);
    if (!error) {
      setTransactions(prev => prev.filter(t => t['Mã GD'] !== id));
    } else {
      console.error("Error deleting transaction:", error);
      alert("Lỗi khi xóa giao dịch: " + error.message);
    }
  };

  const deleteStaff = async (id) => {
    if (currentUser?.name) {
      await supabase.rpc('set_current_user_name', { user_name: currentUser.name });
    }

    const { error } = await supabase.from('employees').delete().eq('ma_nv', id);
    if (!error) {
      setStaff(prev => prev.filter(s => s['Mã NV'] !== id));
    } else {
      console.error("Error deleting staff:", error);
      alert("Lỗi khi xóa nhân viên: " + error.message);
    }
  };

  const deleteMarketing = async (id) => {
    const { error } = await supabase.from('marketing_campaigns').delete().eq('ma_chien_dich', id);
    if (!error) {
      setMarketing(prev => prev.filter(m => m['_id'] !== id));
    } else {
      console.error("Error deleting marketing:", error);
    }
  };

  const deleteFinancial = async (id) => {
    const { error } = await supabase.from('financial_records').delete().eq('ma_tc', id);
    if (!error) {
      setFinancials(prev => prev.filter(f => f['_id'] !== id));
    } else {
      console.error("Error deleting financial:", error);
    }
  };

  // --- FILTERING LOGIC ---
  const parseDate = (item, type) => {
    let dateStr = null;
    if (type === 'lead') {
      dateStr = item['Ngày nhận'];
      if (!dateStr) return null;
      return new Date(dateStr);
    } else if (type === 'transaction') {
      dateStr = item['Ngày GD'];
      if (!dateStr) return null;
      if (dateStr.includes('/')) {
         const parts = dateStr.split('/');
         if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
      }
      return new Date(dateStr);
    } else if (type === 'marketing' || type === 'financial') {
      dateStr = item['Tháng'];
      if (!dateStr) return null;
      if (dateStr.includes('/')) {
         const parts = dateStr.split('/');
         if (parts.length === 2) return new Date(parts[1], parts[0] - 1, 1);
      }
      return new Date(dateStr);
    }
    return null;
  };

  const checkFilter = (item, type) => {
    if (globalFilter === 'all') return true;
    
    const d = parseDate(item, type);
    if (!d || isNaN(d)) return true; // Include items without valid dates

    const day = d.getDate();
    const m = d.getMonth() + 1; // 1-12
    const y = d.getFullYear();
    const q = Math.ceil(m / 3); // 1-4

    const [fType, fValue] = globalFilter.split(':');
    
    if (fType === 'day') {
       const [fd, fm, fy] = fValue.split('/');
       if (type === 'marketing' || type === 'financial') {
         // Marketing & Financials only have month data, so match the month
         return m === Number(fm) && y === Number(fy);
       }
       return day === Number(fd) && m === Number(fm) && y === Number(fy);
    } else if (fType === 'month') {
       const [fm, fy] = fValue.split('/');
       return m === Number(fm) && y === Number(fy);
    } else if (fType === 'quarter') {
       const fq = Number(fValue.charAt(1));
       const fy = Number(fValue.split('/')[1]);
       return q === fq && y === fy;
    } else if (fType === 'year') {
       return y === Number(fValue);
    }
    return true;
  };

  const leads = allLeads.filter(l => {
    if (!checkFilter(l, 'lead')) return false;
    if (currentUser?.role === 'Sales' && currentUser?.id) {
      return l['_employee_id'] === currentUser.id;
    }
    return true;
  });
  
  const transactions = allTransactions.filter(t => {
    if (!checkFilter(t, 'transaction')) return false;
    if (currentUser?.role === 'Sales' && currentUser?.id) {
      return t['Mã nhân viên'] === currentUser.id;
    }
    return true;
  });
  const marketing = allMarketing.filter(m => checkFilter(m, 'marketing'));
  const financials = allFinancials.filter(f => checkFilter(f, 'financial'));

  return (
    <DataContext.Provider value={{
      globalFilter, setGlobalFilter,
      leads, addLead, editLead, deleteLead, addMultipleLeads, updateLeads,
      transactions, addTransaction, editTransaction, deleteTransaction,
      marketing, addMarketing, editMarketing, deleteMarketing,
      financials, addFinancial, editFinancial, deleteFinancial,
      sales,
      staff, addStaff, editStaff, deleteStaff,
      loadingData,
      currentUser
    }}>
      {children}
    </DataContext.Provider>
  );
};
