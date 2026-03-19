import { useState, useEffect } from 'react';
import { Plus, FileText, X } from 'lucide-react';
import { invoicesApi, projectsApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import CustomSelect from '../../components/common/CustomSelect';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ project_id: '', total_amount: '' });
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [i, p] = await Promise.all([invoicesApi.list(), projectsApi.list()]);
      setInvoices(i.data.data || i.data);
      setProjects(p.data.data || p.data);
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      await invoicesApi.create(form);
      setShowModal(false);
      setForm({ project_id: '', total_amount: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating invoice');
    }
  };

  const getBadgeClass = (status) => {
    const map = { issued: 'info', partially_paid: 'warning', paid: 'success', cancelled: 'danger' };
    return map[status] || 'neutral';
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <button className="btn btn-primary ml-auto" onClick={() => { setShowModal(true); setError(''); }}>
          <Plus size={18} /> New Invoice
        </button>
      </div>

      <div className="card">
        {invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={48} />
            </div>
            <h3>No invoices yet</h3>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Code</th><th>Project</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Status</th><th>Issued</th></tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-hover)' }}>{inv.invoice_code}</td>
                    <td>{inv.project?.project_code || '—'}</td>
                    <td>{formatCurrency(inv.total_amount)}</td>
                    <td style={{ color: 'var(--success)' }}>{formatCurrency(inv.paid_amount)}</td>
                    <td style={{ color: inv.outstanding_amount > 0 ? 'var(--warning)' : 'var(--success)' }}>
                      {formatCurrency(inv.outstanding_amount)}
                    </td>
                    <td><span className={`badge ${getBadgeClass(inv.status)}`}>{inv.status?.replace('_', ' ')}</span></td>
                    <td>{formatDate(inv.issued_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-slide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">New Invoice</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project</label>
                <CustomSelect
                  options={projects.map(p => ({ id: p.id, name: `${p.project_code} – ${p.person?.name}` }))}
                  value={form.project_id}
                  onChange={(val) => setForm({ ...form, project_id: val })}
                  placeholder="Select project"
                  isSearchable={true}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Total Amount (QAR)</label>
                <input type="number" step="0.01" className="form-input" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
