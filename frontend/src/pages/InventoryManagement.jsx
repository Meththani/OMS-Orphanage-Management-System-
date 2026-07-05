import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { colors, cardStyle, buttonPrimary, buttonSecondary, inputStyle, selectStyle, tableStyle, thStyle, tdStyle, modalOverlay, modalBox } from '../styles';
import { Package, Plus, Edit2, Check } from 'lucide-react';

const emptyForm = { name: '', category: 'Food', quantity: '0', unit: 'pcs' };

export default function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Stock edit states
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState('0');

  const loadInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/inventory');
      setItems(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/inventory', {
        ...form,
        quantity: Number(form.quantity),
      });
      setShowModal(false);
      setForm(emptyForm);
      loadInventory();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await api.patch(`/inventory/${editingItem._id}`, {
        quantity: Number(editQty),
      });
      setEditingItem(null);
      loadInventory();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusColor = (status) => {
    if (status === 'in-stock') return colors.success;
    if (status === 'low-stock') return colors.warning;
    return colors.danger;
  };

  const statusGlow = (status) => {
    if (status === 'in-stock') return colors.successGlow;
    if (status === 'low-stock') return colors.warningGlow;
    return colors.dangerGlow;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, color: colors.text, fontSize: '28px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
            Inventory Management
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '15px' }}>
            Monitor food stocks, medical items, and educational supplies
          </p>
        </div>
        <button style={buttonPrimary} onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ marginRight: '6px' }} /> Add Stock Item
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', backgroundColor: colors.dangerGlow,
          border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
          color: colors.danger, fontSize: '13px', marginBottom: '16px',
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={cardStyle}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 12px',
              border: `3px solid ${colors.border}`, borderTopColor: colors.primary,
              animation: 'spin 0.8s linear infinite',
            }} />
            Loading inventory stock...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
            <p>No inventory items registered. Click &quot;Add Stock Item&quot; to get started.</p>
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Item Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Current Qty</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} style={{ transition: 'background-color 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ ...tdStyle, color: colors.text, fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Package size={16} color={colors.primary} />
                      {item.name}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px',
                      background: colors.primaryGlow, color: colors.primary,
                      fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={tdStyle}>{item.quantity} {item.unit}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px',
                      background: statusGlow(item.status),
                      color: statusColor(item.status),
                      fontWeight: 600, fontSize: '12px', textTransform: 'capitalize',
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setEditQty(item.quantity.toString());
                      }}
                      style={{ ...buttonSecondary, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 12px', fontSize: '12px' }}
                    >
                      <Edit2 size={12} /> Edit Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>Add Inventory Item</h2>
            <form onSubmit={handleCreate}>
              <input style={inputStyle} name="name" placeholder="Item name (e.g. Paracetamol, Rice)" value={form.name} onChange={handleChange} required />
              
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Category</label>
              <select style={selectStyle} name="category" value={form.category} onChange={handleChange}>
                <option value="Food">Food & Groceries</option>
                <option value="Medicine">Medicine & First Aid</option>
                <option value="Education">Education & Toys</option>
                <option value="Clothing">Clothing & Apparel</option>
                <option value="Other">Other General</option>
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Quantity</label>
                  <input type="number" style={inputStyle} name="quantity" placeholder="Initial stock" value={form.quantity} onChange={handleChange} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Unit</label>
                  <input style={inputStyle} name="unit" placeholder="e.g., kg, boxes, pcs" value={form.unit} onChange={handleChange} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" style={buttonSecondary} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={buttonPrimary} disabled={saving}>{saving ? 'Adding...' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {editingItem && (
        <div style={modalOverlay} onClick={() => setEditingItem(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>Update Stock</h2>
            <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '16px' }}>Item: <strong>{editingItem.name}</strong></p>
            <form onSubmit={handleUpdateStock}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Quantity ({editingItem.unit})</label>
              <input type="number" style={inputStyle} value={editQty} onChange={(e) => setEditQty(e.target.value)} required />
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" style={buttonSecondary} onClick={() => setEditingItem(null)}>Cancel</button>
                <button type="submit" style={buttonPrimary}>Update Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
