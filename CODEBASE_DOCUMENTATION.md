# Blanca CRM - Tài liệu Hướng dẫn Codebase

Tài liệu này cung cấp cái nhìn tổng quan về cấu trúc thư mục, luồng dữ liệu và các thành phần chính của hệ thống Blanca CRM. Mục tiêu là giúp các nhà phát triển dễ dàng bảo trì, sửa lỗi và mở rộng hệ thống trong tương lai.

## 1. Công nghệ sử dụng (Tech Stack)
*   **Frontend**: React (Vite)
*   **Ngôn ngữ**: Javascript (JSX)
*   **Styling**: Vanilla CSS (Hệ thống biến CSS tùy chỉnh)
*   **Backend & Database**: Supabase (PostgreSQL)
*   **Xử lý dữ liệu**: Python (Dùng cho các script seeding và làm sạch dữ liệu ban đầu)

---

## 2. Cấu trúc thư mục (Folder Structure)

### `/src` - Mã nguồn chính của ứng dụng
*   `main.jsx`: Điểm vào (entry point) của React, khởi tạo ứng dụng.
*   `App.jsx`: Cấu hình Router (định tuyến), thanh điều hướng TopBar và kiểm tra quyền truy cập (Role-Based Access Control).
*   `index.css`: Toàn bộ hệ thống thiết kế (Design System). Chứa các biến màu sắc (Neon Palette), font chữ và các class CSS dùng chung.
*   `supabaseClient.js`: Cấu hình kết nối với Supabase (URL và Anon Key).

#### `/src/context` - Quản lý trạng thái và Dữ liệu
*   **`DataContext.jsx`**: Đây là **"Trái tim"** của ứng dụng.
    *   Sử dụng React Context để chia sẻ dữ liệu toàn cục.
    *   Chứa toàn bộ logic CRUD (Thêm, Sửa, Xóa) và đồng bộ với Supabase.
    *   Hàm `checkFilter`: Xử lý việc lọc dữ liệu theo thời gian (Ngày, Tháng, Quý, Năm) và theo quyền hạn của nhân viên đang đăng nhập.

#### `/src/pages` - Các trang giao diện
*   `Dashboard.jsx`: Hiển thị KPI tổng quát, biểu đồ doanh thu và các cảnh báo thông minh.
*   `Financials.jsx`: Quản lý tài chính, thu chi, so sánh Thực tế vs Kế hoạch.
*   `Leads.jsx`: Quản lý danh sách khách hàng tiềm năng, trạng thái chăm sóc.
*   `Transactions.jsx`: Quản lý các giao dịch bất động sản, hợp đồng.
*   `Marketing.jsx`: Quản lý các chiến dịch quảng cáo, tính toán chi phí CPL.
*   `Staff.jsx`: Quản lý danh sách nhân sự và phân quyền.
*   `Sales.jsx`: Dashboard riêng dành cho đội ngũ kinh doanh (Bảng xếp hạng, KPI cá nhân).
*   `Login.jsx`: Giao diện đăng nhập tích hợp Supabase Auth.
*   `Settings.jsx`: Cấu hình hệ thống (Vai trò, thông tin công ty).

#### `/src/data`
*   `db.json`: File dữ liệu mẫu (dùng cho mục đích offline hoặc testing). Hiện tại ứng dụng ưu tiên dùng Supabase.

---

### `/sample_data` - Dữ liệu mẫu (Dạng CSV)
Chứa các file CSV (`leads.csv`, `transactions.csv`, v.v.) được sử dụng để nạp dữ liệu ban đầu vào database thông qua các script Python.

### Scripts (Thư mục gốc) - Công cụ hỗ trợ
*   `generate_relational_sql.py`: Tự động tạo câu lệnh SQL từ file Excel để nạp vào Supabase.
*   `clean_data.py`: Làm sạch và định dạng lại dữ liệu thô.
*   `run_mcp.cjs`: Script chạy MCP server để tương tác với Supabase qua dòng lệnh.

---

## 3. Luồng dữ liệu (Data Flow)

1.  **Khởi tạo**: Khi người dùng vào app, `App.jsx` kiểm tra Session của Supabase Auth.
2.  **Tải dữ liệu**: `DataContext` thực hiện `fetchData` từ các bảng Supabase. Toàn bộ tên cột trong Database đã được Việt hóa (VD: `Mã NV`, `Hạng mục`).
3.  **Lọc dữ liệu**: Dữ liệu sau khi tải về sẽ đi qua hàm `checkFilter` dựa trên bộ lọc thời gian toàn cục tại `TopBar`.
4.  **Cập nhật (Mutation)**: Khi người dùng thực hiện Thêm/Sửa/Xóa:
    *   Gửi yêu cầu lên Supabase qua API.
    *   Nếu thành công, cập nhật lại State của React để UI thay đổi ngay lập tức mà không cần tải lại trang.

---

## 4. Hướng dẫn Mở rộng (Scalability)

### Thêm một mô-đun mới:
1.  Tạo bảng mới trên Supabase với các cột tiếng Việt.
2.  Cập nhật `DataContext.jsx`:
    *   Thêm biến state mới.
    *   Bổ sung hàm `fetch` trong `fetchData`.
    *   Viết các hàm mutation (Thêm/Sửa/Xóa) tương ứng.
3.  Tạo file trang mới trong `/src/pages`.
4.  Đăng ký Route và Phân quyền trong `App.jsx`.

### Thay đổi giao diện:
*   Hầu hết các thay đổi về màu sắc, bo góc, font chữ nên được thực hiện tại `:root` trong `index.css` để đảm bảo tính nhất quán.

---

## 5. Lưu ý quan trọng
*   **Bảo mật**: Không bao giờ commit file `.env` lên GitHub (đã được cấu hình trong `.gitignore`).
*   **Đồng bộ**: Khi thay đổi cấu trúc bảng trên Supabase, hãy cập nhật tương ứng các hàm `insert` và `update` trong `DataContext`.
*   **Font chữ**: Hệ thống đang sử dụng font 'Outfit' từ Google Fonts (được nạp trong `index.html`).

---

## 6. Quy tắc làm việc (Rules of Engagement)

Đây là các quy tắc bắt buộc khi thực hiện cập nhật hoặc bảo trì hệ thống:

1.  **Ổn định Giao diện (UI Stability)**:
    *   **KHÔNG** tự ý thay đổi giao diện (màu sắc, bố cục, font chữ, hiệu ứng) của ứng dụng.
    *   Mọi cập nhật chỉ tập trung vào việc sửa lỗi (bug fixes) hoặc tối ưu hóa logic xử lý bên trong.
    *   Giữ nguyên hệ thống "Cyber-Nexus" hiện tại trừ khi có yêu cầu cụ thể.
2.  **Quy trình phê duyệt**:
    *   Nếu cần thay đổi bất kỳ thành phần nào của giao diện, **PHẢI** hỏi ý kiến và được sự cho phép của người dùng trước khi thực hiện.
3.  **Deployment**:
    *   Dự án hiện đã được kết nối với GitHub tại: `https://github.com/baphouseshop/ERP-B-S.git`.
    *   Mọi thay đổi quan trọng nên được commit và push để đồng bộ với môi trường Production trên Vercel.

---
*Cập nhật lần cuối bởi Antigravity Agent - 08/05/2026*
