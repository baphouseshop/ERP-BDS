import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

/**
 * Utility to generate and download Excel templates for CRM modules.
 */

const templates = {
  leads: {
    filename: 'mau_nhap_leads.xlsx',
    data: [
      ['Mã Lead', 'Ngày nhận', 'Họ tên', 'Số điện thoại', 'Nguồn', 'Nhu cầu', 'Trạng thái', 'Mã NV phụ trách', 'Tên sàn', 'Ghi chú'],
      ['LEAD001', '2026-05-01', 'Nguyễn Văn A', '0912345678', 'Facebook Ads', 'Mua chung cư 2PN', 'MỚI TIẾP NHẬN', 'EMP001', 'Nội bộ', 'Khách quan tâm căn tầng cao']
    ]
  },
  transactions: {
    filename: 'mau_nhap_giao_dich.xlsx',
    data: [
      ['Mã Giao Dịch', 'Ngày Giao Dịch', 'Mã Khách Hàng', 'Mã Nhân Viên', 'Mã Sản Phẩm', 'Phân khu', 'Giá trị (VNĐ)', 'Tiền cọc (VNĐ)', 'Hoa hồng (VNĐ)', 'Trạng thái', 'Ghi chú'],
      ['GD001', '2026-05-08', 'LEAD001', 'EMP001', 'VIN-123', 'The South', '5500000000', '200000000', '100000000', 'Đã đặt cọc', 'Cọc thiện chí']
    ]
  },
  staff: {
    filename: 'mau_nhap_nhan_su.xlsx',
    data: [
      ['Mã NV', 'Họ tên', 'Email', 'Số điện thoại', 'Phòng ban', 'Chức vụ', 'Ngày vào làm', 'Trạng thái', 'Lương cơ bản', 'Mã quản lý', 'Quyền'],
      ['EMP001', 'Nguyễn Văn B', 'nguyenvanb@gmail.com', '0987654321', 'Kinh doanh', 'Sales', '2026-01-01', 'Đang làm việc', '15000000', 'ADMIN01', 'Sales']
    ]
  },
  financials: {
    filename: 'mau_nhap_tai_chinh.xlsx',
    data: [
      ['Mã TC', 'Tháng (YYYY-MM)', 'Hạng mục', 'Loại (Thu/Chi)', 'Thực tế (Tỷ)', 'Kế hoạch (Tỷ)', 'Ghi chú', 'Mã người duyệt'],
      ['TC001', '2026-05', 'Chi phí văn phòng', 'Chi phí', '10.5', '12', 'Tiền thuê tháng 5', 'ADMIN01']
    ]
  },
  marketing: {
    filename: 'mau_nhap_marketing.xlsx',
    data: [
      ['Mã chiến dịch', 'Tháng (YYYY-MM)', 'Kênh', 'Tên chiến dịch', 'Chi phí (Tr)', 'Số Lead', 'Số Booking', 'Lượt Click', 'Ghi chú'],
      ['MKT001', '2026-05', 'Facebook Ads', 'Chiến dịch Mùa Hè', '50.5', '100', '10', '2500', 'Chạy quảng cáo dự án South']
    ]
  }
};

export const downloadTemplate = (moduleName) => {
  const template = templates[moduleName];
  if (!template) {
    toast.error(`Không tìm thấy mẫu cho: ${moduleName}`);
    return;
  }

  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(template.data);
    
    const wscols = template.data[0].map(h => ({ wch: h.length + 10 }));
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, template.filename);
  } catch (error) {
    toast.error("Lỗi tạo file mẫu: " + error.message);
  }
};

