import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { useLanguage } from '../context/LanguageContext';
import {
  colors, cardStyle, buttonPrimary, buttonSecondary,
  inputStyle, selectStyle, tableStyle, thStyle, tdStyle, modalOverlay, modalBox,
} from '../styles';
import { Heart, Plus, Calendar, Filter } from 'lucide-react';

const emptyForm = {
  type: 'cash', donorID: '', amount: '', itemType: '', quantity: '',
  mealDate: '', mealType: 'breakfast', receiptRef: '', notes: '',
  occasion: '', menuPackage: 'standard', dietaryNotes: '',
};

export default function DonationsManagement() {
  const { t } = useLanguage();
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const query = (filter === 'all' || filter === 'donors') ? '' : `?type=${filter}`;
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

  const filterTabs = ['all', 'cash', 'goods', 'meal', 'donors'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{
            margin: 0, color: colors.text, fontSize: '28px', fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
          }}>
            {t("Donations")}
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '15px' }}>
            {t("Manage and confirm contributions")}
          </p>
        </div>
        <button style={buttonPrimary} onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ marginRight: '6px' }} /> {t("Record Donation")}
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {filterTabs.map((tabKey) => (
          <button
            key={tabKey}
            style={{
              ...(filter === tabKey ? buttonPrimary : buttonSecondary),
              padding: '8px 16px',
              fontSize: '13px',
            }}
            onClick={() => setFilter(tabKey)}
          >
            {tabKey === 'all' ? t('All Donations') : t(tabKey.charAt(0).toUpperCase() + tabKey.slice(1))}
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
            {t("Loading...")}
          </div>
        ) : filter === 'donors' ? (
          donors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
              <p>{t("No donors found.")}</p>
            </div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>{t("Donor ID")}</th>
                  <th style={thStyle}>{t("Name")}</th>
                  <th style={thStyle}>{t("Contact Details")}</th>
                  <th style={thStyle}>{t("Type")}</th>
                  <th style={thStyle}>{t("Preference")}</th>
                  <th style={thStyle}>{t("Total Contributed")}</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor) => (
                  <tr key={donor._id}
                    style={{ transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ ...tdStyle, color: colors.textSecondary, fontFamily: 'monospace' }}>
                      {donor.donorID}
                    </td>
                    <td style={{ ...tdStyle, color: colors.text, fontWeight: 600 }}>
                      {donor.name}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: '13px', color: colors.text }}>{donor.email}</div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>{donor.contactDetails}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '6px',
                        background: donor.type === 'individual' ? colors.successGlow : colors.primaryGlow,
                        color: donor.type === 'individual' ? colors.success : colors.primary,
                        fontWeight: 600, fontSize: '11px', textTransform: 'capitalize'
                      }}>
                        {donor.type}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '6px',
                        background: colors.warningGlow, color: colors.warning,
                        fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}>
                        {donor.preference || 'N/A'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: colors.success, fontWeight: 700, fontSize: '14px' }}>
                      LKR {donor.totalDonated?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : donations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💝</div>
            <p>{t("No donations found.")}</p>
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>{t("Donor")}</th>
                <th style={thStyle}>{t("Amount / Item")}</th>
                <th style={thStyle}>{t("Date")}</th>
                <th style={thStyle}>{t("Type")}</th>
                <th style={thStyle}>{t("Status")}</th>
                <th style={thStyle}>{t("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d._id}
                  style={{ transition: 'background-color 0.15s ease', cursor: 'pointer' }}
                  onClick={() => setSelectedDonation(d)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ ...tdStyle, color: colors.text, fontWeight: 600 }}>
                    {d.donorID?.name || 'Unknown Donor'}
                  </td>
                  <td style={tdStyle}>
                    <div>
                      {d.type === 'cash' && `LKR ${d.amount?.toLocaleString()}`}
                      {d.type === 'goods' && `${d.quantity} × ${d.itemType}`}
                      {d.type === 'meal' && `${d.quantity} × ${d.mealType}${d.occasion ? ` (${d.occasion})` : ''}`}
                    </div>
                    {d.proofOfPayment && d.proofOfPayment.fileData && (
                      <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(d.proofOfPayment);
                          }}
                          style={{
                            background: 'none', border: 'none', padding: 0,
                            color: colors.primary, cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          👁️ View Proof
                        </button>
                        <span style={{ color: colors.border, fontSize: '11px' }}>|</span>
                        <a
                          href={d.proofOfPayment.fileData}
                          download={d.proofOfPayment.fileName}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: colors.textMuted, textDecoration: 'none', fontSize: '11px', fontWeight: 600,
                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          📥 Download
                        </a>
                      </div>
                    )}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(d._id, 'received');
                          }}
                        >
                          ✓ Accept
                        </button>
                        <button
                          style={{ ...buttonSecondary, padding: '5px 10px', fontSize: '11px', color: colors.danger, borderColor: 'rgba(239,68,68,0.3)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(d._id, 'cancelled');
                          }}
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
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Occasion (Optional)</label>
                  <input style={inputStyle} name="occasion" placeholder="e.g. Birthday Celebration" value={form.occasion} onChange={handleChange} />
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Menu Package</label>
                  <select style={selectStyle} name="menuPackage" value={form.menuPackage} onChange={handleChange}>
                    <option value="standard">Standard Menu ($2/kid)</option>
                    <option value="special">Special Menu ($4/kid)</option>
                    <option value="feast">Feast Menu ($6/kid)</option>
                  </select>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Dietary Notes (Optional)</label>
                  <textarea style={{ ...inputStyle, minHeight: '50px', resize: 'vertical' }} name="dietaryNotes" placeholder="e.g. Vegetarian only, no seafood" value={form.dietaryNotes} onChange={handleChange} />
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

      {/* Receipt Preview Modal */}
      {previewFile && (
        <div style={modalOverlay} onClick={() => setPreviewFile(null)}>
          <div style={{ ...modalBox, width: '650px', maxWidth: '95vw', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: colors.text, fontFamily: "'Outfit', sans-serif" }}>
                📄 Receipt Preview
              </h2>
              <span style={{ fontSize: '12px', color: colors.textMuted }}>{previewFile.fileName}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, padding: '16px', borderRadius: '12px', minHeight: '200px', overflow: 'hidden' }}>
              {previewFile.fileType?.startsWith('image/') || previewFile.fileData?.startsWith('data:image/') ? (
                <img src={previewFile.fileData} alt="Receipt Proof" style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px' }} />
              ) : previewFile.fileType === 'application/pdf' || previewFile.fileData?.startsWith('data:application/pdf') ? (
                <iframe src={previewFile.fileData} title="Receipt PDF" style={{ width: '100%', height: '60vh', border: 'none', borderRadius: '8px' }}></iframe>
              ) : previewFile.fileType?.startsWith('text/') || previewFile.fileName?.endsWith('.txt') || previewFile.fileData?.startsWith('data:text/') ? (
                <pre style={{
                  width: '100%', background: '#ffffff', border: `1px solid ${colors.border}`,
                  padding: '16px', borderRadius: '8px', overflowX: 'auto', maxHeight: '60vh',
                  fontSize: '13px', color: colors.textSecondary, whiteSpace: 'pre-wrap', textAlign: 'left',
                  margin: 0, fontFamily: 'monospace'
                }}>
                  {(() => {
                    try {
                      return atob(previewFile.fileData.split(',')[1]);
                    } catch (e) {
                      return 'Error loading preview text.';
                    }
                  })()}
                </pre>
              ) : (
                <div style={{ textAlign: 'center', color: colors.textMuted }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
                  <p style={{ margin: '4px 0 12px' }}>In-browser preview is not supported for this file type.</p>
                  <a
                    href={previewFile.fileData}
                    download={previewFile.fileName}
                    style={{ ...buttonPrimary, display: 'inline-block', textDecoration: 'none' }}
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px', borderTop: `1px solid ${colors.border}`, paddingTop: '12px' }}>
              <a
                href={previewFile.fileData}
                download={previewFile.fileName}
                style={{ ...buttonSecondary, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                📥 Download
              </a>
              <button type="button" style={buttonPrimary} onClick={() => setPreviewFile(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Donation Details Modal */}
      {selectedDonation && (
        <div style={modalOverlay} onClick={() => setSelectedDonation(null)}>
          <div style={{ ...modalBox, width: '650px', maxWidth: '95vw', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: colors.text, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={20} color={colors.primary} />
                {t("Donation Details")}
              </h2>
              <span style={{
                padding: '4px 10px', borderRadius: '6px',
                background: statusGlow(selectedDonation.status),
                color: statusColor(selectedDonation.status),
                fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                {t(selectedDonation.status)}
              </span>
            </div>

            <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }}>
              {/* Grid: Donor info & Contribution Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                
                {/* Left Side: Donor Info */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '13px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{t("Donor Profile")}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Name")}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>{selectedDonation.donorID?.name || 'Unknown'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Email")}</div>
                      <div style={{ fontSize: '13px', color: colors.text }}>{selectedDonation.donorID?.email || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Contact Details")}</div>
                      <div style={{ fontSize: '13px', color: colors.text }}>{selectedDonation.donorID?.contactDetails || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Donor Type")}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: colors.primary, textTransform: 'capitalize' }}>{t(selectedDonation.donorID?.type || 'individual')}</div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Contribution details */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '13px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{t("Contribution Details")}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Donation ID")}</div>
                      <div style={{ fontSize: '13px', fontFamily: 'monospace', color: colors.textSecondary }}>{selectedDonation.donationID}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Type")}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: colors.primary, textTransform: 'uppercase' }}>{t(selectedDonation.type)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Date Logged")}</div>
                      <div style={{ fontSize: '13px', color: colors.text }}>{new Date(selectedDonation.date || selectedDonation.createdAt).toLocaleString()}</div>
                    </div>
                    {/* Conditional details based on type */}
                    {selectedDonation.type === 'cash' && (
                      <>
                        <div>
                          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Amount")}</div>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: colors.success }}>LKR {selectedDonation.amount?.toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Payment Method")}</div>
                          <div style={{ fontSize: '13px', color: colors.text, textTransform: 'capitalize' }}>{t(selectedDonation.paymentMethod || 'bank_transfer')}</div>
                        </div>
                        {selectedDonation.receiptRef && (
                          <div>
                            <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Receipt Ref")}</div>
                            <div style={{ fontSize: '13px', fontFamily: 'monospace', color: colors.text }}>{selectedDonation.receiptRef}</div>
                          </div>
                        )}
                      </>
                    )}
                    {selectedDonation.type === 'goods' && (
                      <>
                        <div>
                          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Item Type")}</div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>{selectedDonation.itemType}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Quantity")}</div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>{selectedDonation.quantity} units</div>
                        </div>
                      </>
                    )}
                    {selectedDonation.type === 'meal' && (
                      <>
                        <div>
                          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Meal Slot")}</div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text, textTransform: 'capitalize' }}>{t(selectedDonation.mealType)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Portions")}</div>
                          <div style={{ fontSize: '13px', color: colors.text }}>{selectedDonation.quantity} portions</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Menu Package")}</div>
                          <div style={{ fontSize: '13px', color: colors.text, textTransform: 'capitalize' }}>{t(selectedDonation.menuPackage)}</div>
                        </div>
                        {selectedDonation.occasion && (
                          <div>
                            <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Occasion")}</div>
                            <div style={{ fontSize: '13px', color: colors.text }}>{selectedDonation.occasion}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Dietary Notes for Meals */}
              {selectedDonation.type === 'meal' && selectedDonation.dietaryNotes && (
                <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: 'rgba(255,193,7,0.05)', border: `1px solid rgba(255,193,7,0.2)`, borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: colors.warning, fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{t("Dietary & Prep Notes")}</div>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}>{selectedDonation.dietaryNotes}</div>
                </div>
              )}

              {/* Internal Notes */}
              {selectedDonation.notes && (
                <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: colors.primaryGlow, border: `1px solid ${colors.primary}20`, borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: colors.primary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{t("Internal Notes")}</div>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}>{selectedDonation.notes}</div>
                </div>
              )}

              {/* Proof of Payment Section */}
              {selectedDonation.proofOfPayment && selectedDonation.proofOfPayment.fileData ? (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: colors.text }}>📁 {t("Bank Slip / Proof of Payment")}</span>
                    <a
                      href={selectedDonation.proofOfPayment.fileData}
                      download={selectedDonation.proofOfPayment.fileName}
                      style={{ color: colors.primary, textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {t("Download Slip")} 📥
                    </a>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    backgroundColor: colors.surface, padding: '16px', borderRadius: '12px',
                    border: `1px solid ${colors.border}`, maxHeight: '350px', overflow: 'hidden'
                  }}>
                    {selectedDonation.proofOfPayment.fileType?.startsWith('image/') || selectedDonation.proofOfPayment.fileData?.startsWith('data:image/') ? (
                      <img
                        src={selectedDonation.proofOfPayment.fileData}
                        alt="Proof of Payment"
                        style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain', borderRadius: '8px' }}
                      />
                    ) : selectedDonation.proofOfPayment.fileType === 'application/pdf' || selectedDonation.proofOfPayment.fileData?.startsWith('data:application/pdf') ? (
                      <iframe
                        src={selectedDonation.proofOfPayment.fileData}
                        title="Proof PDF"
                        style={{ width: '100%', height: '320px', border: 'none', borderRadius: '8px' }}
                      />
                    ) : (
                      <div style={{ color: colors.textMuted, fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                        Preview not available for this file type. Click download link above to view it.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                selectedDonation.type === 'cash' && selectedDonation.paymentMethod === 'bank_transfer' && (
                  <div style={{
                    marginBottom: '20px', padding: '16px', textAlign: 'center',
                    backgroundColor: colors.dangerGlow, border: `1px solid rgba(239,68,68,0.2)`,
                    borderRadius: '8px', color: colors.danger, fontSize: '13px'
                  }}>
                    ⚠️ No bank deposit slip or receipt was uploaded as proof of payment.
                  </div>
                )
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
              <div>
                {selectedDonation.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      style={{ ...buttonPrimary, background: `linear-gradient(135deg, ${colors.success}, #059669)`, boxShadow: `0 4px 12px ${colors.successGlow}`, padding: '10px 20px', fontSize: '13px' }}
                      onClick={async () => {
                        await updateStatus(selectedDonation._id, 'received');
                        setSelectedDonation(null);
                      }}
                    >
                      ✓ {t("Approve & Receive")}
                    </button>
                    <button
                      style={{ ...buttonSecondary, color: colors.danger, borderColor: 'rgba(239,68,68,0.3)', padding: '10px 20px', fontSize: '13px' }}
                      onClick={async () => {
                        await updateStatus(selectedDonation._id, 'cancelled');
                        setSelectedDonation(null);
                      }}
                    >
                      ✗ {t("Reject & Cancel")}
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                style={{ ...buttonSecondary, padding: '10px 20px', fontSize: '13px' }}
                onClick={() => setSelectedDonation(null)}
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
