import React from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
        {payload.map((p, idx) => (
          <p key={idx} style={{ margin: 0, color: p.color || p.fill || p.stroke }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function Sales() {
  const { sales, transactions, leads } = useData();

  // --- DATA CONNECTIONS & PROCESSING ---
  
  // Calculate live metrics for each sales agent
  const enrichedSales = sales.map(s => {
    const maNV = s['Mã NV'];
    
    // Live from Transactions: HĐMB + Cọc
    const liveTransactions = transactions.filter(t => t['Mã nhân viên'] === maNV && (t['Trạng thái'] === 'Đã ký HĐMB' || t['Trạng thái'] === 'Đã đặt cọc'));
    const liveHDMB_Coc = liveTransactions.length;
    
    // Live from Transactions: Hoa hồng
    const liveHoaHong = liveTransactions.reduce((sum, t) => sum + Number(t['Hoa hồng'] || 0), 0) / 1000000; // in triệu

    // Live from Leads: Count of leads assigned
    const liveLeads = leads.filter(l => l['Mã NV'] === maNV || l['Sales phụ trách'] === s['Tên NV']).length;

    return {
      ...s,
      'Live HĐMB+CỌC': liveHDMB_Coc,
      'Live Hoa Hồng': liveHoaHong || Number(s['Hoa hồng (tr)'] || 0), // fallback to static if 0
      'Live Lead': liveLeads
    };
  });

  // Sort by KPI descending for Leaderboard
  const rankedSales = [...enrichedSales].sort((a, b) => Number(b['% KPI']) - Number(a['% KPI']));

  // --- KPI CARD CALCULATIONS ---
  const totalDS = enrichedSales.reduce((sum, s) => sum + Number(s['DS thực (tỷ)'] || 0), 0);
  const topAgent = rankedSales[0] || {};
  
  const totalCalls = enrichedSales.reduce((sum, s) => sum + Number(s['Gọi điện'] || 0), 0);
  const avgCalls = Math.round(totalCalls / (enrichedSales.length || 1));
  
  const totalVisits = enrichedSales.reduce((sum, s) => sum + Number(s['Site Visit'] || 0), 0);
  const avgVisits = Math.round(totalVisits / (enrichedSales.length || 1));

  const underKpiAgents = rankedSales.filter(s => Number(s['% KPI']) < 1);
  const underKpiNames = underKpiAgents.map(s => s['Tên NV'].split(' ').pop()).join(' · ');

  const totalLuong = enrichedSales.reduce((sum, s) => sum + Number(s['Lương cứng (tr)'] || 0), 0);
  const totalHH = enrichedSales.reduce((sum, s) => sum + Number(s['Live Hoa Hồng'] || 0), 0);
  const totalPayout = totalLuong + totalHH;

  // --- CHART DATA ---
  const chartData = enrichedSales.map(s => ({
    name: s['Tên NV'].split(' ').pop(), // Just first name
    'DS Thực (tỷ)': Number(s['DS thực (tỷ)'] || 0),
    'KPI (tỷ)': Number(s['KH DS (tỷ)'] || 0),
    'Cuộc gọi': Number(s['Gọi điện'] || 0),
    'Site Visit TT': Number(s['Site Visit'] || 0),
    'KH Site Visit': Number(s['KH Site Visit'] || 0)
  }));

  // --- HELPERS ---
  const getKpiColor = (pct) => {
    if (pct >= 1) return 'var(--accent)';
    if (pct >= 0.8) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div>
      {/* TOP KPI CARDS */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card card-revenue">
          <div className="dash-kpi-title">TỔNG DS TEAM</div>
          <div className="dash-kpi-value">{totalDS.toFixed(1)}<span className="dash-kpi-unit">tỷ</span></div>
          <div className="dash-kpi-subtext">{enrichedSales.length} nhân viên</div>
        </div>
        
        <div className="dash-kpi-card" style={{ borderTopColor: '#ff8c00' }}>
          <div className="dash-kpi-title">#1 — {topAgent['Tên NV']?.split(' ').pop()}</div>
          <div className="dash-kpi-value" style={{ color: '#ff8c00' }}>{Math.round((topAgent['% KPI']||0)*100)}<span className="dash-kpi-unit">%</span></div>
          <div className="dash-kpi-subtext">DS {topAgent['DS thực (tỷ)']} tỷ · HH {topAgent['Live Hoa Hồng']}tr</div>
        </div>

        <div className="dash-kpi-card" style={{ borderTopColor: '#4da6ff' }}>
          <div className="dash-kpi-title">TỔNG CUỘC GỌI</div>
          <div className="dash-kpi-value" style={{ color: '#4da6ff' }}>{totalCalls.toLocaleString()}</div>
          <div className="dash-kpi-subtext">TB {avgCalls} cuộc/người</div>
        </div>

        <div className="dash-kpi-card" style={{ borderTopColor: '#00e5ff' }}>
          <div className="dash-kpi-title">TỔNG SITE VISIT</div>
          <div className="dash-kpi-value" style={{ color: '#00e5ff' }}>{totalVisits}</div>
          <div className="dash-kpi-subtext">TB {avgVisits} lượt/người</div>
        </div>

        <div className="dash-kpi-card" style={{ borderTopColor: '#ff4d94' }}>
          <div className="dash-kpi-title">DƯỚI KPI</div>
          <div className="dash-kpi-value" style={{ color: '#ff4d94' }}>{underKpiAgents.length}</div>
          <div className="dash-kpi-subtext">{underKpiNames || 'Không có'}</div>
        </div>

        <div className="dash-kpi-card" style={{ borderTopColor: '#b366ff' }}>
          <div className="dash-kpi-title">TỔNG LƯƠNG + HH</div>
          <div className="dash-kpi-value" style={{ color: '#b366ff' }}>{totalPayout.toFixed(0)}<span className="dash-kpi-unit">tr</span></div>
          <div className="dash-kpi-subtext">Lương cứng + Hoa hồng</div>
        </div>
      </div>

      <div className="sales-layout-grid">
        {/* LEFT COLUMN: LEADERBOARD */}
        <div>
          <div className="section-title">▶ Bảng xếp hạng T04/2026</div>
          <div className="sales-leaderboard">
            {rankedSales.map((agent, index) => {
              const pct = Number(agent['% KPI']);
              const pctFormatted = Math.round(pct * 100);
              const color = getKpiColor(pct);
              const rankClass = index === 0 ? 'agent-rank-1' : index === 1 ? 'agent-rank-2' : index === 2 ? 'agent-rank-3' : 'agent-rank-other';
              const icon = index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

              return (
                <div key={index} className={`agent-card ${rankClass}`}>
                  <div className="agent-card-header">
                    <div className="agent-profile">
                      <div className="agent-avatar">{agent['Tên NV'].charAt(0)}</div>
                      <div>
                        <div className="agent-name">
                          {agent['Tên NV']} 
                          <span className="agent-badge" style={{ backgroundColor: index < 3 ? color+'33' : '', color: index < 3 ? color : '' }}>
                            {icon} #{index + 1}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {agent['Mã NV']} · {agent['Sàn']}
                        </div>
                      </div>
                    </div>
                    <div className="agent-kpi-badge" style={{ color: color }}>
                      {pctFormatted}% KPI
                    </div>
                  </div>

                  <div className="agent-stats-grid">
                    <div className="agent-stat-item">
                      <div className="agent-stat-val" style={{ color: color }}>{agent['DS thực (tỷ)']}t</div>
                      <div className="agent-stat-label">DS THỰC</div>
                    </div>
                    <div className="agent-stat-item">
                      <div className="agent-stat-val">{agent['Gọi điện']}</div>
                      <div className="agent-stat-label">GỌI ĐIỆN</div>
                    </div>
                    <div className="agent-stat-item">
                      <div className="agent-stat-val">{agent['Site Visit']}</div>
                      <div className="agent-stat-label">SITE VISIT</div>
                    </div>
                    <div className="agent-stat-item">
                      <div className="agent-stat-val" style={{ color: 'var(--accent)' }}>{agent['Live HĐMB+CỌC']}</div>
                      <div className="agent-stat-label">HĐMB+CỌC</div>
                    </div>
                    <div className="agent-stat-item">
                      <div className="agent-stat-val" style={{ color: 'var(--cyan)' }}>{agent['Live Lead']}</div>
                      <div className="agent-stat-label">LEAD CRM</div>
                    </div>
                  </div>

                  <div className="agent-progress-bar">
                    <div className="agent-progress-fill" style={{ width: `${Math.min(pctFormatted, 100)}%`, backgroundColor: color }}></div>
                  </div>
                  
                  <div className="agent-note" style={{ color: color }}>
                    ▶ {agent['Ghi chú']}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: CHARTS */}
        <div>
          <div className="section-title">▶ So sánh hiệu suất</div>
          
          <div className="dash-chart-card" style={{ height: '350px', marginBottom: '20px' }}>
            <div className="dash-chart-title">Doanh số vs KPI (tỷ)</div>
            <div className="dash-chart-subtitle">Xanh ≥100% · Vàng 80-99% · Đỏ &lt;80%</div>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
                <XAxis dataKey="name" stroke="#8b92a5" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8b92a5" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#252932' }} content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} verticalAlign="top" />
                <Bar dataKey="DS Thực (tỷ)" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => {
                    const pct = entry['DS Thực (tỷ)'] / entry['KPI (tỷ)'];
                    return <Cell key={`cell-${index}`} fill={getKpiColor(pct)} />;
                  })}
                </Bar>
                <Line type="monotone" dataKey="KPI (tỷ)" stroke="#8b92a5" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: '#8b92a5' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="dash-chart-card" style={{ height: '350px' }}>
            <div className="dash-chart-title">Cuộc gọi & Site Visit</div>
            <div className="dash-chart-subtitle">Hiệu suất</div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
                <XAxis dataKey="name" stroke="#8b92a5" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8b92a5" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#252932' }} content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} verticalAlign="top" />
                <Bar dataKey="Cuộc gọi" fill="#4da6ff" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Site Visit TT" fill="#ccff00" radius={[2, 2, 0, 0]} />
                <Bar dataKey="KH Site Visit" fill="#5c677d" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DETAILED DATA TABLE */}
      <div className="fin-table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div className="dash-chart-title">Chi tiết KPI từng nhân viên</div>
          <div className="agent-badge">{enrichedSales.length} NV</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Tên</th>
              <th>Sàn</th>
              <th>DS Thực (tỷ)</th>
              <th>KH DS</th>
              <th>% KPI</th>
              <th>Gọi</th>
              <th>Visit/KH</th>
              <th>HĐMB TT/KH</th>
              <th>Cọc TT/KH</th>
              <th>Lương (tr)</th>
              <th>HH (tr)</th>
              <th>Xếp loại</th>
            </tr>
          </thead>
          <tbody>
            {enrichedSales.map((s, i) => {
              const color = getKpiColor(Number(s['% KPI']));
              return (
                <tr key={i}>
                  <td style={{ color: 'var(--text-muted)' }}>{s['Mã NV']}</td>
                  <td style={{ fontWeight: 'bold' }}>{s['Tên NV']}</td>
                  <td>{s['Sàn']}</td>
                  <td style={{ color: color, fontWeight: 'bold', fontSize: '14px' }}>{s['DS thực (tỷ)']}</td>
                  <td>{s['KH DS (tỷ)']}</td>
                  <td>
                    <span className="badge-eval" style={{ color: color }}>
                      {Math.round(Number(s['% KPI'])*100)}%
                    </span>
                  </td>
                  <td>{s['Gọi điện']}</td>
                  <td>{s['Site Visit']}/{s['KH Site Visit']}</td>
                  <td style={{ color: s['Live HĐMB+CỌC'] > 0 ? 'var(--accent)' : ''}}>{s['HĐMB THỰC TẾ']}/{s['KH HĐMB']}</td>
                  <td>{s['CỌC']}/{s['KH CỌC']}</td>
                  <td>{s['Lương cứng (tr)']}</td>
                  <td style={{ color: '#ff8c00', fontWeight: 'bold' }}>{s['Live Hoa Hồng']}</td>
                  <td>
                    <span className="badge-eval" style={{ color: color }}>
                      {s['XẾP LOẠI KPI']}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Sales;
