import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { colors, cardStyle, buttonPrimary, buttonSecondary, inputStyle, selectStyle, tableStyle, thStyle, tdStyle, modalOverlay, modalBox } from '../styles';
import { TrendingDown, Plus, DollarSign, Calendar } from 'lucide-react';

const emptyForm = { category: 'Food & Nutrition', amount: '', referenceReceipt: '', description: '', bankAccountId: '' };

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [expenseRes, bankRes] = await Promise.all([
        api.get('/finances/expenses'),
        api.get('/finances/bank-accounts'),
      ]);
      setExpenses(expenseRes.data);
      setBankAccounts(bankRes.data);
      if (bankRes.data.length > 0) {
        setForm(f => ({ ...f, bankAccountId: bankRes.data[0]._id }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Quick client-side balance validation
    const chosenAcc = bankAccounts.find(a => a._id === form.bankAccountId);
    if (chosenAcc && chosenAcc.balance < Number(form.amount)) {
      setError(`Insufficient balance in ${chosenAcc.bankName} (${chosenAcc.accountName}). Available: LKR ${chosenAcc.balance.toLocaleString()}`);
      setSaving(false);
      return;
    }

    try {
      await api.post('/finances/expenses', {
        ...form,
        amount: Number(form.amount),
      });
      setShowModal(false);
      setForm({ ...emptyForm, bankAccountId: bankAccounts[0]?._id || '' });
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, color: colors.text, fontSize: '28px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
            Expense Management
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '15px' }}>
            Record operational spending, salaries, medical costs, and supplies
          </p>
        </div>
        <button style={buttonPrimary} onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ marginRight: '6px' }} /> Record Expense
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
            Loading expense logs...
          </div>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💸</div>
            <p>No expense logs registered. Click &quot;Record Expense&quot; to log one.</p>
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Staff Member</th>
                <th style={thStyle}>Bank Account</th>
                <th style={thStyle}>Receipt / Ref</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp._id} style={{ transition: 'background-color 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ ...tdStyle, color: colors.text }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color={colors.textSecondary} />
                      {new Date(exp.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px',
                      background: colors.dangerGlow, color: colors.danger,
                      fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {exp.category}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: colors.textSecondary }}>{exp.description}</td>
                  <td style={{ ...tdStyle, color: colors.text, fontWeight: 700 }}>
                    LKR {exp.amount?.toLocaleString()}
                  </td>
                  <td style={tdStyle}>{exp.staffName}</td>
                  <td style={tdStyle}>{exp.bankAccount?.accountName || 'Cash In Hand'}</td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', background: colors.primaryGlow, color: colors.primary, padding: '2px 6px', borderRadius: '4px' }}>
                      {exp.referenceReceipt || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Expense Modal */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>Record Expense</h2>
            <form onSubmit={handleCreate}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Category</label>
              <select style={selectStyle} name="category" value={form.category} onChange={handleChange}>
                <option value="Food & Nutrition">Food & Nutrition</option>
                <option value="Salaries">Staff Salaries</option>
                <option value="Utility Bills">Utility Bills</option>
                <option value="Medical">Medical Care</option>
                <option value="Maintenance">Facility Maintenance</option>
                <option value="Other">Other Expenses</option>
              </select>

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Amount (LKR)</label>
              <input type="number" style={inputStyle} name="amount" placeholder="Amount in LKR" value={form.amount} onChange={handleChange} required />

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Short Description</label>
              <input style={inputStyle} name="description" placeholder="e.g. Purchase of caregiver masks, January water bill" value={form.description} onChange={handleChange} required />

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Receipt / Ref Code</label>
              <input style={inputStyle} name="referenceReceipt" placeholder="Receipt Reference (optional)" value={form.referenceReceipt} onChange={handleChange} />

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Debit Bank Account</label>
              <select style={selectStyle} name="bankAccountId" value={form.bankAccountId} onChange={handleChange}>
                {bankAccounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.bankName} - {acc.accountName} (Bal: LKR {acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
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
