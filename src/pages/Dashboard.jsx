import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, FunnelChart, Funnel, LabelList
} from 'recharts';
import { useData } from '../context/DataContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '13px' }}>{label || payload[0].name}</p>
        {payload.map((p, idx) => (
          <p key={idx} style={{ margin: 0, color: p.color || p.fill, fontSize: '12px', display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
            <span>{p.name}:</span>
            <span style={{ fontWeight: 'bold' }}>{p.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const { 
    sales, allSales, transactions, marketing, leads, financials, 
    dashboardStats, staff, executiveScorecard, trafficLights, 
    projectPL, cashflowForecast 
  } = useData();

  // Fallback for when stats are loading
  const stats = dashboardStats || {
    leads: { total: 0, unassigned: 0, status_counts: {} },
    transactions: { total: 0, completed: 0, deposited: 0, booking: 0, zone_counts: {} },
    financial_stats: { revenue: 0, revenue_kh: 0, expense: 0 }
  };

  // --- KPI CALCULATIONS ---
  const formatCompact = (num, defaultUnit = '') => {
    if (!num || num === 0) return `0${defaultUnit}`;
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + ' tỷ';
    if (num >= 1000000) return (num / 1000000).toFixed(0) + ' tr';
    return num.toLocaleString() + defaultUnit;
  };
  
  // 1. Chỉ số từ Dashboard Stats (Hỗ trợ Filter)
  const rawRevenue = stats.financial_stats?.revenue || 0;
  const rawRevenueKH = stats.financial_stats?.revenue_kh || 0;
  const doanhThu = rawRevenue.toFixed(2);
  const doanhThuKH = rawRevenueKH.toFixed(2);
  const doanhThuPercent = rawRevenueKH > 0 
    ? Math.round((rawRevenue / rawRevenueKH) * 100) 
    : 0;

  // 2. Lợi nhuận & Chi phí (Hỗ trợ Filter)
  const rawExpense = stats.financial_stats?.expense || 0;
  const burnRate = formatCompact(rawExpense * 1000000000);
  const loiNhuan = (rawRevenue - rawExpense).toFixed(2);
  const margin = rawRevenue > 0 
    ? (((rawRevenue - rawExpense) / rawRevenue) * 100).toFixed(1)
    : 0;

  // 3. Giao dịch & Marketing
  const totalGD = stats.transactions.total;
  const countHDMB = stats.transactions.completed;
  const countCoc = stats.transactions.deposited;
  const countGiuCho = stats.transactions.booking;

  const totalLeads = stats.leads.total;
  const unassignedLeadsCount = stats.leads.unassigned;

  const totalBooking = marketing.reduce((sum, m) => sum + Number(m['Booking'] || 0), 0);
  const totalLeadMkt = marketing.reduce((sum, m) => sum + Number(m['Lead'] || 0), 0);
  const totalChiPhiMktRaw = marketing.reduce((sum, m) => sum + Number(m['CP (tr)'] || 0), 0);
  const totalChiPhiMkt = Number(totalChiPhiMktRaw.toFixed(1));

  // --- INSIGHTS GENERATION ---
  const insights = [];

  trafficLights.forEach(t => {
    insights.push({
      type: t.status.includes('Nguy cấp') ? 'danger' : t.status.includes('Cảnh báo') ? 'warning' : 'success',
      title: `${t.indicator}: ${t.status}`,
      desc: t.note
    });
  });

  if (unassignedLeadsCount > 0) {
    insights.push({
      type: 'danger',
      title: `${unassignedLeadsCount} lead chưa phân công`,
      desc: 'Phân công sales ngay trong ngày để không bỏ lỡ cơ hội tiếp cận.'
    });
  }

  // --- CHARTS DATA ---
  const leadStatusData = Object.keys(stats.leads.status_counts).map(k => ({ 
    name: k, 
    value: stats.leads.status_counts[k] 
  }));
  const PIE_COLORS = ['#bf7aff', '#d4ff00', '#00e676', '#00f2ff', '#ff5e9e', '#ffb800'];

  const mktChannelData = marketing.map(m => ({
    name: m['Kênh'],
    Booking: Number(m['Booking'] || 0)
  }));

  const zoneData = Object.keys(stats.transactions.zone_counts).map(k => ({ 
    name: k, 
    value: stats.transactions.zone_counts[k] 
  }));
  const ZONE_COLORS = ['#ff5e9e', '#4da6ff', '#00f2ff'];

  const deptRevenueData = stats.dept_revenue || [];

  return (
    <div>
      {/* KPI GRID */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card card-revenue">
          <div className="dash-kpi-title">Doanh thu thực thu</div>
          <div className="dash-kpi-value">{doanhThu}<span className="dash-kpi-unit">tỷ</span></div>
          <div className="dash-kpi-subtext">{doanhThuPercent}% KH · KH: {doanhThuKH} tỷ</div>
        </div>
        
        <div className="dash-kpi-card card-profit">
          <div className="dash-kpi-title">Lợi nhuận gộp</div>
          <div className="dash-kpi-value">{loiNhuan}<span className="dash-kpi-unit">tỷ</span></div>
          <div className="dash-kpi-subtext">{margin}% biên LN</div>
        </div>

        <div className="dash-kpi-card card-burn">
          <div className="dash-kpi-title">Burn Rate (Tháng)</div>
          <div className="dash-kpi-value">{burnRate}</div>
          <div className="dash-kpi-subtext">Định phí & Biến phí vận hành</div>
        </div>

        <div className="dash-kpi-card card-deals">
          <div className="dash-kpi-title">Giao dịch</div>
          <div className="dash-kpi-value">{totalGD}</div>
          <div className="dash-kpi-subtext">{countHDMB} HĐMB · {countCoc} Cọc</div>
        </div>

        <div className="dash-kpi-card card-leads">
          <div className="dash-kpi-title">Lead CRM</div>
          <div className="dash-kpi-value">{totalLeads}</div>
          <div className="dash-kpi-subtext">{unassignedLeadsCount} chưa phân công</div>
        </div>

        <div className="dash-kpi-card card-mkt">
          <div className="dash-kpi-title">MKT Booking</div>
          <div className="dash-kpi-value">{totalBooking}</div>
          <div className="dash-kpi-subtext">{totalChiPhiMkt}tr chi phí</div>
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
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={leadStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={5} dataKey="value">
                  {leadStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-title">Phân bổ Doanh thu theo bộ phận</div>
          <div className="dash-chart-subtitle">Số liệu thực thu (Tỷ VNĐ)</div>
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
              <AreaChart data={deptRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDept" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}T`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" name="Doanh thu" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorDept)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-title">Dự báo dòng tiền (90 ngày)</div>
          <div className="dash-chart-subtitle">Kế hoạch thu tiền từ khách hàng</div>
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
              <AreaChart data={cashflowForecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}tr`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="expected_amount" name="Tiền dự kiến" stroke="var(--cyan)" strokeWidth={3} fillOpacity={1} fill="url(#colorCash)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-title">Giao dịch theo phân khu</div>
          <div className="dash-chart-subtitle">Tổng {totalGD} giao dịch</div>
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={zoneData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={5} dataKey="value">
                  {zoneData.map((entry, index) => <Cell key={`cell-${index}`} fill={ZONE_COLORS[index % ZONE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
