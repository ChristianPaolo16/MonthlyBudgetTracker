import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import FinancialCard from '../components/FinancialCard';
import { getInvestments, createInvestment, updateInvestment, deleteInvestment } from '../api/investmentService';

const investmentTypes = ['STOCKS', 'BONDS', 'MUTUAL_FUNDS', 'ETF', 'REAL_ESTATE', 'CRYPTO', 'FIXED_DEPOSIT', 'OTHER'];
const statuses = ['ACTIVE', 'SOLD', 'CLOSED'];

const emptyForm = {
  name: '', type: 'STOCKS', amountInvested: '', currentValue: '',
  expectedReturnRate: '', actualReturnRate: '', status: 'ACTIVE',
  purchaseDate: new Date().toISOString().split('T')[0],
};

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getInvestments();
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setInvestments(data);
    } catch (err) {
      console.error('Failed to load investments', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalInvested = investments.reduce((s, i) => s + (parseFloat(i.amountInvested) || 0), 0);
  const totalValue = investments.reduce((s, i) => s + (parseFloat(i.currentValue) || 0), 0);
  const totalReturns = totalValue - totalInvested;
  const activeCount = investments.filter((i) => i.status === 'ACTIVE').length;
  const formatCurrency = (v) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v || 0);
  const formatPct = (v) => v != null ? `${parseFloat(v).toFixed(2)}%` : 'N/A';

  const openAdd = () => { setEditing(null); setFormData(emptyForm); setModalOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setFormData({
      name: row.name || '', type: row.type || 'STOCKS',
      amountInvested: row.amountInvested ?? '', currentValue: row.currentValue ?? '',
      expectedReturnRate: row.expectedReturnRate ?? '', actualReturnRate: row.actualReturnRate ?? '',
      status: row.status || 'ACTIVE', purchaseDate: row.purchaseDate || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete investment "${row.name}"?`)) return;
    try { await deleteInvestment(row.id); fetchData(); } catch (err) { console.error(err); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        amountInvested: parseFloat(formData.amountInvested) || 0,
        currentValue: parseFloat(formData.currentValue) || 0,
        expectedReturnRate: parseFloat(formData.expectedReturnRate) || null,
        actualReturnRate: parseFloat(formData.actualReturnRate) || null,
      };
      if (editing) { await updateInvestment(editing.id, payload); } else { await createInvestment(payload); }
      setModalOpen(false);
      fetchData();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type', render: (v) => <span className="badge">{v?.replace('_', ' ')}</span> },
    { key: 'amountInvested', label: 'Amount Invested', render: (v) => formatCurrency(v) },
    { key: 'currentValue', label: 'Current Value', render: (v) => formatCurrency(v) },
    {
      key: 'id', label: 'Return %',
      render: (_, row) => {
        const inv = parseFloat(row.amountInvested) || 0;
        const cur = parseFloat(row.currentValue) || 0;
        const pct = inv > 0 ? ((cur - inv) / inv * 100) : 0;
        return <span className={pct >= 0 ? 'text--success' : 'text--danger'}>{pct.toFixed(2)}%</span>;
      },
    },
    {
      key: 'status', label: 'Status',
      render: (v) => <span className={`badge badge--${v === 'ACTIVE' ? 'success' : v === 'SOLD' ? 'gold' : 'danger'}`}>{v}</span>,
    },
    { key: 'purchaseDate', label: 'Purchase Date' },
  ];

  return (
    <div className="page">
      <div className="page__summary">
        <FinancialCard icon="₱" value={formatCurrency(totalInvested)} label="Total Invested" color="primary" />
        <FinancialCard icon="₱" value={formatCurrency(totalValue)} label="Current Value" color="gold" />
        <FinancialCard icon="₱" value={formatCurrency(totalReturns)} label="Total Returns" color={totalReturns >= 0 ? 'success' : 'danger'} />
        <FinancialCard icon="#" value={activeCount} label="Active Investments" color="primary" />
      </div>

      <div className="page__header">
        <h2 className="page__subtitle">Investments</h2>
        <button className="btn btn--primary" onClick={openAdd}>+ Add Investment</button>
      </div>

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : (
        <DataTable columns={columns} data={investments} onEdit={openEdit} onDelete={handleDelete} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Investment' : 'Add Investment'}>
        <form onSubmit={handleSubmit}>
          <FormField label="Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Apple Stock" />
          <FormField label="Type" name="type" value={formData.type} onChange={handleChange} required>
            <select className="form-field__input" name="type" value={formData.type} onChange={handleChange} required>
              {investmentTypes.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </FormField>
          <FormField label="Amount Invested" name="amountInvested" type="number" value={formData.amountInvested} onChange={handleChange} required step="0.01" min="0" />
          <FormField label="Current Value" name="currentValue" type="number" value={formData.currentValue} onChange={handleChange} required step="0.01" min="0" />
          <FormField label="Expected Return Rate (%)" name="expectedReturnRate" type="number" value={formData.expectedReturnRate} onChange={handleChange} step="0.01" placeholder="Optional" />
          <FormField label="Actual Return Rate (%)" name="actualReturnRate" type="number" value={formData.actualReturnRate} onChange={handleChange} step="0.01" placeholder="Optional" />
          <FormField label="Status" name="status" value={formData.status} onChange={handleChange} required>
            <select className="form-field__input" name="status" value={formData.status} onChange={handleChange} required>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="Purchase Date" name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} required />
          <div className="form-actions">
            <button className="btn btn--secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn--primary" type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
