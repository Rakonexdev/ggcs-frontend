import { useState, useEffect } from 'react';
import { reportsApi } from '../../api';
import { formatCurrency, timeAgo } from '../../utils/helpers';
import { DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    pendingInvoiceTotal: 0,
    todayCollections: 0,
    qidExpiryCount: 0,
    totalProjects: 0,
    recentCollections: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, feedRes] = await Promise.allSettled([
        reportsApi.dashboardStats(),
        reportsApi.collectionsFeed({ per_page: 5 }),
      ]);

      const statData = statsRes.status === 'fulfilled' ? statsRes.value.data : {};
      const feedData = feedRes.status === 'fulfilled' ? feedRes.value.data : {};

      setStats({
        pendingInvoiceTotal: statData.pending_invoice_total || 0,
        todayCollections: statData.today_collections || 0,
        qidExpiryCount: statData.qid_expiry_count || 0,
        totalProjects: statData.total_projects || 0,
        recentCollections: feedData.data || [],
      });
    } catch {}
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="page-header justify-end">
        {/* Title removed, now in AppLayout header */}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Pending total invoice</div>
          <div className="stat-value">{formatCurrency(stats.pendingInvoiceTotal)}</div>
          <div className="stat-sub">Outstanding Amount</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Total collections of today</div>
          <div className="stat-value">{formatCurrency(stats.todayCollections)}</div>
          <div className="stat-sub">Today</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Quid Expiry</div>
          <div className="stat-value">{stats.qidExpiryCount}</div>
          <div className="stat-sub">Expiring within 30 days</div>
        </div>
        <div className="stat-card info">
          <div className="stat-label">Total Projects</div>
          <div className="stat-value">{stats.totalProjects}</div>
          <div className="stat-sub">All time</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">Recent Collections</h3>
          <a href="/collections" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>View All &rarr;</a>
        </div>
        {stats.recentCollections.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><DollarSign size={48} /></div>
            <h3>No collections yet</h3>
            <p>Collections will appear here when recorded</p>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textTransform: 'uppercase', fontSize: '12px', color: '#64748b' }}>Time</th>
                  <th style={{ textTransform: 'uppercase', fontSize: '12px', color: '#64748b' }}>Collector</th>
                  <th style={{ textTransform: 'uppercase', fontSize: '12px', color: '#64748b' }}>Company</th>
                  <th style={{ textTransform: 'uppercase', fontSize: '12px', color: '#64748b' }}>Invoice</th>
                  <th style={{ textTransform: 'uppercase', fontSize: '12px', color: '#64748b' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentCollections.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: '#64748b' }}>{timeAgo(c.collection_date)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                          {c.collector?.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <span style={{ fontWeight: '500' }}>{c.collector?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td style={{ color: '#64748b' }}>{c.invoice?.project?.person?.company?.name || '—'}</td>
                    <td>
                      <span className="badge" style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: 'bold' }}>
                        {c.invoice?.invoice_code || '—'}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}><span style={{ color: '#94a3b8', fontWeight: 'normal', marginRight: '4px' }}>QAR</span>{new Intl.NumberFormat('en-QA').format(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
