import React from 'react';

// ─── utilities ───────────────────────────────────────────────────────────────

export const fmt = (n) => {
  if (!n && n !== 0) return '—';
  const num = Math.abs(Number(n));
  const sign = Number(n) < 0 ? '-' : '';
  
  if (num >= 1_000_000_000) return sign + (num / 1_000_000_000).toFixed(1) + ' tỷ';
  if (num >= 1_000_000)     return sign + (num / 1_000_000).toFixed(1) + ' tr';
  return sign + Number(n).toLocaleString('vi-VN');
};

/**
 * Formats a raw number or string with dots as thousand separators.
 * Example: 1000000 -> 1.000.000
 */
export const formatNumInput = (val) => {
  if (val === null || val === undefined || val === '') return '';
  // Ensure we are working with a string of digits
  const raw = val.toString().replace(/\D/g, '');
  if (!raw) return '';
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Removes all dots and non-numeric characters from a formatted string.
 */
export const parseNumInput = (val) => {
  if (val === null || val === undefined) return '';
  return val.toString().replace(/\./g, '').replace(/\D/g, '');
};


// ─── styles ───────────────────────────────────────────────────────────────────

const S = {
  kpi: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderTop: '2px solid transparent',
    borderRadius: 10,
    padding: '14px 16px',
    flex: 1,
    minWidth: '150px',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  kpiVal: {
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1,
  },
  kpiSub: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 5,
    opacity: 0.7,
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 20,
  },
  alertCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderLeft: '3px solid transparent',
    borderRadius: 10,
    padding: '12px 14px',
    position: 'relative',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-main)',
    marginBottom: 2,
  },
  alertSub: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  alertBadge: {
    padding: '2px 8px',
    borderRadius: 99,
    fontSize: 10,
    fontWeight: 700,
    flexShrink: 0,
    alignSelf: 'flex-start',
    whiteSpace: 'nowrap',
    marginLeft: 'auto',
  },
  chartCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-main)',
    marginBottom: 2,
  },
  chartSub: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginBottom: 14,
  },
};

// ─── components ───────────────────────────────────────────────────────────────

export function KpiCard({ label, value, sub, colorClass, color }) {
  const colors = {
    lime:   '#ccff00',
    cyan:   '#00e5ff',
    pink:   '#ff4d94',
    amber:  '#ffcc00',
    blue:   '#60a5fa',
    purple: '#a78bfa',
    red:    '#f87171',
  };
  const c = color || colors[colorClass] || colors.lime;
  return (
    <div style={{ ...S.kpi, borderTopColor: c }}>
      <div style={S.kpiLabel}>{label}</div>
      <div style={{ ...S.kpiVal, color: c }}>{value}</div>
      {sub && <div style={S.kpiSub}>{sub}</div>}
    </div>
  );
}

export function AlertCard({ type, title, sub, badge }) {
  const colors = {
    success: { border: '#4ade80', badgeBg: 'rgba(74,222,128,0.12)', badgeBorder: 'rgba(74,222,128,0.25)', badgeText: '#4ade80' },
    danger:  { border: '#f87171', badgeBg: 'rgba(248,113,113,0.12)', badgeBorder: 'rgba(248,113,113,0.25)', badgeText: '#f87171' },
    info:    { border: '#60a5fa', badgeBg: 'rgba(96,165,250,0.12)',  badgeBorder: 'rgba(96,165,250,0.25)',  badgeText: '#60a5fa' },
    warning: { border: '#ffcc00', badgeBg: 'rgba(255,204,0,0.12)',   badgeBorder: 'rgba(255,204,0,0.25)',   badgeText: '#ffcc00' },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{ ...S.alertCard, borderLeftColor: c.border }}>
      <div style={{ flex: 1 }}>
        <div style={S.alertTitle}>{title}</div>
        {sub && <div style={S.alertSub}>{sub}</div>}
      </div>
      {badge && (
        <div style={{ ...S.alertBadge, background: c.badgeBg, border: `0.5px solid ${c.badgeBorder}`, color: c.badgeText }}>
          {badge}
        </div>
      )}
    </div>
  );
}

export function SectionHead({ icon, label }) {
  return (
    <div className="section-head-res" style={S.sectionHead}>
      {icon && <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 14 }} />}
      {label}
    </div>
  );
}

export function DonutChart({ segments = [], total, label }) {
  const circumference = 2 * Math.PI * 36; // Increased radius from 28 to 36
  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash = (seg.pct / 100) * circumference;
    const arc = { ...seg, dash, offset };
    offset += dash;
    return arc;
  });

  const shortTotal = (val) => {
    if (typeof val !== 'number') return val;
    // For large numbers in the center
    if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
    // Round to 1 decimal if it's a small decimal (like tỷ)
    if (val.toString().includes('.') && val.toString().split('.')[1].length > 1) {
      return val.toFixed(1);
    }
    return val;
  };

  return (
    <div className="donut-container-res" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width="104" height="104" viewBox="0 0 104 104" aria-hidden="true" style={{ flexShrink: 0 }}>
        <circle cx="52" cy="52" r="36" fill="none" stroke="#1e2130" strokeWidth="16" />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx="52" cy="52" r="36"
            fill="none"
            stroke={arc.color}
            strokeWidth="16"
            strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
            strokeDashoffset={-arc.offset}
            transform="rotate(-90 52 52)"
          />
        ))}
        <text x="52" y="52" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#f0f2f5">{shortTotal(total)}</text>
        {label && <text x="52" y="66" textAnchor="middle" fontSize="10" fontWeight="600" fill="#6b7280" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</text>}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#9ca3af' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>{seg.label}</span>
            <span style={{ marginLeft: 'auto', color: '#6b7280', paddingLeft: 10, fontWeight: 700 }}>{shortTotal(seg.count) || seg.pct + '%'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarChart({ bars = [] }) {
  const max = Math.max(...bars.map(b => b.val), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, marginTop: 6 }}>
      {bars.map((bar, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
          <div
            style={{
              borderRadius: '4px 4px 0 0',
              width: '100%',
              maxWidth: 60,
              height: `${Math.max((bar.val / max) * 80, 4)}px`,
              background: bar.color,
              transition: 'opacity .15s',
              cursor: 'default',
            }}
            title={`${bar.label}: ${bar.val}`}
          />
          <div style={{ fontSize: 9, color: '#4b5563', textAlign: 'center', lineHeight: 1.2, width: '100%', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bar.label}</div>
        </div>
      ))}
    </div>
  );
}

export function ChartCard({ title, sub, children }) {
  return (
    <div style={S.chartCard}>
      <div style={S.chartTitle}>{title}</div>
      <div style={S.chartSub}>{sub}</div>
      {children}
    </div>
  );
}
