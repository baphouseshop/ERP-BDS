# Bối cảnh Dự án (Agent Context): CRM

> **Cập nhật lần cuối**: 2026-05-09 09:03
> **Tự động tạo**: Được tạo bởi `prepare_context.py` để giúp AI Agent nhanh chóng nắm bắt toàn bộ dự án

---

## 🎯 1. Mục tiêu Dự án (Project Goal)
* **Mục đích cốt lõi**: Template này cung cấp một thiết lập tối giản để React hoạt động trong Vite với HMR (Hot Module Replacement) và một số quy tắc ESLint.
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
_(💡 Quy tắc cho AI: Vui lòng dựa vào cấu trúc này để tìm tệp tương ứng, không tự ý đoán đường dẫn)_
```text
CRM/
├── AGENT_CONTEXT.md
├── Blanca_CRM.html
├── Blanca_CRM_Mobile_Fixed.html
├── Blanca_CRM_Offline.html
├── CODEBASE_DOCUMENTATION.md
├── FILE_1_MASTER.xlsx
├── README.md
├── clean_data.py
├── data.json
├── eslint.config.js
├── generate_relational_sql.py
├── generate_sql.py
├── index.html
├── package-lock.json
├── package.json
├── read_excel.py
├── run_mcp.cjs
├── run_sql.py
├── sample_data
│   ├── employees.csv
│   ├── financial_records.csv
│   ├── leads.csv
│   ├── marketing_campaigns.csv
│   └── transactions.csv
├── seed.sql
├── src
│   ├── App.jsx
│   ├── components
│   │   └── ErrorBoundary.jsx
│   ├── context
│   │   └── DataContext.jsx
│   ├── data
│   │   └── db.json
│   ├── index.css
│   ├── main.jsx
│   ├── pages
│   │   ├── Dashboard.jsx
│   │   ├── Financials.jsx
│   │   ├── Leads.jsx
│   │   ├── Login.jsx
│   │   ├── Logs.jsx
│   │   ├── Marketing.jsx
│   │   ├── Sales.jsx
│   │   ├── Settings.jsx
│   │   ├── Staff.jsx
│   │   └── Transactions.jsx
│   └── supabaseClient.js
├── supabase
│   └── migrations
│       ├── 20260508_add_performance_indexes.sql
│       ├── 20260508_auto_create_profiles.sql
│       ├── 20260508_create_kpi_targets.sql
│       ├── 20260508_enable_rls_all_tables.sql
│       ├── 20260508_performance_indexing.sql
│       ├── 20260508_security_hardening.sql
│       └── add_scalability_indexes.sql
├── vercel.json
└── vite.config.js
```

## 🏛️ 4. Kiến trúc & Quy ước Thiết kế (Architecture & Conventions)
* _(Hiện chưa có `.auto-skill-local.md`, kinh nghiệm dự án sẽ được tự động tích lũy trong quá trình phát triển)_

## 🚦 5. Tiến độ Hiện tại & Việc cần làm (Current Status & TODO)
* **Tiến độ**: 
    - Đã chuẩn hóa định dạng số (Compact Format - tỷ/tr) trên toàn bộ hệ thống Dashboard, Financials, Marketing.
    - Đã ổn định AI Assistant (BOD Intelligence) sử dụng Gemini API v1.
    - Đã hỗ trợ cấu hình linh hoạt API Key và Model thông qua Supabase Secrets.
* **Việc cần làm**:
    - Kiểm tra hiệu năng hiển thị khi dữ liệu tăng trưởng lớn.
    - Tiếp tục tối ưu giao diện theo yêu cầu hiện đại, tinh tế của Sếp.
