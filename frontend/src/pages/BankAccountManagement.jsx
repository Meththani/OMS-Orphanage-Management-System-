import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { colors, cardStyle, buttonPrimary, buttonSecondary, inputStyle, selectStyle, modalOverlay, modalBox } from '../styles';
import { Landmark, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';

const emptyForm = { accountName: '', bankName: '', accountNumber: '', initialBalance: '0' };

export default function BankAccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/finances/bank-accounts');
      setAccounts(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/finances/bank-accounts', {
        ...form,
        initialBalance: Number(form.initialBalance),
      });
      setShowModal(false);
      setForm(emptyForm);
      loadAccounts();
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
            Bank Accounts
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '15px' }}>
            Manage organizational bank accounts, checking balances and ledger connections
          </p>
        </div>
        <button style={buttonPrimary} onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ marginRight: '6px' }} /> Add Bank Account
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 12px',
            border: `3px solid ${colors.border}`, borderTopColor: colors.primary,
            animation: 'spin 0.8s linear infinite',
          }} />
          Loading bank accounts...
        </div>
      ) : accounts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏦</div>
          <p>No registered bank accounts. Click &quot;Add Bank Account&quot; to set one up.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {accounts.map((acc) => (
            <div
              key={acc._id}
              style={{
                ...cardStyle,
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.015) 0%, rgba(99, 102, 241, 0.03) 100%)`,
                border: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '28px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              {/* Decorative Watermark Landmark Icon */}
              <Landmark size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.03, pointerEvents: 'none' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: 0 }}>
                    {acc.accountName}
                  </h3>
                  <div style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '2px' }}>
                    {acc.bankName}
                  </div>
                </div>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px', background: colors.primaryGlow,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Landmark size={18} color={colors.primary} />
                </div>
              </div>

              <div style={{ margin: '12px 0' }}>
                <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Account Number
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'monospace', color: colors.textSecondary, marginTop: '2px' }}>
                  {acc.accountNumber}
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: colors.textMuted }}>Current Balance</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: colors.success, marginTop: '2px', fontFamily: "'Outfit', sans-serif" }}>
                    LKR {acc.balance?.toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: colors.textMuted }}>Initial Balance</div>
                  <div style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '2px' }}>
                    LKR {acc.initialBalance?.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Bank Account Modal */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>Add Bank Account</h2>
            <form onSubmit={handleCreate}>
              <input style={inputStyle} name="accountName" placeholder="Account Name (e.g. Donation Fund, Savings)" value={form.accountName} onChange={handleChange} required />
              <input style={inputStyle} name="bankName" placeholder="Bank Name (e.g. Ceylon National Bank)" value={form.bankName} onChange={handleChange} required />
              <input style={inputStyle} name="accountNumber" placeholder="Account Number" value={form.accountNumber} onChange={handleChange} required />
              
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Initial Balance (LKR)</label>
              <input type="number" style={inputStyle} name="initialBalance" placeholder="Initial balance" value={form.initialBalance} onChange={handleChange} required />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" style={buttonSecondary} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={buttonPrimary} disabled={saving}>{saving ? 'Saving...' : 'Add Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
