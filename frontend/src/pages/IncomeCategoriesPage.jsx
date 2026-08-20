import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import {
  getIncomeCategories,
  createIncomeCategory,
  updateIncomeCategory,
  deleteIncomeCategory,
} from '../api/incomeCategoryService';

const emptyForm = { name: '', description: '', color: '#27ae60' };

export default function IncomeCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getIncomeCategories();
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setCategories(data);
    } catch (err) {
      console.error('Failed to load income categories', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditing(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setFormData({ name: row.name || '', description: row.description || '', color: row.color || '#27ae60' });
    setModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete category "${row.name}"?`)) return;
    try {
      await deleteIncomeCategory(row.id);
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
      if (editing) {
        await updateIncomeCategory(editing.id, formData);
      } else {
        await createIncomeCategory(formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'color',
      label: 'Color',
      sortable: false,
      render: (val) => (
        <span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: 4, backgroundColor: val || '#333', verticalAlign: 'middle' }} />
      ),
    },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__subtitle">Manage Income Categories</h2>
        <button className="btn btn--primary" onClick={openAdd}>+ Add Category</button>
      </div>

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : (
        <DataTable columns={columns} data={categories} onEdit={openEdit} onDelete={handleDelete} />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Income Category' : 'Add Income Category'}
        size="small"
      >
        <form onSubmit={handleSubmit}>
          <FormField
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Salary"
          />
          <FormField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional description"
          />
          <FormField label="Color" name="color" value={formData.color} onChange={handleChange}>
            <input
              className="form-field__input"
              id="color"
              name="color"
              type="color"
              value={formData.color}
              onChange={handleChange}
              style={{ height: 42, padding: '4px 8px', cursor: 'pointer' }}
            />
          </FormField>
          <div className="form-actions">
            <button className="btn btn--secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn--primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
