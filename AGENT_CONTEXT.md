# Bối cảnh Dự án (Agent Context): CRM

> **Cập nhật lần cuối**: 2026-05-09 16:05
> **Tự động tạo**: Được tạo bởi `prepare_context.py` để giúp AI Agent nhanh chóng nắm bắt toàn bộ dự án

---

## 🎯 1. Mục tiêu Dự án (Project Goal)
* **Mục đích cốt lõi**: Quản lý khách hàng, giao dịch và hiệu suất nhân sự cho Blanca BĐS với giao diện hiện đại, dữ liệu thời gian thực và tích hợp AI.
* _Xem chi tiết tại [README.md](README.md)_

## 🛠️ 2. Công nghệ & Môi trường (Tech Stack & Environment)
* **Các gói lõi**: @supabase/supabase-js, lucide-react, react, react-dom, react-hot-toast, react-router-dom, recharts, xlsx
* **Các gói phát triển**: @eslint/js, @types/react, @types/react-dom, @vitejs/plugin-react, eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals
* **Các lệnh khả dụng**: dev, build, lint, preview

### Các tệp cấu hình gốc

<details><summary>package.json</summary>

```json
{
  "name": "temp_app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.105.3",
    "lucide-react": "^1.14.0",
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "react-hot-toast": "^2.6.0",
    "react-router-dom": "^7.14.2",
    "recharts": "^3.8.1",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.2.1",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.5.0",
    "vite": "^8.0.10",
    "vite-plugin-singlefile": "^2.3.3"
  }
}

```
</details>

## 📂 3. Cấu trúc Thư mục Lõi (Core Structure)
```text
CRM/
├── AGENT_CONTEXT.md
├── src
│   ├── App.jsx
│   ├── components
│   │   ├── VisualLanguage.jsx (NEW: Hệ thống UI chuẩn Cyber-Nexus)
│   │   ├── NotificationBell.jsx
│   │   └── ...
│   ├── context
│   │   └── DataContext.jsx
│   ├── index.css (Updated: Design Tokens mới)
│   └── pages
│       ├── Dashboard.jsx (Modernized)
│       ├── Leads.jsx (Modernized)
│       ├── Sales.jsx (Modernized)
│       ├── Marketing.jsx (Modernized)
│       ├── Financials.jsx (Modernized)
│       ├── Staff.jsx (Modernized)
│       ├── Transactions.jsx (Modernized)
│       └── Automation.jsx (Legacy UI - Giữ nguyên)
```

## 🏛️ 4. Kiến trúc & Quy ước Thiết kế (Architecture & Conventions)
* **Design System**: Sử dụng `VisualLanguage.jsx` cho mọi component hiển thị (KpiCard, BarChart, DonutChart).
* **Cyber-Nexus Style**: KPI cards có 2px accent line ở top, uppercase labels, typography 'Outfit'.
* **Analytics**: Dùng SVG thuần cho biểu đồ thay vì thư viện Recharts để tăng tính nhất quán và hiệu năng.

## 🚦 5. Tiến độ Hiện tại & Việc cần làm (Current Status & TODO)
* **Tiến độ**: 
    - **Visual Overhaul (Cyber-Nexus)**: Đã hiện đại hóa toàn bộ giao diện các module lõi (Dashboard, Marketing, Sales, Leads, Financials, Staff, Transactions).
    - **Standardized UI**: Triển khai `VisualLanguage` components giúp giao diện đồng bộ 100% về màu sắc, hiệu ứng và phân cấp thông tin.
    - **Navigation Refresh**: Topbar và Navbar được tinh chỉnh gọn gàng, underline active tabs, filter pill và notification badges mới.
    - **Bảo mật & Ổn định AI**: Duy trì bod-assistant trên Supabase Edge Function.
    - **Deployment**: Đã đẩy mã nguồn lên GitHub và triển khai tự động qua Vercel.
* **Việc cần làm**:
    - **Mobile/Responsive Audit**: Kiểm tra hiển thị trên các thiết bị di động sau khi refactor UI.
    - **Automation Modernization**: Nghiên cứu kế hoạch nâng cấp giao diện module Automation đồng bộ với hệ thống Cyber-Nexus (khi có yêu cầu).
    - **Audit Log Viewer**: Tích hợp giao diện xem Log cho Admin.
    - **Auto-Reports**: AI tự động gửi báo cáo KPI hàng ngày qua Telegram/Zalo.
