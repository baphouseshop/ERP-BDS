import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { useData } from '../context/DataContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label || payload[0].name}</p>
        {payload.map((p, idx) => (
          <p key={idx} style={{ margin: 0, color: p.color || p.fill }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const { sales, allSales, transactions, marketing, leads, financials, dashboardStats, staff } = useData();

  // Fallback for when stats are loading
  const stats = dashboardStats || {
    leads: { total: 0, unassigned: 0, status_counts: {} },
    transactions: { total: 0, completed: 0, deposited: 0, booking: 0, zone_counts: {} },
    financial_stats: { revenue: 0, revenue_kh: 0, expense: 0 }
  };

  // --- KPI CALCULATIONS ---
  
  // 1. Doanh thu
  const doanhThu = Number(stats.financial_stats?.revenue || 0).toFixed(2);
  const doanhThuKH = Number(stats.financial_stats?.revenue_kh || 0).toFixed(2);
  const doanhThuPercent = doanhThuKH > 0 ? Math.round((doanhThu / doanhThuKH) * 100) : 0;

  // 2. Lợi nhuận gộp
  const chiPhi = Number(stats.financial_stats?.expense || 0);
  const loiNhuan = (doanhThu - chiPhi).toFixed(2);
  const margin = doanhThu > 0 ? ((loiNhuan / doanhThu) * 100).toFixed(1) : 0;

  // 3. Giao dịch — using pre-aggregated stats
  const totalGD = stats.transactions.total;
  const countHDMB = stats.transactions.completed;
  const countCoc = stats.transactions.deposited;
  const countGiuCho = stats.transactions.booking;

  // 4. Tổng Lead — using pre-aggregated stats
  const totalLeads = stats.leads.total;
  const unassignedLeadsCount = stats.leads.unassigned;
  const daPhanCong = totalLeads - unassignedLeadsCount;

  // 5. Booking MKT
  const totalBooking = marketing.reduce((sum, m) => sum + Number(m['Booking'] || 0), 0);
  const totalLeadMkt = marketing.reduce((sum, m) => sum + Number(m['Lead'] || 0), 0);
  const totalChiPhiMktRaw = marketing.reduce((sum, m) => sum + Number(m['CP (tr)'] || 0), 0);
  const totalChiPhiMkt = Number(totalChiPhiMktRaw.toFixed(1));

  // --- INSIGHTS GENERATION ---
  const insights = [];

  // Unassigned leads insight
  if (unassignedLeadsCount > 0) {
    insights.push({
      type: 'danger',
      title: `${unassignedLeadsCount} lead chưa phân công`,
      desc: 'Phân công sales ngay trong ngày để không bỏ lỡ cơ hội tiếp cận.'
    });
  }

  // Sales KPI insights
  sales.forEach(s => {
    const thucTe = Number(s['Doanh số (tỷ)'] || 0);
    const kpi = Number(s['KH DS (tỷ)'] || 1);
    const percent = Math.round((thucTe / kpi) * 100);
    if (percent < 70) {
      insights.push({
        type: 'danger',
        title: `${s['Tên NV']} (${s['Mã NV']}) chỉ đạt ${percent}% KPI`,
        desc: `DS ${thucTe} tỷ / KH ${kpi} tỷ · ⚠ Dưới KPI - cần coaching`
      });
    }
  });

  // Marketing insights
  let bestMkt = null;
  let bestMktRate = 0;
  marketing.forEach(m => {
    const cp = Number(m['CP (tr)']);
    const bk = Number(m['Booking']);
    if (cp > 0 && bk > 0) {
      const rate = bk / cp;
      if (rate > bestMktRate) {
        bestMktRate = rate;
        bestMkt = m;
      }
    }
  });

  if (bestMkt) {
    const leadCount = bestMkt['Lead'];
    const bookCount = bestMkt['Booking'];
    const cp = Number(bestMkt['CP (tr)']);
    const conversion = ((bookCount / leadCount) * 100).toFixed(1);
    insights.push({
      type: 'success',
      title: `${bestMkt['Kênh']} hiệu quả nhất: CĐ ${conversion}%`,
      desc: `Chi ${cp}tr · ${leadCount} lead · ${bookCount} booking`
    });
  }

  // --- CHARTS DATA ---
  
  // 1. Lead Status (from RPC stats)
  const leadStatusData = Object.keys(stats.leads.status_counts).map(k => ({ 
    name: k, 
    value: stats.leads.status_counts[k] 
  }));
  const PIE_COLORS = ['#b366ff', '#ccff00', '#00cc66', '#00e5ff', '#ff4d94', '#ffcc00'];

  // 2. Booking by Channel
  const mktChannelData = marketing.map(m => ({
    name: m['Kênh'],
    Booking: Number(m['Booking'] || 0)
  }));

  // 3. Transactions by Zone (from RPC stats)
  const zoneData = Object.keys(stats.transactions.zone_counts).map(k => ({ 
    name: k, 
    value: stats.transactions.zone_counts[k] 
  }));
  const ZONE_COLORS = ['#ff4d94', '#4da6ff', '#00e5ff'];

  // 4. Funnel
  const funnelData = [
    { name: 'Lead Marketing', value: totalLeadMkt, fill: '#ccff00' },
    { name: 'Lead CRM', value: totalLeads, fill: '#b366ff' },
    { name: 'Booking MKT', value: totalBooking, fill: '#4da6ff' },
    { name: 'Giao dịch', value: totalGD, fill: '#ffcc00' },
    { name: 'Đã ký HĐMB', value: countHDMB, fill: '#ff4d94' }
  ].reverse();

  // 5. Sales Performance - TOP 5 by KPI %
  const top5KpiData = [...allSales]
    .filter(s => Number(s['DS thực (tỷ)']) > 0 || Number(s['KH DS (tỷ)']) > 0)
    .sort((a, b) => Number(b['% KPI']) - Number(a['% KPI']))
    .slice(0, 5)
    .map(s => ({
      name: s['Tên NV'].split(' ').pop(), 
      'Thực tế (tỷ)': Number(s['DS thực (tỷ)'] || 0),
      'KPI (tỷ)': Number(s['KH DS (tỷ)'] || 0)
    }));

  // 6. Revenue by Department
  const deptRevenueData = (() => {
    const revenueByDept = {};
    transactions.forEach(t => {
      const empId = t['Mã nhân viên'];
      const emp = staff.find(e => e['Mã NV'] === empId);
      let dept = emp ? emp['Sàn'] : 'Khác';
      if (!dept) dept = 'Khác';
      
      // Normalize department names
      let normalizedDept = dept;
      const lowerDept = dept.toLowerCase();
      if (lowerDept.includes('sàn 1')) normalizedDept = 'Sàn 1';
      else if (lowerDept.includes('sàn 2')) normalizedDept = 'Sàn 2';
      else if (lowerDept.includes('sàn 3')) normalizedDept = 'Sàn 3';
      else if (lowerDept.includes('marketing') || lowerDept.includes('mkt')) normalizedDept = 'MKT';
      else if (lowerDept.includes('kế toán')) normalizedDept = 'Kế toán';
      else if (lowerDept.includes('sales')) normalizedDept = 'Sales';
      
      const amount = Number(t['Giá (VNĐ)'] || 0);
      revenueByDept[normalizedDept] = (revenueByDept[normalizedDept] || 0) + amount;
    });
    
    return Object.keys(revenueByDept).map(dept => ({
      name: dept,
      value: Number((revenueByDept[dept] / 1000000000).toFixed(2))
    })).sort((a, b) => b.value - a.value);
  })();

  const DEPT_COLORS = ['#00e5ff', '#ccff00', '#ff4d94', '#b366ff', '#00cc66', '#ffcc00'];

  return (
    <div>
      {/* KPI GRID */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card card-revenue">
          <div className="dash-kpi-title">Doanh thu</div>
          <div className="dash-kpi-value">{doanhThu}<span className="dash-kpi-unit">tỷ</span></div>
          <div className="dash-kpi-subtext">{doanhThuPercent}% KH · KH: {doanhThuKH} tỷ</div>
        </div>
        
        <div className="dash-kpi-card card-profit">
          <div className="dash-kpi-title">Lợi nhuận gộp</div>
          <div className="dash-kpi-value">{loiNhuan}<span className="dash-kpi-unit">tỷ</span></div>
          <div className="dash-kpi-subtext">{margin}% biên LN</div>
        </div>

        <div className="dash-kpi-card card-deals">
          <div className="dash-kpi-title">Giao dịch</div>
          <div className="dash-kpi-value">{totalGD}</div>
          <div className="dash-kpi-subtext">{countHDMB} HĐMB · {countCoc} Cọc · {countGiuCho} Giữ chỗ</div>
        </div>

        <div className="dash-kpi-card card-leads">
          <div className="dash-kpi-title">Tổng Lead CRM</div>
          <div className="dash-kpi-value">{totalLeads}</div>
          <div className="dash-kpi-subtext">{unassignedLeadsCount} chưa phân công · {daPhanCong} đã phân</div>
        </div>

        <div className="dash-kpi-card card-mkt">
          <div className="dash-kpi-title">Booking MKT</div>
          <div className="dash-kpi-value">{totalBooking}</div>
          <div className="dash-kpi-subtext">{totalLeadMkt} leads · {totalChiPhiMkt}tr chi phí</div>
        </div>

        <div className="dash-kpi-card card-unassigned">
          <div className="dash-kpi-title">Chưa phân công</div>
          <div className="dash-kpi-value">{unassignedLeadsCount}</div>
          <div className="dash-kpi-subtext">Xử lý ngay</div>
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="section-title">▶ Cảnh báo & Insights tự động</div>
      <div className="insight-list">
        {insights.map((insight, idx) => (
          <div key={idx} className={`insight-item alert-${insight.type}`}>
            <div className="insight-icon"></div>
            <div className="insight-content">
              <div className="insight-title">{insight.title}</div>
              <div className="insight-desc">{insight.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS ROW 1 */}
      <div className="dash-charts-grid">
        <div className="dash-chart-card">
          <div className="dash-chart-title">Trạng thái Lead CRM</div>
          <div className="dash-chart-subtitle">Tổng {totalLeads} leads</div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={leadStatusData} cx="40%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                {leadStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-title">Booking theo kênh</div>
          <div className="dash-chart-subtitle">Tổng {totalBooking} booking</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mktChannelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
              <XAxis dataKey="name" stroke="#8b92a5" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8b92a5" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#252932' }} content={<CustomTooltip />} />
              <Bar dataKey="Booking" radius={[4, 4, 0, 0]}>
                {mktChannelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#4da6ff', '#00e5ff', '#ff4d94', '#00cc66'][index % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-title">Giao dịch theo phân khu</div>
          <div className="dash-chart-subtitle">Tổng {totalGD} giao dịch</div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={zoneData} cx="40%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                {zoneData.map((entry, index) => <Cell key={`cell-${index}`} fill={ZONE_COLORS[index % ZONE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="dash-chart-card">
          <div className="dash-chart-title">Doanh thu theo bộ phận</div>
          <div className="dash-chart-subtitle">Đơn vị: Tỷ VNĐ</div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={deptRevenueData} cx="40%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                {deptRevenueData.map((entry, index) => <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="dash-charts-wide-grid">
        <div className="dash-chart-card">
          <div className="dash-chart-title">Funnel chuyển đổi</div>
          <div className="dash-chart-subtitle">MKT Lead → CRM → Booking → GD</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#8b92a5" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#252932' }} content={<CustomTooltip />} />
              <Bar dataKey="value" barSize={15} radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-title">Top 5 KPI Doanh số</div>
          <div className="dash-chart-subtitle">Đơn vị: Tỷ VNĐ</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top5KpiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
              <XAxis dataKey="name" stroke="#8b92a5" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8b92a5" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#252932' }} content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} verticalAlign="top" align="right" />
              <Bar dataKey="Thực tế (tỷ)" fill="#ffcc00" radius={[2, 2, 0, 0]} />
              <Bar dataKey="KPI (tỷ)" fill="#5c677d" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
