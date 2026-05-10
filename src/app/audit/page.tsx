import { AuditClient } from "./audit-client";

export const metadata = {
  title: "Lịch sử hệ thống & Audit Log | CRM ERP v3.0",
  description: "Theo dõi mọi thay đổi dữ liệu trong hệ thống Real-time",
};

export default function AuditPage() {
  return <AuditClient />;
}
