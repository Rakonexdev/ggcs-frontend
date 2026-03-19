import { useState, useEffect } from 'react';
import { companiesApi } from '../../api';
import { Plus, Building2, X } from 'lucide-react';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await companiesApi.list({ search });
      setCompanies(res.data.data || res.data);
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await companiesApi.create({ name });
      setShowModal(false);
      setName('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating company');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <button className="btn btn-primary ml-auto" onClick={() => { setShowModal(true); setError(''); }}>
          <Plus size={18} style={{ marginRight: '4px' }} />
          Add Company
        </button>
      </div>

      <div className="filter-bar">
        <input className="form-input" placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadData()} />
      </div>

      <div className="card">
        {companies.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><Building2 size={48} /></div>
            <h3>No companies found</h3>
            <p>Add your first company to get started</p>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Persons</th><th>Projects</th><th>Created</th></tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</td>
                    <td>{c.persons_count || c.persons?.length || 0}</td>
                    <td>{c.projects_count || 0}</td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
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
              <h3 className="modal-title">Add Company</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
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
