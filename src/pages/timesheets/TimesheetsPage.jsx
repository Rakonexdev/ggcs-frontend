import { useState, useEffect } from 'react';
import { Plus, Clock, X } from 'lucide-react';
import { timesheetsApi, projectsApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function TimesheetsPage() {
  const [timesheets, setTimesheets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ project_id: '', profession_name: '', rate_per_hour: '', total_hours: '', date_from: '', date_to: '' });
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [t, p] = await Promise.all([timesheetsApi.list(), projectsApi.list({ type: 'variable' })]);
      setTimesheets(t.data.data || t.data);
      setProjects(p.data.data || p.data);
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const totalPrice = parseFloat(form.rate_per_hour || 0) * parseFloat(form.total_hours || 0);
      await timesheetsApi.create({ ...form, total_price: totalPrice });
      setShowModal(false);
      setForm({ project_id: '', profession_name: '', rate_per_hour: '', total_hours: '', date_from: '', date_to: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating timesheet');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <button className="btn btn-primary ml-auto" onClick={() => { setShowModal(true); setError(''); }}>
          <Plus size={18} /> Add Entry
        </button>
      </div>

      <div className="card">
        {timesheets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Clock size={48} />
            </div>
            <h3>No timesheets logged</h3>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Project</th><th>Profession</th><th>Rate/Hr</th><th>Hours</th><th>Total</th><th>Period</th></tr>
              </thead>
              <tbody>
                {timesheets.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500, color: 'var(--accent-hover)' }}>{t.project?.project_code || '—'}</td>
                    <td>{t.profession_name}</td>
                    <td>{formatCurrency(t.rate_per_hour)}</td>
                    <td>{t.total_hours}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(t.total_price)}</td>
                    <td>{formatDate(t.date_from)} – {formatDate(t.date_to)}</td>
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
              <h3 className="modal-title">Add Timesheet Entry</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project</label>
                <select className="form-select" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })} required>
                  <option value="">Select project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.project_code} – {p.person?.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Profession Name</label>
                <input className="form-input" value={form.profession_name} onChange={(e) => setForm({ ...form, profession_name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Rate per Hour (QAR)</label>
                  <input type="number" step="0.01" className="form-input" value={form.rate_per_hour} onChange={(e) => setForm({ ...form, rate_per_hour: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Hours</label>
                  <input type="number" step="0.5" className="form-input" value={form.total_hours} onChange={(e) => setForm({ ...form, total_hours: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date From</label>
                  <input type="date" className="form-input" value={form.date_from} onChange={(e) => setForm({ ...form, date_from: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date To</label>
                  <input type="date" className="form-input" value={form.date_to} onChange={(e) => setForm({ ...form, date_to: e.target.value })} />
                </div>
              </div>
              {form.rate_per_hour && form.total_hours && (
                <div style={{ padding: '10px 14px', background: 'var(--accent-dim)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '14px' }}>
                  Total: <strong>{formatCurrency(parseFloat(form.rate_per_hour) * parseFloat(form.total_hours))}</strong>
                </div>
              )}
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
