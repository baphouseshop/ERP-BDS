# 專案上下文 (Agent Context)：CRM

> **最後更新時間**：2026-05-09 07:51
> **自動生成**：由 `prepare_context.py` 產生，供 AI Agent 快速掌握專案全局

---

## 🎯 1. 專案目標 (Project Goal)
* **核心目的**：This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
* _完整說明見 [README.md](README.md)_

## 🛠️ 2. 技術棧與環境 (Tech Stack & Environment)
* **核心套件**：@supabase/supabase-js, lucide-react, react, react-dom, react-hot-toast, react-router-dom, recharts, xlsx
* **開發套件**：@eslint/js, @types/react, @types/react-dom, @vitejs/plugin-react, eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals
* **可用指令**：dev, build, lint, preview

### 原始設定檔

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

## 📂 3. 核心目錄結構 (Core Structure)
_(💡 AI 讀取守則：請依據此結構尋找對應檔案，勿盲目猜測路徑)_
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

## 🏛️ 4. 架構與設計約定 (Architecture & Conventions)
* _（尚無 `.auto-skill-local.md`，專案踩坑經驗將在開發過程中自動累積）_

## 🚦 5. 目前進度與待辦 (Current Status & TODO)
* _（尚無日記記錄，或日記中無「下一步」區塊）_

