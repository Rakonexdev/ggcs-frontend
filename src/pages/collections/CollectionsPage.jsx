import { useState, useEffect } from 'react';
import { Plus, DollarSign, X, CheckCircle } from 'lucide-react';
import { collectionsApi, invoicesApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ invoice_id: '', amount: '', collection_date: '', method: 'cash', notes: '' });
  const [error, setError] = useState('');
  const { hasPermission } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [c, i] = await Promise.all([collectionsApi.list(), invoicesApi.list()]);
      setCollections(c.data.data || c.data);
      setInvoices(i.data.data || i.data);
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      await collectionsApi.create(form);
      setShowModal(false);
      setForm({ invoice_id: '', amount: '', collection_date: '', method: 'cash', notes: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording collection');
    }
  };

  const handleVerify = async (id) => {
    try {
      await collectionsApi.verify(id);
      loadData();
    } catch {}
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <button className="btn btn-primary ml-auto" onClick={() => { setShowModal(true); setError(''); }}>
          <Plus size={18} /> Record Collection
        </button>
      </div>

      <div className="card">
        {collections.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <DollarSign size={48} />
            </div>
            <h3>No collections recorded</h3>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Invoice</th><th>Amount</th><th>Date</th><th>Method</th><th>Collector</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {collections.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500, color: 'var(--accent-hover)' }}>{c.invoice?.invoice_code || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(c.amount)}</td>
                    <td>{formatDate(c.collection_date)}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.method?.replace('_', ' ')}</td>
                    <td>{c.collector?.name || '—'}</td>
                    <td>
                      <span className={`badge ${c.verified ? 'success' : 'warning'}`}>
                        {c.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!c.verified && c.method === 'bank_transfer' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleVerify(c.id)}>
                          <CheckCircle size={14} /> Verify
                        </button>
                      )}
                    </td>
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
              <h3 className="modal-title">Record Collection</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Invoice</label>
                <select className="form-select" value={form.invoice_id} onChange={(e) => setForm({ ...form, invoice_id: e.target.value })} required>
                  <option value="">Select invoice</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_code} – Outstanding: {formatCurrency(inv.outstanding_amount)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount (QAR)</label>
                  <input type="number" step="0.01" className="form-input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={form.collection_date} onChange={(e) => setForm({ ...form, collection_date: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Method</label>
                <select className="form-select" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
