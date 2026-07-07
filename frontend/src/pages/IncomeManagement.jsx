import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { colors, cardStyle, buttonPrimary, buttonSecondary, inputStyle, selectStyle, tableStyle, thStyle, tdStyle, modalOverlay, modalBox } from '../styles';
import { Plus, Calendar } from 'lucide-react';

const emptyForm = { category: 'Donation', amount: '', paymentMethod: 'bank_transfer', donor: '', refReceipt: '', bankAccountId: '' };

export default function IncomeManagement() {
  const [incomes, setIncomes] = useState([]);
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
      const [incomeRes, expenseRes, bankRes] = await Promise.all([
        api.get('/finances/income'),
        api.get('/finances/expenses'),
        api.get('/finances/bank-accounts'),
      ]);
      setIncomes(incomeRes.data);
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
    try {
      await api.post('/finances/income', {
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

  const totalIncome = incomes.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, color: colors.text, fontSize: '28px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
            Income Management
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '15px' }}>
            Record donor support, grants, and fundraising funds
          </p>
        </div>
        <button style={buttonPrimary} onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ marginRight: '6px' }} /> Record Income
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

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '12px', color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.success }}></span>
            Total Income
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: colors.success, marginTop: '8px', fontFamily: "'Outfit', sans-serif" }}>
            LKR {totalIncome.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>{incomes.length} records logged</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: '12px', color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.danger }}></span>
            Total Expenses
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: colors.danger, marginTop: '8px', fontFamily: "'Outfit', sans-serif" }}>
            LKR {totalExpenses.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>{expenses.length} records logged</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: '12px', color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: netBalance >= 0 ? colors.primary : colors.warning }}></span>
            Net Balance
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: netBalance >= 0 ? colors.primary : colors.danger, marginTop: '8px', fontFamily: "'Outfit', sans-serif" }}>
            LKR {netBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>Overall cash flow</div>
        </div>
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 12px',
              border: `3px solid ${colors.border}`, borderTopColor: colors.primary,
              animation: 'spin 0.8s linear infinite',
            }} />
            Loading income streams...
          </div>
        ) : incomes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💵</div>
            <p>No income records logged yet. Click &quot;Record Income&quot; to register.</p>
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Payment Method</th>
                <th style={thStyle}>Donor / Sponsor</th>
                <th style={thStyle}>Bank Account</th>
                <th style={thStyle}>Receipt / Ref</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((inc) => (
                <tr key={inc._id} style={{ transition: 'background-color 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ ...tdStyle, color: colors.text }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color={colors.textSecondary} />
                      {new Date(inc.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px',
                      background: colors.successGlow, color: colors.success,
                      fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {inc.category}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: colors.text, fontWeight: 700 }}>
                    LKR {inc.amount?.toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ textTransform: 'capitalize' }}>
                      {inc.paymentMethod?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={tdStyle}>{inc.donor}</td>
                  <td style={tdStyle}>{inc.bankAccount?.accountName || 'General Balance'}</td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', background: colors.primaryGlow, color: colors.primary, padding: '2px 6px', borderRadius: '4px' }}>
                      {inc.refReceipt || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Income Modal */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>Record Income</h2>
            <form onSubmit={handleCreate}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Category</label>
              <select style={selectStyle} name="category" value={form.category} onChange={handleChange}>
                <option value="Donation">Public Donation</option>
                <option value="Grant">Government / NGO Grant</option>
                <option value="Fundraising Event">Fundraising Event</option>
                <option value="Other">Other Revenue</option>
              </select>

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Amount (LKR)</label>
              <input type="number" style={inputStyle} name="amount" placeholder="Amount in LKR" value={form.amount} onChange={handleChange} required />

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Payment Method</label>
              <select style={selectStyle} name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash In Hand</option>
                <option value="cheque">Cheque</option>
                <option value="online">Online Checkout</option>
              </select>

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Donor / Source Name</label>
              <input style={inputStyle} name="donor" placeholder="Donor name or sponsoring entity" value={form.donor} onChange={handleChange} required />

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Receipt / Txn Reference</label>
              <input style={inputStyle} name="refReceipt" placeholder="Transaction or reference code" value={form.refReceipt} onChange={handleChange} />

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Bank Account Destination</label>
              <select style={selectStyle} name="bankAccountId" value={form.bankAccountId} onChange={handleChange}>
                {bankAccounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.bankName} - {acc.accountName}
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
