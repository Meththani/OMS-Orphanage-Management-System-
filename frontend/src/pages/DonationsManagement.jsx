import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import {
  colors, cardStyle, buttonPrimary, buttonSecondary,
  inputStyle, selectStyle, tableStyle, thStyle, tdStyle, modalOverlay, modalBox,
} from '../styles';
import { Heart, Plus, Calendar, Filter } from 'lucide-react';

const emptyForm = {
  type: 'cash', donorID: '', amount: '', itemType: '', quantity: '',
  mealDate: '', mealType: 'breakfast', receiptRef: '', notes: '',
};

export default function DonationsManagement() {
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const query = filter === 'all' ? '' : `?type=${filter}`;
      const [donationRes, donorRes] = await Promise.all([
        api.get(`/donations${query}`),
        api.get('/donations/donors-list'),
      ]);
      setDonations(donationRes.data);
      setDonors(donorRes.data);
      if (donorRes.data.length > 0) {
        setForm(f => ({ ...f, donorID: donorRes.data[0]._id }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (form.type === 'cash') {
        payload.amount = Number(form.amount);
      } else if (form.type === 'goods') {
        payload.quantity = Number(form.quantity);
      } else if (form.type === 'meal') {
        payload.quantity = Number(form.quantity);
        payload.mealDate = new Date(form.mealDate);
      }
      
      await api.post('/donations', payload);
      setShowModal(false);
      setForm({ ...emptyForm, donorID: donors[0]?._id || '' });
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/donations/${id}/status`, { status });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusColor = (status) => {
    if (status === 'received') return colors.success;
    if (status === 'cancelled') return colors.danger;
    return colors.warning;
  };

  const statusGlow = (status) => {
    if (status === 'received') return colors.successGlow;
    if (status === 'cancelled') return colors.dangerGlow;
    return colors.warningGlow;
  };

  const filterTabs = ['all', 'cash', 'goods', 'meal'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{
            margin: 0, color: colors.text, fontSize: '28px', fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
          }}>
            Donations
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '15px' }}>
            Manage and confirm contributions
          </p>
        </div>
        <button style={buttonPrimary} onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ marginRight: '6px' }} /> Record Donation
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {filterTabs.map((t) => (
          <button
            key={t}
            style={{
              ...(filter === t ? buttonPrimary : buttonSecondary),
              padding: '8px 16px',
              fontSize: '13px',
            }}
            onClick={() => setFilter(t)}
          >
            {t === 'all' ? 'All Donations' : `${t[0].toUpperCase()}${t.slice(1)}`}
          </button>
        ))}
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
            Loading donations...
          </div>
        ) : donations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💝</div>
            <p>No donations found. Click &quot;Record Donation&quot; to add one.</p>
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Donor</th>
                <th style={thStyle}>Amount / Item</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d._id}
                  style={{ transition: 'background-color 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ ...tdStyle, color: colors.text, fontWeight: 600 }}>
                    {d.donorID?.name || 'Unknown Donor'}
                  </td>
                  <td style={tdStyle}>
                    {d.type === 'cash' && `LKR ${d.amount?.toLocaleString()}`}
                    {d.type === 'goods' && `${d.quantity} × ${d.itemType}`}
                    {d.type === 'meal' && `${d.quantity} × ${d.mealType}`}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} color={colors.textMuted} />
                      {new Date(d.date || d.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px',
                      background: colors.primaryGlow, color: colors.primary,
                      fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {d.type}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px',
                      background: statusGlow(d.status),
                      color: statusColor(d.status),
                      fontWeight: 600, fontSize: '12px', textTransform: 'capitalize',
                    }}>
                      {d.status === 'received' ? 'Received' : d.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {d.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          style={{ ...buttonSecondary, padding: '5px 10px', fontSize: '11px', color: colors.success, borderColor: 'rgba(16,185,129,0.3)' }}
                          onClick={() => updateStatus(d._id, 'received')}
                        >
                          ✓ Accept
                        </button>
                        <button
                          style={{ ...buttonSecondary, padding: '5px 10px', fontSize: '11px', color: colors.danger, borderColor: 'rgba(239,68,68,0.3)' }}
                          onClick={() => updateStatus(d._id, 'cancelled')}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Donation Modal */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>
              Record Donation
            </h2>
            <form onSubmit={handleCreate}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Select Donor Profile</label>
              <select style={selectStyle} name="donorID" value={form.donorID} onChange={handleChange} required>
                {donors.map((donor) => (
                  <option key={donor._id} value={donor._id}>
                    {donor.name} ({donor.email})
                  </option>
                ))}
              </select>

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Donation Type</label>
              <select style={selectStyle} name="type" value={form.type} onChange={handleChange}>
                <option value="cash">Cash</option>
                <option value="goods">Goods</option>
                <option value="meal">Meal Booking</option>
              </select>

              {form.type === 'cash' && (
                <>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Amount (LKR)</label>
                  <input style={inputStyle} name="amount" type="number" placeholder="e.g. 50000" value={form.amount} onChange={handleChange} required />
                </>
              )}

              {form.type === 'goods' && (
                <>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Item Type / Name</label>
                  <input style={inputStyle} name="itemType" placeholder="e.g. Notebooks, Bed sheets" value={form.itemType} onChange={handleChange} required />
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Quantity</label>
                  <input style={inputStyle} name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
                </>
              )}

              {form.type === 'meal' && (
                <>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Meal Date</label>
                  <input style={inputStyle} name="mealDate" type="date" value={form.mealDate} onChange={handleChange} required />
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Meal Slot</label>
                  <select style={selectStyle} name="mealType" value={form.mealType} onChange={handleChange}>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Quantity (Kids portions)</label>
                  <input style={inputStyle} name="quantity" type="number" placeholder="Number of kids fed" value={form.quantity} onChange={handleChange} required />
                </>
              )}

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Receipt Reference (optional)</label>
              <input style={inputStyle} name="receiptRef" placeholder="Reference ID" value={form.receiptRef} onChange={handleChange} />
              
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Internal Notes (optional)</label>
              <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} name="notes" placeholder="Notes..." value={form.notes} onChange={handleChange} />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" style={buttonSecondary} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={buttonPrimary} disabled={saving}>{saving ? 'Saving...' : 'Save Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
