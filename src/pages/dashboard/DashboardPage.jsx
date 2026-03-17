import { useState, useEffect } from 'react';
import { reportsApi, projectsApi, invoicesApi } from '../../api';
import { formatCurrency } from '../../utils/helpers';
import { DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalOutstanding: 0,
    totalCollected: 0,
    recentCollections: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [projectsRes, outstandingRes, feedRes] = await Promise.allSettled([
        projectsApi.list({ per_page: 1 }),
        reportsApi.outstandingInvoices(),
        reportsApi.collectionsFeed({ per_page: 5 }),
      ]);

      const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data : {};
      const outstanding = outstandingRes.status === 'fulfilled' ? outstandingRes.value.data : {};
      const feed = feedRes.status === 'fulfilled' ? feedRes.value.data : {};

      setStats({
        totalProjects: projects.meta?.total || projects.total || 0,
        activeProjects: 0,
        totalOutstanding: outstanding.total_outstanding || 0,
        totalCollected: outstanding.total_collected || 0,
        recentCollections: feed.data || [],
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
          <div className="stat-label">Total Projects</div>
          <div className="stat-value">{stats.totalProjects}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Total Collected</div>
          <div className="stat-value">{formatCurrency(stats.totalCollected)}</div>
          <div className="stat-sub">All verified</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value">{formatCurrency(stats.totalOutstanding)}</div>
          <div className="stat-sub">Pending collection</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Collection Rate</div>
          <div className="stat-value">
            {stats.totalCollected + stats.totalOutstanding > 0
              ? Math.round((stats.totalCollected / (stats.totalCollected + stats.totalOutstanding)) * 100)
              : 0}%
          </div>
          <div className="stat-sub">This period</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Collections</h3>
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
                  <th>Date</th>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentCollections.map((c) => (
                  <tr key={c.id}>
                    <td>{c.collection_date}</td>
                    <td>{c.invoice?.invoice_code || '—'}</td>
                    <td>{formatCurrency(c.amount)}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.method?.replace('_', ' ')}</td>
                    <td>
                      <span className={`badge ${c.verified ? 'success' : 'warning'}`}>
                        {c.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
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
