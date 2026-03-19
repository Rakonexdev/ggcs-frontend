import { useState, useEffect } from 'react';
import { reportsApi } from '../../api';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/helpers';

export default function ReportsPage() {
  const [tab, setTab] = useState('outstanding');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadTab(tab); }, [tab]);

  const loadTab = async (t) => {
    setLoading(true); setData(null);
    try {
      let res;
      switch (t) {
        case 'outstanding': res = await reportsApi.outstandingInvoices(); break;
        case 'collections': res = await reportsApi.collectionsSummary(); break;
        case 'feed': res = await reportsApi.collectionsFeed(); break;
        case 'expenses': res = await reportsApi.expensesByCategory(); break;
        case 'audit': res = await reportsApi.auditLogs(); break;
      }
      setData(res.data);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="animate-fade">
      <div className="page-header"></div>

      <div className="tabs">
        {[
          { key: 'outstanding', label: 'Outstanding' },
          { key: 'collections', label: 'Collections Summary' },
          { key: 'feed', label: 'Live Feed' },
          { key: 'expenses', label: 'Expenses' },
          { key: 'audit', label: 'Audit Log' },
        ].map((t) => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>
        ) : !data ? (
          <div className="empty-state"><div className="icon">📈</div><h3>No data available</h3></div>
        ) : (
          <>
            {/* Outstanding Invoices */}
            {tab === 'outstanding' && (
              <>
                <div className="stats-grid" style={{ marginBottom: '20px' }}>
                  <div className="stat-card warning">
                    <div className="stat-label">Total Outstanding</div>
                    <div className="stat-value">{formatCurrency(data.total_outstanding)}</div>
                  </div>
                </div>
                {data.invoices?.length > 0 && (
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr><th>Invoice</th><th>Project</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Age (days)</th></tr>
                      </thead>
                      <tbody>
                        {data.invoices.map((inv) => (
                          <tr key={inv.id}>
                            <td style={{ fontWeight: 600, color: 'var(--accent-hover)' }}>{inv.invoice_code}</td>
                            <td>{inv.project?.project_code || '—'}</td>
                            <td>{formatCurrency(inv.total_amount)}</td>
                            <td>{formatCurrency(inv.paid_amount)}</td>
                            <td style={{ color: 'var(--warning)', fontWeight: 600 }}>{formatCurrency(inv.outstanding_amount)}</td>
                            <td>{inv.aging_days || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Collections Summary */}
            {tab === 'collections' && (
              <div className="stats-grid">
                <div className="stat-card success">
                  <div className="stat-label">Total Collected</div>
                  <div className="stat-value">{formatCurrency(data.total_collected)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Cash</div>
                  <div className="stat-value">{formatCurrency(data.cash_total)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Bank Transfer</div>
                  <div className="stat-value">{formatCurrency(data.bank_transfer_total)}</div>
                </div>
              </div>
            )}

            {/* Live Feed */}
            {tab === 'feed' && (
              (data.data || data)?.length > 0 ? (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th>Date</th><th>Invoice</th><th>Collector</th><th>Amount</th><th>Method</th></tr>
                    </thead>
                    <tbody>
                      {(data.data || data).map((c) => (
                        <tr key={c.id}>
                          <td>{formatDate(c.collection_date)}</td>
                          <td>{c.invoice?.invoice_code || '—'}</td>
                          <td>{c.collector?.name || '—'}</td>
                          <td style={{ fontWeight: 600 }}>{formatCurrency(c.amount)}</td>
                          <td style={{ textTransform: 'capitalize' }}>{c.method?.replace('_', ' ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state"><h3>No recent collections</h3></div>
              )
            )}

            {/* Expenses by Category */}
            {tab === 'expenses' && (
              <>
                <div className="stats-grid" style={{ marginBottom: '20px' }}>
                  <div className="stat-card danger">
                    <div className="stat-label">Total Expenses</div>
                    <div className="stat-value">{formatCurrency(data.total)}</div>
                  </div>
                </div>
                {data.categories?.length > 0 && (
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr><th>Category</th><th>Amount</th><th>% of Total</th></tr>
                      </thead>
                      <tbody>
                        {data.categories.map((cat, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 500 }}>{cat.name}</td>
                            <td>{formatCurrency(cat.total)}</td>
                            <td>{data.total > 0 ? ((cat.total / data.total) * 100).toFixed(1) : 0}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Audit Log */}
            {tab === 'audit' && (
              (data.data || data)?.length > 0 ? (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th>Time</th><th>User</th><th>Action</th><th>Model</th><th>ID</th></tr>
                    </thead>
                    <tbody>
                      {(data.data || data).map((log) => (
                        <tr key={log.id}>
                          <td>{formatDateTime(log.created_at)}</td>
                          <td>{log.user?.name || 'System'}</td>
                          <td><span className="badge info">{log.action}</span></td>
                          <td>{log.model_type?.split('\\').pop()}</td>
                          <td>{log.model_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state"><h3>No audit entries</h3></div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
