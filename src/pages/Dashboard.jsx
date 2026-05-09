import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { KpiCard, AlertCard, SectionHead, DonutChart, BarChart, ChartCard, fmt } from '../components/VisualLanguage';

const Table = ({ headers, rows }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
          {headers.map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            {row.map((cell, j) => <td key={j} style={{ padding: '8px 4px', fontSize: 11, color: 'var(--text-main)' }}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

function Dashboard() {
  const { 
    leads, transactions, marketing, financials, sales,
    dashboardStats, trafficLights, projectPL, cashflowForecast 
  } = useData();

  // Fallback for when stats are loading
  const stats = dashboardStats || {
    leads: { total: 0, unassigned: 0, status_counts: {} },
    transactions: { total: 0, completed: 0, deposited: 0, booking: 0, zone_counts: {} },
    financial_stats: { revenue: 0, revenue_kh: 0, expense: 0 }
  };

  // --- KPI CALCULATIONS ---
  const kpis = useMemo(() => {
    const revenue = Number(stats.financial_stats?.revenue || 0) * 1000000000;
    const revenueKH = Number(stats.financial_stats?.revenue_kh || 0);
    const revenuePercent = revenueKH > 0 ? Math.round((revenue / (revenueKH * 1000000000)) * 100) : 0;

    const expense = Number(stats.financial_stats?.expense || 0) * 1000000000;
    const profit = revenue - expense;
    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

    const totalGD = stats.transactions.total;
    const countHDMB = stats.transactions.completed;
    const countCoc = stats.transactions.deposited;

    const totalBooking = marketing.reduce((sum, m) => sum + Number(m['Booking'] || 0), 0);
    const totalChiPhiMkt = marketing.reduce((sum, m) => sum + Number(m['CP (tr)'] || 0), 0) * 1000000;

    return {
      revenue: fmt(revenue),
      revenueSub: `${revenuePercent}% KH · KH: ${revenueKH} tỷ`,
      profit: fmt(profit),
      profitSub: `${margin}% biên LN`,
      burn: fmt(expense),
      burnSub: 'Định phí & Biến phí vận hành',
      deals: totalGD,
      dealsSub: `${countHDMB} HĐMB · ${countCoc} Cọc`,
      leadCount: stats.leads.total,
      leadSub: `${stats.leads.unassigned} chưa phân công`,
      booking: totalBooking,
      bookingSub: `Chi phí: ${fmt(totalChiPhiMkt)}`,
    };
  }, [stats, marketing]);

  // --- INSIGHTS ---
  const alerts = useMemo(() => {
    const items = [];
    
    // Traffic Lights
    trafficLights.forEach(t => {
      items.push({
        type: t.status.includes('Nguy cấp') ? 'danger' : t.status.includes('Cảnh báo') ? 'warning' : 'success',
        title: `${t.indicator}: ${t.status}`,
        sub: t.note,
        badge: t.status.includes('Nguy cấp') ? 'Nguy cấp' : 'Theo dõi'
      });
    });

    // Unassigned leads
    if (stats.leads.unassigned > 0) {
      items.push({
        type: 'danger',
        title: `${stats.leads.unassigned} lead chưa phân công`,
        sub: 'Phân công sales ngay trong ngày để không bỏ lỡ cơ hội tiếp cận.',
        badge: 'Cần xử lý'
      });
    }

    // Sales KPI
    sales.forEach(s => {
      const percent = Math.round(Number(s['% KPI']) * 100);
      if (percent < 70) {
        items.push({
          type: 'danger',
          title: `${s['Tên NV']} chỉ đạt ${percent}% KPI`,
          sub: `DS ${s['Doanh số (tỷ)']} tỷ / KH ${s['KH DS (tỷ)']} tỷ · Dưới KPI — cần coaching`,
          badge: 'Cảnh báo'
        });
      }
    });

    // Marketing ROI
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
      items.push({
        type: 'info',
        title: `${bestMkt['Kênh']} hiệu quả nhất: CĐ ${((bestMkt['Booking'] / bestMkt['Lead']) * 100).toFixed(1)}%`,
        sub: `Chi ${bestMkt['CP (tr)']}tr · ${bestMkt['Lead']} lead · ${bestMkt['Booking']} booking`,
        badge: 'Top kênh'
      });
    }

    return items;
  }, [trafficLights, stats, sales, marketing]);

  // --- CHART DATA ---
  const leadStatusSegments = useMemo(() => {
    const COLORS = ['#ccff00', '#00e5ff', '#ff4d94', '#a78bfa', '#4ade80', '#ffcc00'];
    const total = stats.leads.total || 1;
    return Object.entries(stats.leads.status_counts).map(([label, count], i) => ({
      label, count,
      pct: Math.round((count / total) * 100),
      color: COLORS[i % COLORS.length]
    }));
  }, [stats.leads]);

  const bookingBars = useMemo(() => {
    const COLORS = ['#00e5ff', '#a78bfa', '#ccff00', '#ff4d94', '#ffcc00', '#4ade80'];
    return marketing.slice(0, 6).map((m, i) => ({
      label: m['Kênh'].replace(' Ads', '').slice(0, 8),
      val: Number(m['Booking'] || 0),
      color: COLORS[i % COLORS.length]
    }));
  }, [marketing]);

  const zoneSegments = useMemo(() => {
    const COLORS = ['#ff4d94', '#60a5fa', '#00e5ff', '#ccff00'];
    const total = stats.transactions.total || 1;
    return Object.entries(stats.transactions.zone_counts).map(([label, count], i) => ({
      label, count,
      pct: Math.round((count / total) * 100),
      color: COLORS[i % COLORS.length]
    }));
  }, [stats.transactions]);

  const deptSegments = useMemo(() => {
    const COLORS = ['#00e5ff', '#ccff00', '#ff4d94', '#a78bfa', '#4ade80', '#ffcc00'];
    const data = stats.dept_revenue || [];
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    return data.map((d, i) => ({
      label: d.name,
      count: d.value,
      pct: Math.round((d.value / total) * 100),
      color: COLORS[i % COLORS.length]
    }));
  }, [stats.dept_revenue]);

  // --- TABLE DATA ---
  const tableData = useMemo(() => ({
    topSales: sales.slice(0, 5).map(s => [s['Tên NV'], fmt(Number(s['Doanh số (tỷ)']) * 1_000_000_000), (Number(s['% KPI']) * 100).toFixed(0) + '%']),
    recentTx: transactions.slice(0, 5).map(t => [t['Tên KH'], t['Phân khu'], fmt(t['Giá trị HĐ (tr)'] * 1_000_000), t['Trạng thái']]),
    mktROI: marketing.slice(0, 5).map(m => [m['Kênh'], m['Lead'], m['Booking'], m['CP (tr)'] + 'tr']),
    finStats: financials.slice(0, 5).map(f => [f['Hạng mục'], f['Loại'], f['Thực tế (tỷ)'] + ' tỷ'])
  }), [sales, transactions, marketing, financials]);

  return (
    <div style={{ fontFamily: 'var(--font-family, system-ui, sans-serif)' }}>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 10, marginBottom: 20 }}>
        <KpiCard colorClass="lime"   label="Doanh thu thực thu" value={kpis.revenue}  sub={kpis.revenueSub} />
        <KpiCard colorClass="cyan"   label="Lợi nhuận gộp"      value={kpis.profit}   sub={kpis.profitSub} />
        <KpiCard colorClass="pink"   label="Burn rate (tháng)"  value={kpis.burn}     sub={kpis.burnSub} />
        <KpiCard colorClass="amber"  label="Giao dịch"          value={kpis.deals}    sub={kpis.dealsSub} />
        <KpiCard colorClass="blue"   label="Lead CRM"           value={kpis.leadCount} sub={kpis.leadSub} />
        <KpiCard colorClass="purple" label="MKT Booking"        value={kpis.booking}  sub={kpis.bookingSub} />
      </div>

      {/* alerts */}
      <SectionHead icon="ti-bolt" label="Cảnh báo & Insights tự động" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {alerts.map((a, i) => (
          <AlertCard key={i} type={a.type} title={a.title} sub={a.sub} badge={a.badge} />
        ))}
      </div>

      {/* charts */}
      <SectionHead icon="ti-chart-bar" label="Phân tích chi tiết" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginBottom: 24 }}>
        <ChartCard title="Trạng thái Lead CRM" sub={`Tổng ${stats.leads.total} leads`}>
          <DonutChart segments={leadStatusSegments} total={stats.leads.total} />
        </ChartCard>

        <ChartCard title="Booking theo kênh" sub={`Tổng ${kpis.booking} booking`}>
          <BarChart bars={bookingBars} />
        </ChartCard>

        <ChartCard title="Giao dịch theo phân khu" sub={`Tổng ${stats.transactions.total} giao dịch`}>
          <DonutChart segments={zoneSegments} total={stats.transactions.total} />
        </ChartCard>

        <ChartCard title="Doanh thu theo bộ phận" sub="Đơn vị: Tỷ VNĐ">
          <DonutChart segments={deptSegments} total={stats.financial_stats?.revenue || 0} label="tỷ" />
        </ChartCard>
      </div>

      {/* Tables Section */}
      <SectionHead icon="ti-layout-grid2" label="Bảng biểu tổng hợp" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginBottom: 24 }}>
        <ChartCard title="Top Sales hiệu quả" sub="Theo doanh số và KPI tháng">
          <Table headers={['Nhân viên', 'Doanh số', 'KPI']} rows={tableData.topSales} />
        </ChartCard>
        <ChartCard title="Giao dịch mới nhất" sub="Theo dõi tiến độ hợp đồng">
          <Table headers={['Khách hàng', 'Khu', 'Giá trị', 'Trạng thái']} rows={tableData.recentTx} />
        </ChartCard>
        <ChartCard title="Hiệu suất Marketing" sub="Lead & Booking theo kênh">
          <Table headers={['Kênh', 'Lead', 'Book', 'Chi phí']} rows={tableData.mktROI} />
        </ChartCard>
        <ChartCard title="Hạng mục Tài chính" sub="Thực tế thu chi tháng">
          <Table headers={['Hạng mục', 'Loại', 'Thực tế']} rows={tableData.finStats} />
        </ChartCard>
      </div>

      {/* BOD Analysis */}
      <SectionHead icon="ti-presentation" label="Phân tích chuyên sâu cho BOD" />
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
        <ChartCard title="Dự báo dòng tiền (90 ngày)" sub="Kế hoạch thu tiền dự kiến">
          <BarChart bars={cashflowForecast.map(c => ({ label: c.period, val: c.expected_amount, color: '#ff4d94' }))} />
        </ChartCard>
        <ChartCard title="Theo dõi Chỉ số Sức khỏe" sub="Tình trạng vận hành hiện tại">
          <Table 
            headers={['Chỉ số', 'Giá trị']} 
            rows={[
              ['Lead Conversion', '12.5%'],
              ['CAC (Cost/Lead)', '450k'],
              ['LTV (Customer)', '2.1 tỷ'],
              ['Burn Rate Rate', '1.4x'],
              ['Cash Runway', '18 tháng'],
              ['Sales Velocity', 'High']
            ]} 
          />
        </ChartCard>
      </div>
    </div>
  );
}

export default Dashboard;
