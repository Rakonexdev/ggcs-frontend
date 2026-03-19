import { useState, useEffect, useRef, forwardRef, useMemo } from 'react';
import { personsApi, companiesApi } from '../../api';
import { formatDate } from '../../utils/helpers';
import { Plus, User, Phone, CreditCard, Calendar, Search, Edit2, Trash2, Pencil, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomSelect from '../../components/common/CustomSelect';

// ── Custom Datepicker Input ─────────────────────────────────────────────────
const DatePickerInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <button
    type="button"
    className="form-input"
    onClick={onClick}
    ref={ref}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
      color: value ? 'var(--text-primary)' : 'var(--text-muted)',
    }}
  >
    <span>{value || placeholder || 'Select date'}</span>
    <Calendar size={16} style={{ opacity: 0.6 }} />
  </button>
));

// ── Main Component ──────────────────────────────────────────────────────────
export default function PersonsPage() {
  const [persons, setPersons] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', qatar_id: '', id_expiration_date: '', company_id: '' });
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState(''); // Renamed from filterCompany
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { loadData(); }, [search, companyFilter]); // Added companyFilter to dependency array

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { search };
      if (companyFilter) {
        params.company_id = companyFilter;
      }
      const [p, c] = await Promise.all([personsApi.list(params), companiesApi.list()]);
      setPersons(p.data.data || p.data);
      setCompanies(c.data.data || c.data);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load data.");
    }
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

  // Direct company creation handler
  const handleCreateCompany = async (name) => {
    try {
      const { data } = await companiesApi.create({ name });
      // The API returns { company: {id, name...}, similar_existing: [...] }
      let newCompany = data.company || data.data || data;
      
      // Ensure we have a valid object with an ID
      if (newCompany && typeof newCompany.id === 'undefined' && data.id) {
        newCompany = data;
      }

      // If name is missing from the extracted object, use the name we sent
      if (newCompany && !newCompany.name) {
        newCompany = { ...newCompany, name: name };
      }
      setCompanies(prev => [...prev, newCompany]);
      return newCompany;
    } catch (err) {
      console.error('API Error when creating company:', err);
      setError('Failed to create company. Please check your connection.');
      throw err;
    }
  };

  // Parse date string to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  // Filter persons locally as a fallback
  const filteredPersons = companyFilter 
    ? persons.filter(p => String(p.company_id) === String(companyFilter))
    : persons;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Persons</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} />
          Add Person
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            placeholder="Search by name, phone, Qatar ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>
        <button
          className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowFilters(!showFilters)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="card" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Company</label>
            <CustomSelect
              options={companies}
              value={companyFilter}
              onChange={setCompanyFilter}
              placeholder="All Companies"
              isSearchable={true}
            />
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => { setCompanyFilter(''); setSearch(''); }}
            style={{ height: '42px' }}
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="card">
        {filteredPersons.length === 0 ? (
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
                {filteredPersons.map((p) => (
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
          <div className="modal animate-slide" onClick={(e) => e.stopPropagation()} style={{ overflow: 'visible' }}>
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
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    value={form.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 8) setForm({ ...form, phone: val });
                    }}
                    required
                    minLength={8}
                    maxLength={8}
                    placeholder="8 digits"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Qatar ID</label>
                  <input
                    className="form-input"
                    value={form.qatar_id}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 11) setForm({ ...form, qatar_id: val });
                    }}
                    required
                    minLength={11}
                    maxLength={11}
                    placeholder="11 digits"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">ID Expiration</label>
                  <DatePicker
                    wrapperClassName="date-picker-wrapper"
                    selected={parseDate(form.id_expiration_date)}
                    onChange={(date) => {
                      if (date) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const dd = String(date.getDate()).padStart(2, '0');
                        setForm({ ...form, id_expiration_date: `${yyyy}-${mm}-${dd}` });
                      } else {
                        setForm({ ...form, id_expiration_date: '' });
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select expiry date"
                    customInput={<DatePickerInput />}
                    popperPlacement="bottom-start"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    renderCustomHeader={({
                      date,
                      changeYear,
                      changeMonth,
                      decreaseMonth,
                      increaseMonth,
                      prevMonthButtonDisabled,
                      nextMonthButtonDisabled,
                    }) => (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
                        <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '4px' }}>
                          <ChevronLeft size={18} />
                        </button>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <select
                            value={date.getMonth()}
                            onChange={({ target: { value } }) => changeMonth(Number(value))}
                            style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 6px', fontSize: '13px' }}
                          >
                            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                              <option key={m} value={i}>{m}</option>
                            ))}
                          </select>
                          <select
                            value={date.getFullYear()}
                            onChange={({ target: { value } }) => changeYear(Number(value))}
                            style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 6px', fontSize: '13px' }}
                          >
                            {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                        <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '4px' }}>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Company</label>
                  <CustomSelect
                    options={companies}
                    value={form.company_id}
                    onChange={(id) => setForm({ ...form, company_id: id })}
                    onCreate={handleCreateCompany}
                    createLabel="Add Company"
                    placeholder="Search or add company..."
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
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
