import { useState, useEffect } from 'react';
import { Plus, Wallet, Folder, X } from 'lucide-react';
import { expensesApi, expenseCategoriesApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import CustomSelect from '../../components/common/CustomSelect';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('expenses');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('expense');
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [e, c] = await Promise.all([expensesApi.list(), expenseCategoriesApi.list()]);
      setExpenses(e.data.data || e.data);
      setCategories(c.data.data || c.data);
    } catch {}
    setLoading(false);
  };

  const openExpenseModal = () => {
    setForm({ category_id: '', amount: '', date: '', notes: '' });
    setModalType('expense'); setError(''); setShowModal(true);
  };

  const openCategoryModal = () => {
    setForm({ name: '', parent_id: '' });
    setModalType('category'); setError(''); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (modalType === 'expense') {
        await expensesApi.create(form);
      } else {
        await expenseCategoriesApi.create({ ...form, parent_id: form.parent_id || null });
      }
      setShowModal(false); loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving');
    }
  };

  const headCategories = categories.filter((c) => !c.parent_id);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button className="btn btn-secondary" onClick={openCategoryModal}>
            <Plus size={18} /> Category
          </button>
          <button className="btn btn-primary" onClick={openExpenseModal}>
            <Plus size={18} /> Add Expense
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>Expenses</button>
        <button className={`tab ${tab === 'categories' ? 'active' : ''}`} onClick={() => setTab('categories')}>Categories</button>
      </div>

      <div className="card">
        {tab === 'expenses' ? (
          expenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Wallet size={48} />
              </div>
              <h3>No expenses recorded</h3>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Category</th><th>Amount</th><th>Date</th><th>Notes</th><th>By</th></tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>{exp.category?.name || '—'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--danger)' }}>{formatCurrency(exp.amount)}</td>
                      <td>{formatDate(exp.date)}</td>
                      <td>{exp.notes || '—'}</td>
                      <td>{exp.creator?.name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          categories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Folder size={48} />
              </div>
              <h3>No categories defined</h3>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Parent</th><th># Expenses</th></tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)', paddingLeft: cat.parent_id ? '32px' : '16px' }}>
                        {cat.parent_id ? '↳ ' : ''}{cat.name}
                      </td>
                      <td>{cat.parent?.name || '—'}</td>
                      <td>{cat.expenses_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-slide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modalType === 'expense' ? 'Add Expense' : 'Add Category'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              {modalType === 'expense' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <CustomSelect
                      options={categories}
                      value={form.category_id}
                      onChange={(val) => setForm({ ...form, category_id: val })}
                      placeholder="Select category"
                      isSearchable={true}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Amount (QAR)</label>
                      <input type="number" step="0.01" className="form-input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Category Name</label>
                    <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Parent Category (optional)</label>
                    <CustomSelect
                      options={headCategories}
                      value={form.parent_id}
                      onChange={(val) => setForm({ ...form, parent_id: val })}
                      placeholder="None (Head Category)"
                      isSearchable={false}
                    />
                  </div>
                </>
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
