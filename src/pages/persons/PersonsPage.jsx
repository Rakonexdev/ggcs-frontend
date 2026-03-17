import { useState, useEffect } from 'react';
import { personsApi, companiesApi } from '../../api';
import { formatDate } from '../../utils/helpers';
import { Plus, User, Pencil, X } from 'lucide-react';

export default function PersonsPage() {
  const [persons, setPersons] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', qatar_id: '', id_expiration_date: '', company_id: '' });
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [p, c] = await Promise.all([personsApi.list({ search }), companiesApi.list()]);
      setPersons(p.data.data || p.data);
      setCompanies(c.data.data || c.data);
    } catch {}
    setLoading(false);
  };

  const openCreate = () => {
    setForm({ name: '', phone: '', qatar_id: '', id_expiration_date: '', company_id: '' });
    setEditId(null); setError(''); setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, phone: p.phone, qatar_id: p.qatar_id,
      id_expiration_date: p.id_expiration_date?.split('T')[0] || '',
      company_id: p.company_id || '',
    });
    setEditId(p.id); setError(''); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const payload = { ...form, company_id: form.company_id || null };
      if (editId) await personsApi.update(editId, payload);
      else await personsApi.create(payload);
      setShowModal(false); loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving person');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <button className="btn btn-primary ml-auto" onClick={openCreate}>
          <Plus size={18} style={{ marginRight: '4px' }} />
          Add Person
        </button>
      </div>

      <div className="filter-bar">
        <input className="form-input" placeholder="Search by name, phone, Qatar ID..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadData()} />
      </div>

      <div className="card">
        {persons.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><User size={48} /></div>
            <h3>No persons found</h3>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Phone</th><th>Qatar ID</th><th>ID Expiry</th><th>Company</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {persons.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</td>
                    <td>{p.phone}</td>
                    <td>{p.qatar_id}</td>
                    <td>{formatDate(p.id_expiration_date)}</td>
                    <td>{p.company?.name || '—'}</td>
                    <td><button className="btn-icon" onClick={() => openEdit(p)}><Pencil size={16} /></button></td>
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
              <h3 className="modal-title">{editId ? 'Edit Person' : 'Add Person'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Qatar ID</label>
                  <input className="form-input" value={form.qatar_id} onChange={(e) => setForm({ ...form, qatar_id: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">ID Expiration</label>
                  <input type="date" className="form-input" value={form.id_expiration_date} onChange={(e) => setForm({ ...form, id_expiration_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <select className="form-select" value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })}>
                    <option value="">None</option>
                    {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
