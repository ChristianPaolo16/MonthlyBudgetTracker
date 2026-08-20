import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { getBudgetGoals, createBudgetGoal, updateBudgetGoal, deleteBudgetGoal } from '../api/budgetGoalService';
import { getExpenseCategories } from '../api/expenseCategoryService';
import { getExpenses } from '../api/expenseService';

export default function BudgetGoalsPage() {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [actualExpenses, setActualExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const emptyForm = { categoryId: '', amount: '', month: selectedMonth, year: selectedYear };
  const [formData, setFormData] = useState(emptyForm);

  const fetchAll = useCallback(async () => {
    try {
      const [goalsRes, catRes, expRes] = await Promise.all([
        getBudgetGoals({ month: selectedMonth, year: selectedYear }),
        getExpenseCategories(),
        getExpenses({ month: selectedMonth, year: selectedYear }),
      ]);
      const gData = Array.isArray(goalsRes.data) ? goalsRes.data : goalsRes.data.content || [];
      setGoals(gData);
      const cData = Array.isArray(catRes.data) ? catRes.data : catRes.data.content || [];
      setCategories(cData);
      const eData = Array.isArray(expRes.data) ? expRes.data : expRes.data.content || [];
      setActualExpenses(eData);
    } catch (err) {
      console.error('Failed to load budget goals', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const formatCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

  const getActualSpending = (categoryId) => {
    return actualExpenses
      .filter((e) => e.categoryId === categoryId)
      .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  };

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || 'Unknown';

  const openAdd = () => {
    setEditing(null);
    setFormData({ categoryId: '', amount: '', month: selectedMonth, year: selectedYear });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setFormData({
      categoryId: row.categoryId || '',
      amount: row.amount ?? '',
      month: row.month || selectedMonth,
      year: row.year || selectedYear,
    });
    setModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this budget goal?')) return;
    try { await deleteBudgetGoal(row.id); fetchAll(); } catch (err) { console.error(err); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId) || formData.categoryId,
        amount: parseFloat(formData.amount) || 0,
        month: selectedMonth,
        year: selectedYear,
      };
      if (editing) { await updateBudgetGoal(editing.id, payload); } else { await createBudgetGoal(payload); }
      setModalOpen(false);
      fetchAll();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years = [2024, 2025, 2026, 2027];

  const goalsWithActual = goals.map((g) => {
    const actual = getActualSpending(g.categoryId);
    const budget = parseFloat(g.amount) || 0;
    const remaining = budget - actual;
    const pct = budget > 0 ? Math.min((actual / budget) * 100, 100) : 0;
    return { ...g, actual, remaining, pct };
  });

  const columns = [
    {
      key: 'categoryId', label: 'Category',
      render: (val) => getCategoryName(val),
    },
    {
      key: 'amount', label: 'Budget Amount',
      render: (val) => formatCurrency(val),
    },
    {
      key: 'id', label: 'Actual Spending',
      render: (_, row) => formatCurrency(row.actual),
    },
    {
      key: 'id', label: 'Remaining',
      render: (_, row) => (
        <span className={row.remaining >= 0 ? 'text--success' : 'text--danger'}>
          {formatCurrency(row.remaining)}
        </span>
      ),
    },
    {
      key: 'id', label: 'Progress',
      sortable: false,
      render: (_, row) => (
        <div className="progress-bar-wrapper">
          <div className="progress-bar">
            <div
              className={`progress-bar__fill ${row.pct >= 90 ? 'progress-bar__fill--warning' : row.pct >= 100 ? 'progress-bar__fill--danger' : ''}`}
              style={{ width: `${Math.min(row.pct, 100)}%` }}
            />
          </div>
          <span className="progress-bar__label">{row.pct.toFixed(0)}%</span>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page__filters">
        <FormField label="Month" name="selectedMonth">
          <select className="form-field__input form-field__input--filter" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </FormField>
        <FormField label="Year" name="selectedYear">
          <select className="form-field__input form-field__input--filter" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </FormField>
      </div>

      <div className="page__header">
        <h2 className="page__subtitle">Budget Goals - {months[selectedMonth - 1]} {selectedYear}</h2>
        <button className="btn btn--primary" onClick={openAdd}>+ Add Budget Goal</button>
      </div>

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : (
        <DataTable columns={columns} data={goalsWithActual} onEdit={openEdit} onDelete={handleDelete} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Budget Goal' : 'Add Budget Goal'} size="small">
        <form onSubmit={handleSubmit}>
          <FormField label="Category" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
            <select className="form-field__input" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Budget Amount" name="amount" type="number" value={formData.amount} onChange={handleChange} required step="0.01" min="0" placeholder="0.00" />
          <div className="form-actions">
            <button className="btn btn--secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn--primary" type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
