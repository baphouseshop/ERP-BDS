import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Activity, MessageSquare, Target, Zap } from 'lucide-react';

const AutomationDashboard = () => {
  const [stats, setStats] = useState({
    totalSent: 0,
    responseRate: 0,
    scoreDistribution: [],
    funnelData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      // 1. Thống kê tin nhắn
      const { count: totalSent } = await supabase
        .from('automation_messages')
        .select('*', { count: 'exact', head: true });

      const { count: totalReplied } = await supabase
        .from('automation_responses')
        .select('*', { count: 'exact', head: true });

      // 2. Thống kê Score hiện tại
      const { data: scores } = await supabase
        .from('lead_scores')
        .select('score');
      
      const dist = { lanh: 0, am: 0, nong: 0 };
      scores?.forEach(s => dist[s.score]++);

      const scoreChartData = [
        { name: 'Lạnh', value: dist.lanh, color: '#3b82f6' },
        { name: 'Ấm', value: dist.am, color: '#fbbf24' },
        { name: 'Nóng', value: dist.nong, color: '#ef4444' }
      ];

      setStats({
        totalSent: totalSent || 0,
        responseRate: totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0,
        scoreDistribution: scoreChartData,
        funnelData: [
          { name: 'Đã gửi', value: totalSent || 0 },
          { name: 'Phản hồi', value: totalReplied || 0 }
        ]
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) return <div className="loading-shimmer" style={{ height: '200px' }}></div>;

  return (
    <div className="automation-dashboard">
      <div className="dash-kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="dash-kpi-card card-revenue">
          <div className="dash-kpi-icon"><Zap size={20} /></div>
          <div className="dash-kpi-title">Tổng tin đã gửi</div>
          <div className="dash-kpi-value">{stats.totalSent}</div>
          <div className="dash-kpi-subtext">Zalo, SMS & Email</div>
        </div>
        
        <div className="dash-kpi-card card-profit">
          <div className="dash-kpi-icon"><MessageSquare size={20} /></div>
          <div className="dash-kpi-title">Tỷ lệ phản hồi</div>
          <div className="dash-kpi-value">{stats.responseRate}%</div>
          <div className="dash-kpi-subtext">Từ khách hàng</div>
        </div>

        <div className="dash-kpi-card card-leads">
          <div className="dash-kpi-icon"><Target size={20} /></div>
          <div className="dash-kpi-title">Lead Nóng</div>
          <div className="dash-kpi-value">{stats.scoreDistribution.find(d => d.name === 'Nóng')?.value || 0}</div>
          <div className="dash-kpi-subtext">Sẵn sàng chốt deal</div>
        </div>
      </div>

      <div className="dash-charts-grid" style={{ gridTemplateColumns: '1fr 1.5fr', height: '300px' }}>
        <div className="dash-chart-card">
          <div className="dash-chart-title">Phân bổ nhiệt độ Lead</div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={stats.scoreDistribution} 
                innerRadius={60} 
                outerRadius={80} 
                paddingAngle={5} 
                dataKey="value"
              >
                {stats.scoreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-title">Hiệu quả phễu Automation</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.funnelData} layout="vertical" margin={{ left: 40, right: 40 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={80} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                {stats.funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#60a5fa' : '#4ade80'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AutomationDashboard;
