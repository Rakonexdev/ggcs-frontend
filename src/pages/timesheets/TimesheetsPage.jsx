import { useState, useEffect, forwardRef } from 'react';
import { Plus, Clock, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { timesheetsApi, projectsApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/helpers';
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

  // Parse date string to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
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
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date From</label>
                  <DatePicker
                    selected={parseDate(form.date_from)}
                    onChange={(date) => {
                      if (date) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const dd = String(date.getDate()).padStart(2, '0');
                        setForm({ ...form, date_from: `${yyyy}-${mm}-${dd}` });
                      } else {
                        setForm({ ...form, date_from: '' });
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select start date"
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
                            {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
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
                <div className="form-group">
                  <label className="form-label">Date To</label>
                  <DatePicker
                    selected={parseDate(form.date_to)}
                    onChange={(date) => {
                      if (date) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const dd = String(date.getDate()).padStart(2, '0');
                        setForm({ ...form, date_to: `${yyyy}-${mm}-${dd}` });
                      } else {
                        setForm({ ...form, date_to: '' });
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select end date"
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
                            {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
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
              </div>

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
