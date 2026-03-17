import { useState, useEffect } from 'react';
import { projectsApi, personsApi } from '../../api';
import { formatCurrency, statusColor } from '../../utils/helpers';
import { Plus, Folder, X } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ person_id: '', type: 'fixed', fixed_total_amount: '', fixed_description: '', invoice_interval_days: '' });
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [p, per] = await Promise.all([
        projectsApi.list({ status: statusFilter || undefined }),
        personsApi.list(),
      ]);
      setProjects(p.data.data || p.data);
      setPersons(per.data.data || per.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (!loading) loadData(); }, [statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      await projectsApi.create(form);
      setShowModal(false);
      setForm({ person_id: '', type: 'fixed', fixed_total_amount: '', fixed_description: '', invoice_interval_days: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating project');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await projectsApi.updateStatus(id, { status });
      loadData();
    } catch {}
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <button className="btn btn-primary ml-auto" onClick={() => { setShowModal(true); setError(''); }}>
          <Plus size={18} style={{ marginRight: '4px' }} />
          New Project
        </button>
      </div>

      <div className="filter-bar">
        <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      <div className="card">
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><Folder size={48} /></div>
            <h3>No projects found</h3>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Code</th><th>Person</th><th>Type</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-hover)' }}>{p.project_code}</td>
                    <td>{p.person?.name || '—'}</td>
                    <td><span className={`badge ${p.type === 'fixed' ? 'info' : 'warning'}`}>{p.type}</span></td>
                    <td>{p.type === 'fixed' ? formatCurrency(p.fixed_total_amount) : '—'}</td>
                    <td>
                      <span className="badge" style={{ background: statusColor(p.status) + '22', color: statusColor(p.status) }}>
                        {p.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {p.status === 'draft' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus(p.id, 'active')}>Activate</button>}
                        {p.status === 'active' && (
                          <>
                            <button className="btn btn-sm btn-secondary" onClick={() => updateStatus(p.id, 'on_hold')}>Hold</button>
                            <button className="btn btn-sm btn-primary" onClick={() => updateStatus(p.id, 'completed')}>Complete</button>
                          </>
                        )}
                        {p.status === 'on_hold' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus(p.id, 'active')}>Resume</button>}
                      </div>
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
              <h3 className="modal-title">New Project</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Person</label>
                <select className="form-select" value={form.person_id} onChange={(e) => setForm({ ...form, person_id: e.target.value })} required>
                  <option value="">Select person</option>
                  {persons.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.qatar_id})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Project Type</label>
                <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="fixed">Fixed Amount</option>
                  <option value="variable">Variable (Hourly)</option>
                </select>
              </div>
              {form.type === 'fixed' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Total Amount (QAR)</label>
                    <input type="number" step="0.01" className="form-input" value={form.fixed_total_amount} onChange={(e) => setForm({ ...form, fixed_total_amount: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" value={form.fixed_description} onChange={(e) => setForm({ ...form, fixed_description: e.target.value })} />
                  </div>
                </>
              )}
              <div className="form-group">
                <label className="form-label">Invoice Interval (days)</label>
                <input type="number" className="form-input" value={form.invoice_interval_days} onChange={(e) => setForm({ ...form, invoice_interval_days: e.target.value })} />
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
