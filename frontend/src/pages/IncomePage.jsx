import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import FinancialCard from '../components/FinancialCard';
import { getIncomes, createIncome, updateIncome, deleteIncome } from '../api/incomeService';
import { getIncomeCategories } from '../api/incomeCategoryService';
import { getAccounts } from '../api/accountService';

export default function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const now = new Date();
  const emptyForm = {
    categoryId: '',
    accountId: '',
    amount: '',
    description: '',
    date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
  };
  const [formData, setFormData] = useState(emptyForm);

  const fetchAll = useCallback(async () => {
    try {
      const [incRes, catRes, accRes] = await Promise.all([
        getIncomes({ month: filterMonth, year: filterYear }),
        getIncomeCategories(),
        getAccounts(),
      ]);
      const incData = Array.isArray(incRes.data) ? incRes.data : incRes.data.content || [];
      setIncomes(incData);
      const catData = Array.isArray(catRes.data) ? catRes.data : catRes.data.content || [];
      setCategories(catData);
      const accData = Array.isArray(accRes.data) ? accRes.data : accRes.data.content || [];
      setAccounts(accData);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  }, [filterMonth, filterYear]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totalIncome = incomes.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const formatCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || 'N/A';
  const getAccountName = (id) => accounts.find((a) => a.id === id)?.name || 'N/A';

  const openAdd = () => { setEditing(null); setFormData(emptyForm); setModalOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setFormData({
      categoryId: row.categoryId || '',
      accountId: row.accountId || '',
      amount: row.amount ?? '',
      description: row.description || '',
      date: row.date || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this income record?')) return;
    try { await deleteIncome(row.id); fetchAll(); } catch (err) { console.error(err); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) || 0, categoryId: parseInt(formData.categoryId) || formData.categoryId, accountId: parseInt(formData.accountId) || formData.accountId };
      if (editing) { await updateIncome(editing.id, payload); } else { await createIncome(payload); }
      setModalOpen(false);
      fetchAll();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years = [2024, 2025, 2026, 2027];

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'categoryId', label: 'Category', render: (val) => getCategoryName(val) },
    { key: 'accountId', label: 'Account', render: (val) => getAccountName(val) },
    { key: 'amount', label: 'Amount', render: (val) => <span className="text--success">{formatCurrency(val)}</span> },
    { key: 'description', label: 'Description' },
  ];

  return (
    <div className="page">
      <div className="page__summary">
        <FinancialCard icon="$" value={formatCurrency(totalIncome)} label="Total Income This Month" color="success" />
      </div>

      <div className="page__filters">
        <FormField label="Month" name="filterMonth">
          <select className="form-field__input form-field__input--filter" value={filterMonth} onChange={(e) => setFilterMonth(parseInt(e.target.value))}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </FormField>
        <FormField label="Year" name="filterYear">
          <select className="form-field__input form-field__input--filter" value={filterYear} onChange={(e) => setFilterYear(parseInt(e.target.value))}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </FormField>
      </div>

      <div className="page__header">
        <h2 className="page__subtitle">Income</h2>
        <button className="btn btn--primary" onClick={openAdd}>+ Add Income</button>
      </div>

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : (
        <DataTable columns={columns} data={incomes} onEdit={openEdit} onDelete={handleDelete} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Income' : 'Add Income'}>
        <form onSubmit={handleSubmit}>
          <FormField label="Category" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
            <select className="form-field__input" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Account" name="accountId" value={formData.accountId} onChange={handleChange} required>
            <select className="form-field__input" name="accountId" value={formData.accountId} onChange={handleChange} required>
              <option value="">Select account</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </FormField>
          <FormField label="Amount" name="amount" type="number" value={formData.amount} onChange={handleChange} required placeholder="0.00" step="0.01" min="0" />
          <FormField label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Brief description" />
          <FormField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required />
          <div className="form-actions">
            <button className="btn btn--secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn--primary" type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
