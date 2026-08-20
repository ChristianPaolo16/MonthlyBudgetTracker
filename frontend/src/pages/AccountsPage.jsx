import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import FinancialCard from '../components/FinancialCard';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../api/accountService';

const accountTypes = ['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'CASH', 'INVESTMENT', 'OTHER'];
const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

const emptyForm = { name: '', type: 'CHECKING', accountNumber: '', balance: '', currency: 'USD', status: 'ACTIVE' };

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getAccounts();
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load accounts', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

  const openAdd = () => {
    setEditing(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setFormData({
      name: row.name || '',
      type: row.type || 'CHECKING',
      accountNumber: row.accountNumber || '',
      balance: row.balance ?? '',
      currency: row.currency || 'USD',
      status: row.status || 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete account "${row.name}"?`)) return;
    try {
      await deleteAccount(row.id);
      fetchData();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, balance: parseFloat(formData.balance) || 0 };
      if (editing) {
        await updateAccount(editing.id, payload);
      } else {
        await createAccount(payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  const columns = [
    { key: 'name', label: 'Account Name' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => (
        <span className={`badge badge--type`}>{val}</span>
      ),
    },
    { key: 'accountNumber', label: 'Account Number' },
    {
      key: 'balance',
      label: 'Balance',
      render: (val) => (
        <span className={parseFloat(val) >= 0 ? 'text--success' : 'text--danger'}>
          {formatCurrency(val)}
        </span>
      ),
    },
    { key: 'currency', label: 'Currency' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`badge badge--${val === 'ACTIVE' ? 'success' : 'danger'}`}>
          {val}
        </span>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page__summary">
        <FinancialCard icon="$" value={formatCurrency(totalBalance)} label="Total Balance" color="primary" />
      </div>
      <div className="page__header">
        <h2 className="page__subtitle">Manage Accounts</h2>
        <button className="btn btn--primary" onClick={openAdd}>+ Add Account</button>
      </div>

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : (
        <DataTable columns={columns} data={accounts} onEdit={openEdit} onDelete={handleDelete} />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Account' : 'Add Account'}
      >
        <form onSubmit={handleSubmit}>
          <FormField
            label="Account Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Main Checking"
          />
          <FormField label="Account Type" name="type" value={formData.type} onChange={handleChange} required>
            <select className="form-field__input" name="type" value={formData.type} onChange={handleChange} required>
              {accountTypes.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </FormField>
          <FormField
            label="Account Number"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            placeholder="Optional account number"
          />
          <FormField
            label="Balance"
            name="balance"
            type="number"
            value={formData.balance}
            onChange={handleChange}
            required
            placeholder="0.00"
            step="0.01"
          />
          <FormField label="Currency" name="currency" value={formData.currency} onChange={handleChange} required>
            <select className="form-field__input" name="currency" value={formData.currency} onChange={handleChange} required>
              {currencies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Status" name="status" value={formData.status} onChange={handleChange} required>
            <select className="form-field__input" name="status" value={formData.status} onChange={handleChange} required>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="CLOSED">Closed</option>
            </select>
          </FormField>
          <div className="form-actions">
            <button className="btn btn--secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn--primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
