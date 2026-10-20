import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/apiClient';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  colors, cardStyle, buttonPrimary, buttonSecondary, inputStyle,
  selectStyle, tableStyle, thStyle, tdStyle, modalOverlay, modalBox
} from '../styles';
import {
  Package, Plus, Edit2, Search, FileSpreadsheet, Hash,
  ArrowDownCircle, ArrowUpCircle, BarChart2, ClipboardList,
  RefreshCw, ChevronDown, ChevronUp, X, CheckCircle, AlertCircle
} from 'lucide-react';
import ModalCloseButton from '../components/ModalCloseButton';
import { exportInventoryToExcel } from '../utils/excelExport';

const emptyForm = { name: '', category: 'Food', quantity: '0', unit: 'pcs' };

/* ─── Tab labels ─── */
const TABS = [
  { key: 'stock', label: 'Stock Ledger', icon: ClipboardList },
  { key: 'report', label: 'Stock Reports', icon: BarChart2 },
];

/* ─── Utility: default date helpers ─── */
const today = () => new Date().toISOString().split('T')[0];
const firstOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

/* ─── Status helpers ─── */
const statusColor = (s) =>
  s === 'in-stock' ? colors.success : s === 'low-stock' ? colors.warning : colors.danger;
const statusGlow = (s) =>
  s === 'in-stock' ? colors.successGlow : s === 'low-stock' ? colors.warningGlow : colors.dangerGlow;

/* ─── Small badge ─── */
function Badge({ text, color, bg }) {
  return (
    <span style={{
      padding: '3px 9px', borderRadius: '6px', fontSize: '11px',
      fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
      background: bg, color,
    }}>{text}</span>
  );
}

/* ─── Report sub-tab buttons ─── */
const REPORT_TABS = [
  { key: 'opening', label: 'Opening Stock' },
  { key: 'received', label: 'Stock Received (GRN)' },
  { key: 'issued', label: 'Issued Stock' },
  { key: 'closing', label: 'Closing Stock' },
];

export default function InventoryManagement() {
  const { t } = useLanguage();
  const { user } = useAuth();

  /* ── Items & UI state ── */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('stock');
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Add item modal ── */
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  /* ── Edit stock modal ── */
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState('0');

  /* ── Receive stock (GRN) modal ── */
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveForm, setReceiveForm] = useState({ itemId: '', quantity: '', supplier: '', date: today() });
  const [receiveSaving, setReceiveSaving] = useState(false);
  const [receiveSuccess, setReceiveSuccess] = useState('');

  /* ── Issue stock modal ── */
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ itemId: '', quantity: '', issuedTo: '', purpose: '', date: today() });
  const [issueSaving, setIssueSaving] = useState(false);
  const [issueSuccess, setIssueSuccess] = useState('');

  /* ── Reports state ── */
  const [reportTab, setReportTab] = useState('opening');
  const [reportStart, setReportStart] = useState(firstOfMonth());
  const [reportEnd, setReportEnd] = useState(today());
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  /* ── Load inventory ── */
  const loadInventory = useCallback(async () => {
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
  }, []);

  useEffect(() => { loadInventory(); }, [loadInventory]);

  /* ── Preview item number ── */
  const getNextItemNumberPreview = () => {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    const yearItems = items.filter(i => i.itemNumber && i.itemNumber.startsWith(prefix));
    let maxSeq = 0;
    yearItems.forEach(i => {
      const parts = i.itemNumber.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    });
    return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
  };

  /* ── Add new item ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/inventory', { ...form, quantity: Number(form.quantity) });
      setShowAddModal(false);
      setForm(emptyForm);
      loadInventory();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── Edit stock qty ── */
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await api.patch(`/inventory/${editingItem._id}`, { quantity: Number(editQty) });
      setEditingItem(null);
      loadInventory();
    } catch (err) {
      setError(err.message);
    }
  };

  /* ── Receive stock (GRN) ── */
  const handleReceiveStock = async (e) => {
    e.preventDefault();
    setReceiveSaving(true);
    setReceiveSuccess('');
    setError('');
    try {
      const res = await api.post('/stock-movements/receipt', {
        itemId: receiveForm.itemId,
        quantity: Number(receiveForm.quantity),
        supplier: receiveForm.supplier,
        date: receiveForm.date,
      });
      setReceiveSuccess(`✔ Stock received — GRN: ${res.data.referenceNumber}`);
      setReceiveForm({ itemId: '', quantity: '', supplier: '', date: today() });
      loadInventory();
    } catch (err) {
      setError(err.message);
    } finally {
      setReceiveSaving(false);
    }
  };

  /* ── Issue stock ── */
  const handleIssueStock = async (e) => {
    e.preventDefault();
    setIssueSaving(true);
    setIssueSuccess('');
    setError('');
    try {
      const res = await api.post('/stock-movements/issue', {
        itemId: issueForm.itemId,
        quantity: Number(issueForm.quantity),
        issuedTo: issueForm.issuedTo,
        purpose: issueForm.purpose,
        date: issueForm.date,
      });
      setIssueSuccess(`✔ Stock issued — Ref: ${res.data.referenceNumber}`);
      setIssueForm({ itemId: '', quantity: '', issuedTo: '', purpose: '', date: today() });
      loadInventory();
    } catch (err) {
      setError(err.message);
    } finally {
      setIssueSaving(false);
    }
  };

  /* ── Load stock report ── */
  const loadReport = async () => {
    setReportLoading(true);
    setReportError('');
    setReportData(null);
    try {
      const res = await api.get(`/stock-movements/report?startDate=${reportStart}&endDate=${reportEnd}`);
      setReportData(res.data);
    } catch (err) {
      setReportError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  /* ── Filtered items ── */
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.itemNumber && item.itemNumber.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  /* ── Selected item helper for issue modal ── */
  const selectedIssueItem = items.find(i => i._id === issueForm.itemId);
  const selectedReceiveItem = items.find(i => i._id === receiveForm.itemId);

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, color: colors.text, fontSize: '28px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
            {t("Inventory Management")}
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '15px' }}>
            Track stock, record receipts, issue items and view reports
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Receive Stock */}
          <button
            style={{ ...buttonSecondary, display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: colors.successGlow, borderColor: colors.success, color: colors.success, fontWeight: 700 }}
            onClick={() => { setReceiveSuccess(''); setShowReceiveModal(true); }}
          >
            <ArrowDownCircle size={16} /> Receive Stock (GRN)
          </button>

          {/* Issue Stock */}
          <button
            style={{ ...buttonSecondary, display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: colors.warningGlow, borderColor: colors.warning, color: colors.warning, fontWeight: 700 }}
            onClick={() => { setIssueSuccess(''); setShowIssueModal(true); }}
          >
            <ArrowUpCircle size={16} /> Issue Stock
          </button>

          {/* Export Excel */}
          <button
            style={{ ...buttonSecondary, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => exportInventoryToExcel(items)}
            title="Export inventory to Excel"
          >
            <FileSpreadsheet size={16} color={colors.primary} /> Export Excel
          </button>

          {/* Add Item */}
          <button style={buttonPrimary} onClick={() => { setForm(emptyForm); setShowAddModal(true); }}>
            <Plus size={16} style={{ marginRight: '6px' }} /> Add Item
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: colors.dangerGlow, border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: colors.danger, fontSize: '13px', marginBottom: '16px' }}>
          ⚠️ {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', color: colors.danger, cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'rgba(0,0,0,0.04)', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '13px', transition: 'all 0.18s ease',
              backgroundColor: activeTab === tab.key ? colors.primary : 'transparent',
              color: activeTab === tab.key ? '#fff' : colors.textMuted,
              boxShadow: activeTab === tab.key ? `0 4px 12px ${colors.primaryGlow}` : 'none',
            }}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          TAB 1 — STOCK LEDGER
      ══════════════════════════════════════════════════ */}
      {activeTab === 'stock' && (
        <>
          {/* Search */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search size={16} color={colors.textMuted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                style={{ ...inputStyle, paddingLeft: '36px', margin: 0 }}
                placeholder={t("Search by name, item no., or category...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <button style={{ ...buttonSecondary, padding: '8px 12px', fontSize: '12px' }} onClick={() => setSearchQuery('')}>{t("Clear")}</button>
            )}
          </div>

          <div style={cardStyle}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 12px', border: `3px solid ${colors.border}`, borderTopColor: colors.primary, animation: 'spin 0.8s linear infinite' }} />
                {t("Loading inventory...")}
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
                <p>{searchQuery ? `${t("No items matching")} "${searchQuery}".` : t('No inventory items yet. Click "Add Item" to get started.')}</p>
              </div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>{t("Item No.")}</th>
                    <th style={thStyle}>{t("Item Name")}</th>
                    <th style={thStyle}>{t("Category")}</th>
                    <th style={thStyle}>{t("Current Qty")}</th>
                    <th style={thStyle}>{t("Status")}</th>
                    <th style={thStyle}>{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item._id}
                      style={{ transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={tdStyle}>
                        <span style={{ fontFamily: 'monospace', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.04)', border: `1px solid ${colors.border}`, fontSize: '12px', color: colors.textSecondary }}>
                          <Hash size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                          {item.itemNumber || '—'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: colors.text, fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Package size={15} color={colors.primary} />{item.name}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <Badge text={item.category} color={colors.primary} bg={colors.primaryGlow} />
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: item.status === 'out-of-stock' ? colors.danger : colors.text }}>
                        {item.quantity} <span style={{ fontWeight: 400, color: colors.textMuted, fontSize: '12px' }}>{item.unit}</span>
                      </td>
                      <td style={tdStyle}>
                        <Badge text={item.status.replace('-', ' ')} color={statusColor(item.status)} bg={statusGlow(item.status)} />
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => { setEditingItem(item); setEditQty(item.quantity.toString()); }}
                          style={{ ...buttonSecondary, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 12px', fontSize: '12px' }}
                        >
                          <Edit2 size={12} /> Edit Qty
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════
          TAB 2 — STOCK REPORTS
      ══════════════════════════════════════════════════ */}
      {activeTab === 'report' && (
        <div>
          {/* Date range picker */}
          <div style={{ ...cardStyle, marginBottom: '20px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>{t("From Date")}</label>
                <input type="date" style={{ ...inputStyle, margin: 0, width: '160px' }} value={reportStart} onChange={(e) => setReportStart(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>{t("To Date")}</label>
                <input type="date" style={{ ...inputStyle, margin: 0, width: '160px' }} value={reportEnd} onChange={(e) => setReportEnd(e.target.value)} />
              </div>
              <button
                onClick={loadReport}
                style={{ ...buttonPrimary, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                disabled={reportLoading}
              >
                <RefreshCw size={15} style={reportLoading ? { animation: 'spin 0.8s linear infinite' } : {}} />
                {reportLoading ? t('Loading...') : t('Generate Report')}
              </button>
            </div>
          </div>

          {reportError && (
            <div style={{ padding: '12px 16px', backgroundColor: colors.dangerGlow, border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: colors.danger, fontSize: '13px', marginBottom: '16px' }}>
              ⚠️ {reportError}
            </div>
          )}

          {!reportData && !reportLoading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textMuted }}>
              <BarChart2 size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <p style={{ fontSize: '15px' }}>{t("Select a date range and click")} <strong>{t("Generate Report")}</strong> {t("to view stock reports.")}</p>
            </div>
          )}

          {reportData && (
            <>
              {/* Report sub-tabs */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {REPORT_TABS.map(rt => (
                  <button
                    key={rt.key}
                    onClick={() => setReportTab(rt.key)}
                    style={{
                      padding: '8px 16px', borderRadius: '8px', border: `1px solid ${reportTab === rt.key ? colors.primary : colors.border}`,
                      backgroundColor: reportTab === rt.key ? colors.primaryGlow : 'transparent',
                      color: reportTab === rt.key ? colors.primary : colors.textMuted,
                      fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    {t(rt.label)}
                  </button>
                ))}
              </div>

              {/* Period label */}
              <p style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '12px' }}>
                {t("Period")}: <strong>{new Date(reportStart).toLocaleDateString()}</strong> → <strong>{new Date(reportEnd).toLocaleDateString()}</strong>
              </p>

              {/* ── Opening Stock ── */}
              {reportTab === 'opening' && (
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 16px', color: colors.text, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardList size={18} color={colors.primary} /> {t("Opening Stock")}
                    <span style={{ fontSize: '12px', fontWeight: 400, color: colors.textMuted }}>({t("Stock at start of period")})</span>
                  </h3>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>{t("Item No.")}</th>
                        <th style={thStyle}>{t("Item Name")}</th>
                        <th style={thStyle}>{t("Category")}</th>
                        <th style={thStyle}>{t("Opening Qty")}</th>
                        <th style={thStyle}>{t("Unit")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.report.map((row) => (
                        <tr key={row.item._id}>
                          <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: '12px', color: colors.textSecondary }}>{row.item.itemNumber || '—'}</span></td>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{row.item.name}</td>
                          <td style={tdStyle}><Badge text={row.item.category} color={colors.primary} bg={colors.primaryGlow} /></td>
                          <td style={{ ...tdStyle, fontWeight: 700, color: row.openingStock === 0 ? colors.danger : colors.text }}>{row.openingStock}</td>
                          <td style={tdStyle}>{row.item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── Stock Received (GRN) ── */}
              {reportTab === 'received' && (
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 16px', color: colors.text, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowDownCircle size={18} color={colors.success} /> {t("Stock Received (GRN)")}
                    <span style={{ fontSize: '12px', fontWeight: 400, color: colors.textMuted }}>({reportData.movements.filter(m => m.type === 'receipt').length} {t("entries")})</span>
                  </h3>
                  {reportData.movements.filter(m => m.type === 'receipt').length === 0 ? (
                    <p style={{ color: colors.textMuted, textAlign: 'center', padding: '24px' }}>{t("No stock receipts in this period.")}</p>
                  ) : (
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>{t("GRN No.")}</th>
                          <th style={thStyle}>{t("Date")}</th>
                          <th style={thStyle}>{t("Item")}</th>
                          <th style={thStyle}>{t("Qty Received")}</th>
                          <th style={thStyle}>{t("Supplier")}</th>
                          <th style={thStyle}>{t("Recorded By")}</th>
                          <th style={thStyle}>{t("Stock After")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.movements.filter(m => m.type === 'receipt').map((m) => (
                          <tr key={m._id}>
                            <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: '12px', color: colors.success, fontWeight: 700 }}>{m.referenceNumber}</span></td>
                            <td style={tdStyle}>{new Date(m.date).toLocaleDateString()}</td>
                            <td style={{ ...tdStyle, fontWeight: 600 }}>{m.itemId?.name || '—'}</td>
                            <td style={{ ...tdStyle, color: colors.success, fontWeight: 700 }}>+{m.quantity} {m.itemId?.unit}</td>
                            <td style={tdStyle}>{m.supplier || '—'}</td>
                            <td style={tdStyle}>{m.recordedByName || '—'}</td>
                            <td style={tdStyle}>{m.stockAfter} {m.itemId?.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ── Issued Stock ── */}
              {reportTab === 'issued' && (
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 16px', color: colors.text, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowUpCircle size={18} color={colors.warning} /> {t("Issued Stock")}
                    <span style={{ fontSize: '12px', fontWeight: 400, color: colors.textMuted }}>({reportData.movements.filter(m => m.type === 'issue').length} {t("entries")})</span>
                  </h3>
                  {reportData.movements.filter(m => m.type === 'issue').length === 0 ? (
                    <p style={{ color: colors.textMuted, textAlign: 'center', padding: '24px' }}>{t("No stock issues recorded in this period.")}</p>
                  ) : (
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>{t("Issue No.")}</th>
                          <th style={thStyle}>{t("Date")}</th>
                          <th style={thStyle}>{t("Item")}</th>
                          <th style={thStyle}>{t("Qty Issued")}</th>
                          <th style={thStyle}>{t("Issued To")}</th>
                          <th style={thStyle}>{t("Purpose")}</th>
                          <th style={thStyle}>{t("Recorded By")}</th>
                          <th style={thStyle}>{t("Stock After")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.movements.filter(m => m.type === 'issue').map((m) => (
                          <tr key={m._id}>
                            <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: '12px', color: colors.warning, fontWeight: 700 }}>{m.referenceNumber}</span></td>
                            <td style={tdStyle}>{new Date(m.date).toLocaleDateString()}</td>
                            <td style={{ ...tdStyle, fontWeight: 600 }}>{m.itemId?.name || '—'}</td>
                            <td style={{ ...tdStyle, color: colors.warning, fontWeight: 700 }}>−{m.quantity} {m.itemId?.unit}</td>
                            <td style={tdStyle}>{m.issuedTo || '—'}</td>
                            <td style={tdStyle}>{m.purpose || '—'}</td>
                            <td style={tdStyle}>{m.recordedByName || '—'}</td>
                            <td style={tdStyle}>{m.stockAfter} {m.itemId?.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ── Closing Stock ── */}
              {reportTab === 'closing' && (
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 16px', color: colors.text, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} color={colors.info} /> {t("Closing Stock")}
                    <span style={{ fontSize: '12px', fontWeight: 400, color: colors.textMuted }}>{t("Remaining stock at end of period")}</span>
                  </h3>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>{t("Item No.")}</th>
                        <th style={thStyle}>{t("Item Name")}</th>
                        <th style={thStyle}>{t("Category")}</th>
                        <th style={thStyle}>{t("Opening")}</th>
                        <th style={thStyle}>+ {t("Received")}</th>
                        <th style={thStyle}>− {t("Issued")}</th>
                        <th style={thStyle}>{t("Closing Stock")}</th>
                        <th style={thStyle}>{t("Status")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.report.map((row) => (
                        <tr key={row.item._id}>
                          <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: '12px', color: colors.textSecondary }}>{row.item.itemNumber || '—'}</span></td>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{row.item.name}</td>
                          <td style={tdStyle}><Badge text={row.item.category} color={colors.primary} bg={colors.primaryGlow} /></td>
                          <td style={tdStyle}>{row.openingStock}</td>
                          <td style={{ ...tdStyle, color: colors.success, fontWeight: 600 }}>+{row.totalReceived}</td>
                          <td style={{ ...tdStyle, color: colors.warning, fontWeight: 600 }}>−{row.totalIssued}</td>
                          <td style={{ ...tdStyle, fontWeight: 800, fontSize: '15px', color: row.closingStock === 0 ? colors.danger : colors.text }}>
                            {row.closingStock} <span style={{ fontWeight: 400, fontSize: '12px', color: colors.textMuted }}>{row.item.unit}</span>
                          </td>
                          <td style={tdStyle}><Badge text={row.item.status.replace('-', ' ')} color={statusColor(row.item.status)} bg={statusGlow(row.item.status)} /></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: `2px solid ${colors.border}` }}>
                        <td colSpan={3} style={{ ...tdStyle, fontWeight: 700, paddingTop: '12px' }}>{t("TOTALS")}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, paddingTop: '12px' }}>{reportData.report.reduce((s, r) => s + r.openingStock, 0)}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: colors.success, paddingTop: '12px' }}>+{reportData.report.reduce((s, r) => s + r.totalReceived, 0)}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: colors.warning, paddingTop: '12px' }}>−{reportData.report.reduce((s, r) => s + r.totalIssued, 0)}</td>
                        <td style={{ ...tdStyle, fontWeight: 800, fontSize: '15px', paddingTop: '12px' }}>{reportData.report.reduce((s, r) => s + r.closingStock, 0)}</td>
                        <td style={tdStyle}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL: Add Item
      ══════════════════════════════════════════════════ */}
      {showAddModal && (
        <div style={modalOverlay}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>{t("Add Inventory Item")}</h2>
              <ModalCloseButton onClick={() => setShowAddModal(false)} />
            </div>

            {/* Auto-number preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', marginBottom: '16px', backgroundColor: colors.primaryGlow, border: `1px solid ${colors.primary}40` }}>
              <Hash size={18} color={colors.primary} />
              <div>
                <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Auto-Generated Item Number")}</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '16px', color: colors.primary, letterSpacing: '0.05em' }}>{getNextItemNumberPreview()}</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '11px', color: colors.textMuted, textAlign: 'right' }}>{t("Assigned on save")}</div>
            </div>

            <form onSubmit={handleCreate}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{t("Item Name")} *</label>
              <input style={inputStyle} name="name" placeholder={t("e.g. Paracetamol, Rice")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{t("Category")} *</label>
              <select style={selectStyle} name="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Food">{t("Food & Groceries")}</option>
                <option value="Medicine">{t("Medicine & First Aid")}</option>
                <option value="Education">{t("Education & Toys")}</option>
                <option value="Clothing">{t("Clothing & Apparel")}</option>
                <option value="Other">{t("Other General")}</option>
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{t("Initial Quantity")} *</label>
                  <input type="number" style={inputStyle} name="quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{t("Unit")} *</label>
                  <input style={inputStyle} name="unit" placeholder={t("kg, boxes, pcs...")} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" style={buttonSecondary} onClick={() => setShowAddModal(false)}>{t("Cancel")}</button>
                <button type="submit" style={buttonPrimary} disabled={saving}>{saving ? t('Adding...') : t('Add Item')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL: Edit Stock Qty
      ══════════════════════════════════════════════════ */}
      {editingItem && (
        <div style={modalOverlay}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>{t("Edit Stock Quantity")}</h2>
              <ModalCloseButton onClick={() => setEditingItem(null)} />
            </div>
            <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '4px' }}>{t("Item")}: <strong>{editingItem.name}</strong></p>
            {editingItem.itemNumber && <p style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '16px', fontFamily: 'monospace' }}>{editingItem.itemNumber}</p>}
            <form onSubmit={handleUpdateStock}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{t("Quantity")} ({editingItem.unit}) *</label>
              <input type="number" style={inputStyle} value={editQty} onChange={(e) => setEditQty(e.target.value)} required />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" style={buttonSecondary} onClick={() => setEditingItem(null)}>{t("Cancel")}</button>
                <button type="submit" style={buttonPrimary}>{t("Update")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL: Receive Stock (GRN)
      ══════════════════════════════════════════════════ */}
      {showReceiveModal && (
        <div style={modalOverlay}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: colors.text, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowDownCircle size={20} color={colors.success} /> {t("Receive Stock — GRN")}
              </h2>
              <ModalCloseButton onClick={() => { setShowReceiveModal(false); setReceiveSuccess(''); }} />
            </div>

            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '16px' }}>
              {t("A GRN number will be auto-assigned when saved.")}
            </p>

            {receiveSuccess && (
              <div style={{ padding: '12px 14px', backgroundColor: colors.successGlow, border: `1px solid ${colors.success}40`, borderRadius: '10px', marginBottom: '16px', color: colors.success, fontWeight: 600, fontSize: '13px' }}>
                {receiveSuccess}
              </div>
            )}

            <form onSubmit={handleReceiveStock}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{t("Item")} *</label>
              <select style={selectStyle} value={receiveForm.itemId} onChange={(e) => setReceiveForm({ ...receiveForm, itemId: e.target.value })} required>
                <option value="">— {t("Select item")} —</option>
                {items.map(i => (
                  <option key={i._id} value={i._id}>{i.itemNumber ? `[${i.itemNumber}] ` : ''}{i.name} ({i.quantity} {i.unit} {t("in stock")})</option>
                ))}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{t("Quantity Received")} *</label>
                  <input type="number" min="1" style={inputStyle} placeholder="0" value={receiveForm.quantity} onChange={(e) => setReceiveForm({ ...receiveForm, quantity: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{t("Date")} *</label>
                  <input type="date" style={inputStyle} value={receiveForm.date} onChange={(e) => setReceiveForm({ ...receiveForm, date: e.target.value })} required />
                </div>
              </div>

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{t("Supplier / Source")}</label>
              <input style={inputStyle} placeholder={t("e.g. Keells Holdings, Donation Drive")} value={receiveForm.supplier} onChange={(e) => setReceiveForm({ ...receiveForm, supplier: e.target.value })} />

              {selectedReceiveItem && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: colors.successGlow, border: `1px solid ${colors.success}30`, fontSize: '13px', color: colors.success, marginBottom: '8px' }}>
                  {t("Current stock")}: <strong>{selectedReceiveItem.quantity} {selectedReceiveItem.unit}</strong>
                  {receiveForm.quantity && <> → {t("After receipt")}: <strong>{selectedReceiveItem.quantity + Number(receiveForm.quantity)} {selectedReceiveItem.unit}</strong></>}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" style={buttonSecondary} onClick={() => { setShowReceiveModal(false); setReceiveSuccess(''); }}>{t("Close")}</button>
                <button type="submit" style={{ ...buttonPrimary, backgroundColor: colors.success, borderColor: colors.success, boxShadow: `0 4px 14px ${colors.successGlow}` }} disabled={receiveSaving}>
                  {receiveSaving ? t('Saving...') : t('Save Receipt (GRN)')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL: Issue Stock
      ══════════════════════════════════════════════════ */}
      {showIssueModal && (
        <div style={modalOverlay}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: colors.text, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowUpCircle size={20} color={colors.warning} /> {t("Issue Stock")}
              </h2>
              <ModalCloseButton onClick={() => { setShowIssueModal(false); setIssueSuccess(''); }} />
            </div>

            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '16px' }}>
              {t("An issue number will be auto-assigned. The item's stock will be deducted automatically.")}
            </p>

            {issueSuccess && (
              <div style={{ padding: '12px 14px', backgroundColor: colors.warningGlow, border: `1px solid ${colors.warning}40`, borderRadius: '10px', marginBottom: '16px', color: colors.warning, fontWeight: 600, fontSize: '13px' }}>
                {issueSuccess}
              </div>
            )}

            <form onSubmit={handleIssueStock}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{t("Item")} *</label>
              <select style={selectStyle} value={issueForm.itemId} onChange={(e) => setIssueForm({ ...issueForm, itemId: e.target.value })} required>
                <option value="">— {t("Select item")} —</option>
                {items.filter(i => i.quantity > 0).map(i => (
                  <option key={i._id} value={i._id}>{i.itemNumber ? `[${i.itemNumber}] ` : ''}{i.name} ({i.quantity} {i.unit} {t("available")})</option>
                ))}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{t("Quantity to Issue")} *</label>
                  <input type="number" min="1" max={selectedIssueItem?.quantity || undefined} style={inputStyle} placeholder="0" value={issueForm.quantity} onChange={(e) => setIssueForm({ ...issueForm, quantity: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{t("Date")} *</label>
                  <input type="date" style={inputStyle} value={issueForm.date} onChange={(e) => setIssueForm({ ...issueForm, date: e.target.value })} required />
                </div>
              </div>

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{t("Issued To")} *</label>
              <input style={inputStyle} placeholder={t("e.g. Kitchen Staff, Nurse, Teacher")} value={issueForm.issuedTo} onChange={(e) => setIssueForm({ ...issueForm, issuedTo: e.target.value })} required />

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{t("Purpose / Reason")}</label>
              <input style={inputStyle} placeholder={t("e.g. Weekly meal preparation, First aid kit restock")} value={issueForm.purpose} onChange={(e) => setIssueForm({ ...issueForm, purpose: e.target.value })} />

              {selectedIssueItem && issueForm.quantity && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: colors.warningGlow, border: `1px solid ${colors.warning}30`, fontSize: '13px', color: Number(issueForm.quantity) > selectedIssueItem.quantity ? colors.danger : colors.warning, marginBottom: '8px' }}>
                  {Number(issueForm.quantity) > selectedIssueItem.quantity
                    ? `⚠️ ${t("Insufficient stock! Available")}: ${selectedIssueItem.quantity} ${selectedIssueItem.unit}`
                    : <>{t("Current")}: <strong>{selectedIssueItem.quantity} {selectedIssueItem.unit}</strong> → {t("After issue")}: <strong>{selectedIssueItem.quantity - Number(issueForm.quantity)} {selectedIssueItem.unit}</strong></>
                  }
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" style={buttonSecondary} onClick={() => { setShowIssueModal(false); setIssueSuccess(''); }}>{t("Close")}</button>
                <button type="submit"
                  style={{ ...buttonPrimary, background: `linear-gradient(135deg, ${colors.warning}, #d97706)`, boxShadow: `0 4px 14px ${colors.warningGlow}` }}
                  disabled={issueSaving || (selectedIssueItem && Number(issueForm.quantity) > selectedIssueItem.quantity)}
                >
                  {issueSaving ? t('Saving...') : t('Record Issue')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
