import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { colors, cardStyle, buttonPrimary, buttonSecondary, inputStyle, selectStyle, tableStyle, thStyle, tdStyle, modalOverlay, modalBox } from '../styles';
import { Plus, Calendar } from 'lucide-react';

const emptyForm = { category: 'Food & Nutrition', customCategory: '', amount: '', referenceReceipt: '', description: '', bankAccountId: '', proofOfReceipt: null };

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ amount: '', referenceReceipt: '', customCategory: '' });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [expenseRes, incomeRes, bankRes] = await Promise.all([
        api.get('/finances/expenses'),
        api.get('/finances/income'),
        api.get('/finances/bank-accounts'),
      ]);
      setExpenses(expenseRes.data);
      setIncomes(incomeRes.data);
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

  const openModal = () => {
    setForm({ ...emptyForm, bankAccountId: bankAccounts[0]?._id || '' });
    setFieldErrors({ amount: '', referenceReceipt: '', customCategory: '' });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFieldErrors({ amount: '', referenceReceipt: '', customCategory: '' });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'amount') {
      setFieldErrors((prev) => ({ ...prev, amount: '' }));
    }
    if (name === 'referenceReceipt') {
      setFieldErrors((prev) => ({ ...prev, referenceReceipt: '' }));
    }
    if (name === 'customCategory') {
      setFieldErrors((prev) => ({ ...prev, customCategory: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File "${file.name}" is too large. Maximum allowed size is ${MAX_SIZE_MB}MB.`);
      e.target.value = '';
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        proofOfReceipt: {
          fileData: reader.result,
          fileName: file.name,
          fileType: file.type,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    
    const newErrors = { amount: '', referenceReceipt: '', customCategory: '' };
    let hasError = false;

    // customCategory validation
    if (form.category === 'Other' && (!form.customCategory || !form.customCategory.trim())) {
      newErrors.customCategory = 'Please specify the category.';
      hasError = true;
    }

    // Amount validation
    const rawAmount = form.amount ? form.amount.toString().trim() : '';
    const cleanAmount = rawAmount.replace(/,/g, '');

    if (!cleanAmount) {
      newErrors.amount = 'Amount is required.';
      hasError = true;
    } else {
      if (!/^\d+(\.\d+)?$/.test(cleanAmount)) {
        newErrors.amount = 'Amount must be a valid positive number without special characters or letters.';
        hasError = true;
      } else {
        const num = Number(cleanAmount);
        if (num <= 0) {
          newErrors.amount = 'Amount must be greater than zero.';
          hasError = true;
        }
      }
    }

    // Reference validation
    if (form.referenceReceipt && form.referenceReceipt.trim()) {
      const refClean = form.referenceReceipt.trim();
      const refRegex = /^[a-zA-Z0-9\-_/]+$/;
      if (!refRegex.test(refClean)) {
        newErrors.referenceReceipt = 'Receipt reference can only contain alphanumeric characters, hyphens, underscores, or slashes.';
        hasError = true;
      }
    }

    setFieldErrors(newErrors);
    if (hasError) return;

    const numericAmount = Number(cleanAmount);

    // Quick client-side balance validation
    const chosenAcc = bankAccounts.find(a => a._id === form.bankAccountId);
    if (chosenAcc && chosenAcc.balance < numericAmount) {
      setError(`Insufficient balance in ${chosenAcc.bankName} (${chosenAcc.accountName}). Available: LKR ${chosenAcc.balance.toLocaleString()}`);
      return;
    }

    setSaving(true);
    try {
      let categoryToSend = form.category;
      if (form.category === 'Other') {
        categoryToSend = form.customCategory && form.customCategory.trim()
          ? `Other: ${form.customCategory.trim()}`
          : 'Other';
      }

      await api.post('/finances/expenses', {
        category: categoryToSend,
        amount: numericAmount,
        referenceReceipt: form.referenceReceipt ? form.referenceReceipt.trim() : '',
        description: form.description,
        bankAccountId: form.bankAccountId,
        proofOfReceipt: form.proofOfReceipt || undefined,
      });
      setSuccess('Expense record saved successfully!');
      setShowModal(false);
      setForm({ ...emptyForm, bankAccountId: bankAccounts[0]?._id || '' });
      setTimeout(() => setSuccess(''), 5000);
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
            Expense Management
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '15px' }}>
            Record operational spending, salaries, medical costs, and supplies
          </p>
        </div>
        <button style={buttonPrimary} onClick={openModal}>
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

      {success && (
        <div style={{
          padding: '12px 16px', backgroundColor: colors.successGlow,
          border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px',
          color: colors.success, fontSize: '13px', marginBottom: '16px',
        }}>
          ✅ {success}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', background: colors.primaryGlow, color: colors.primary, padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                        {exp.referenceReceipt || 'N/A'}
                      </span>
                      {exp.proofOfReceipt && exp.proofOfReceipt.fileData && (
                        <a
                          href={exp.proofOfReceipt.fileData}
                          download={exp.proofOfReceipt.fileName}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '11px', color: colors.primary, textDecoration: 'underline', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          View Receipt 📄
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Expense Modal */}
      {showModal && (
        <div style={modalOverlay} onClick={closeModal}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>Record Expense</h2>
            <form onSubmit={handleCreate}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>
                Category <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select style={selectStyle} name="category" value={form.category} onChange={handleChange}>
                <option value="Food & Nutrition">Food & Nutrition</option>
                <option value="Salaries">Staff Salaries</option>
                <option value="Utility Bills">Utility Bills</option>
                <option value="Medical">Medical Care</option>
                <option value="Maintenance">Facility Maintenance</option>
                <option value="Other">Other Expenses</option>
              </select>

              {form.category === 'Other' && (
                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>
                    Specify Other Category <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    style={inputStyle}
                    name="customCategory"
                    placeholder="Describe the expense (e.g. stationery, transport)"
                    value={form.customCategory || ''}
                    onChange={handleChange}
                    required
                  />
                  {fieldErrors.customCategory && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>⚠️ {fieldErrors.customCategory}</div>}
                </div>
              )}

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', marginTop: '12px' }}>
                Amount (LKR) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="text" style={inputStyle} name="amount" placeholder="Amount in LKR (e.g. 10,000)" value={form.amount} onChange={handleChange} required />
              {fieldErrors.amount && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>⚠️ {fieldErrors.amount}</div>}

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', marginTop: '12px' }}>
                Short Description <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input style={inputStyle} name="description" placeholder="e.g. Purchase of caregiver masks, January water bill" value={form.description} onChange={handleChange} required />

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', marginTop: '12px' }}>Receipt / Ref Code</label>
              <input style={inputStyle} name="referenceReceipt" placeholder="Receipt Reference (optional)" value={form.referenceReceipt} onChange={handleChange} />
              {fieldErrors.referenceReceipt && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>⚠️ {fieldErrors.referenceReceipt}</div>}

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', marginTop: '12px' }}>
                Upload Proof of Receipt (Any Format)
              </label>
              <input
                type="file"
                style={{ ...inputStyle, padding: '8px' }}
                onChange={handleFileChange}
              />
              {form.proofOfReceipt && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '6px', background: colors.primaryGlow, padding: '6px 10px', borderRadius: '6px' }}>
                  <span>Selected: <strong>{form.proofOfReceipt.fileName}</strong></span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: colors.danger, cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => setForm(f => ({ ...f, proofOfReceipt: null }))}
                  >
                    Remove
                  </button>
                </div>
              )}

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', marginTop: '12px' }}>
                Debit Bank Account <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select style={selectStyle} name="bankAccountId" value={form.bankAccountId} onChange={handleChange}>
                {bankAccounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.bankName} - {acc.accountName} (Bal: LKR {acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '18px' }}>
                <button type="button" style={buttonSecondary} onClick={closeModal}>Cancel</button>
                <button type="submit" style={buttonPrimary} disabled={saving}>{saving ? 'Saving...' : 'Save Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
