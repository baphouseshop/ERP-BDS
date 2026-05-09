import React from 'react';
import { useData } from '../context/DataContext';
import { 
  KpiCard, ChartCard, SectionHead, BarChart, fmt 
} from '../components/VisualLanguage';
import { downloadTemplate } from '../utils/templateGenerator';

function Sales() {
  const { sales, staff } = useData();

  // Enriched data is already sorted and prepared in DataContext usually,
  // but let's ensure ranking here for the leaderboard.
  const rankedSales = [...sales].sort((a, b) => {
    const kpiDiff = Number(b['% KPI']) - Number(a['% KPI']);
    if (Math.abs(kpiDiff) > 0.001) return kpiDiff;
    return Number(b['DS thực (tỷ)']) - Number(a['DS thực (tỷ)']);
  });

  // --- KPI CALCULATIONS ---
  const totalDS = sales.reduce((sum, s) => sum + Number(s['DS thực (tỷ)'] || 0), 0);
  const topAgent = rankedSales[0] || {};
  
  const totalCalls = sales.reduce((sum, s) => sum + Number(s['Gọi điện'] || 0), 0);
  const avgCalls = Math.round(totalCalls / (sales.length || 1));
  
  const totalVisits = sales.reduce((sum, s) => sum + Number(s['Site Visit'] || 0), 0);
  const avgVisits = Math.round(totalVisits / (sales.length || 1));

  const underKpiAgents = rankedSales.filter(s => Number(s['% KPI']) < 1);
  const underKpiNames = underKpiAgents.map(s => s['Tên NV'].split(' ').pop()).join(' · ');

  const totalLuong = sales.reduce((sum, s) => sum + Number(s['Lương cứng (tr)'] || 0), 0);
  const totalHH = sales.reduce((sum, s) => sum + Number(s['Hoa hồng (tr)'] || 0), 0);
  const totalPayout = totalLuong + totalHH;

  const getKpiColor = (pct) => {
    if (pct >= 1) return '#ccff00';
    if (pct >= 0.8) return '#ffcc00';
    return '#f87171';
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: 'clamp(20px, 5vw, 28px)' }}>Hiệu suất Sales</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Phân tích KPI và bảng xếp hạng đội ngũ kinh doanh</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-cancel" style={{ 
              borderColor: 'var(--accent)', 
              color: 'var(--accent)', 
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              fontSize: 13
            }} onClick={() => {
              toast.success("Đang chuẩn bị mẫu nhập liệu...");
              downloadTemplate('staff');
            }}>
              <i className="ti ti-download" style={{ marginRight: 6 }}></i> Tải mẫu nhập liệu
            </button>
            <button className="btn-cancel" style={{ 
              borderColor: 'var(--cyan)', 
              color: 'var(--cyan)', 
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              fontSize: 13
            }} onClick={() => toast.success("Vui lòng chọn file mẫu để upload")}>
              <i className="ti ti-upload" style={{ marginRight: 6 }}></i> Up file hàng loạt
            </button>
          </div>
        </div>
      </div>

      <div className="dash-kpi-grid-res" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard 
          label="Tổng Doanh Số" 
          value={totalDS.toFixed(1) + ' tỷ'} 
          sub={`${sales.length} nhân sự sales`}
          colorClass="lime"
        />
        <KpiCard 
          label="Top #1 Sales" 
          value={topAgent['Tên NV']?.split(' ').pop() || '—'} 
          sub={`Đạt ${Math.round((topAgent['% KPI']||0)*100)}% KPI`}
          colorClass="amber"
        />
        <KpiCard 
          label="Tổng Cuộc Gọi" 
          value={totalCalls.toLocaleString()} 
          sub={`TB ${avgCalls} cuộc/người`}
          colorClass="cyan"
        />
        <KpiCard 
          label="Tổng Site Visit" 
          value={totalVisits.toLocaleString()} 
          sub={`TB ${avgVisits} lượt/người`}
          colorClass="cyan"
        />
        <KpiCard 
          label="Dưới KPI" 
          value={underKpiAgents.length.toString()} 
          sub={underKpiNames || 'Không có'}
          colorClass="red"
        />
        <KpiCard 
          label="Tổng Chi Lương" 
          value={fmt(totalPayout * 1000000)} 
          sub="Lương cứng + Hoa hồng"
          colorClass="purple"
        />
      </div>

      <div className="dash-grid-res-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* LEADERBOARD */}
        <div>
          <SectionHead label="Bảng xếp hạng hiệu suất" icon="ti-trophy" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {rankedSales.map((agent, index) => {
              const pct = Number(agent['% KPI']);
              const color = getKpiColor(pct);
              return (
                <div key={index} style={{ 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)', 
                  borderLeft: `3px solid ${color}`,
                  borderRadius: 10, 
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16
                }}>
                  <div style={{ 
                    width: 32, height: 32, borderRadius: '50%', 
                    background: index < 3 ? color : 'var(--bg-tertiary)', 
                    color: index < 3 ? '#000' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{agent['Tên NV']}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{agent['Mã NV']} · {agent['Sàn']}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: color }}>{Math.round(pct * 100)}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>KPI</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHARTS */}
        <div>
          <SectionHead label="So sánh hiệu suất" icon="ti-chart-bar" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
            <ChartCard title="Doanh số thực tế (tỷ)" sub="So sánh doanh số giữa các nhân sự">
              <BarChart bars={sales.map(s => ({
                label: s['Tên NV'].split(' ').pop(),
                val: Number(s['DS thực (tỷ)'] || 0),
                color: getKpiColor(Number(s['% KPI']))
              }))} />
            </ChartCard>

            <ChartCard title="Hoạt động Site Visit" sub="Lượt dẫn khách đi xem thực tế">
              <BarChart bars={sales.map(s => ({
                label: s['Tên NV'].split(' ').pop(),
                val: Number(s['Site Visit'] || 0),
                color: '#00e5ff'
              }))} />
            </ChartCard>
          </div>
        </div>
      </div>

      <SectionHead label="Chi tiết KPI nhân sự" icon="ti-table" />
      <div className="table-container" style={{ marginTop: 12 }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 80 }}>Thao tác</th>
              <th>Mã NV</th>
              <th>Họ tên</th>
              <th>Sàn</th>
              <th>DS Thực (tỷ)</th>
              <th>KH DS</th>
              <th>% KPI</th>
              <th>Gọi điện</th>
              <th>Visit / KH</th>
              <th>HĐMB / KH</th>
              <th>Lương + HH</th>
              <th>Xếp loại</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s, i) => {
              const color = getKpiColor(Number(s['% KPI']));
              const totalIncome = Number(s['Lương cứng (tr)'] || 0) + Number(s['Hoa hồng (tr)'] || 0);
              return (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', padding: 4 }} title="Sửa"><i className="ti ti-pencil" style={{ fontSize: 16 }}></i></button>
                      <button style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 4 }} title="Xóa"><i className="ti ti-trash" style={{ fontSize: 16 }}></i></button>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s['Mã NV']}</td>
                  <td style={{ fontWeight: 700 }}>{s['Tên NV']}</td>
                  <td>{s['Sàn']}</td>
                  <td style={{ color: color, fontWeight: 800 }}>{s['DS thực (tỷ)']}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s['KH DS (tỷ)']}</td>
                  <td>
                    <span style={{ color: color, fontWeight: 700 }}>{Math.round(Number(s['% KPI'])*100)}%</span>
                  </td>
                  <td>{s['Gọi điện']}</td>
                  <td>{s['Site Visit']} / {s['KH Site Visit']}</td>
                  <td>{s['HĐMB THỰC TẾ']} / {s['KH HĐMB']}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmt(totalIncome * 1000000)}</td>
                  <td>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                      background: `${color}15`, color: color, border: `1px solid ${color}30`
                    }}>
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
