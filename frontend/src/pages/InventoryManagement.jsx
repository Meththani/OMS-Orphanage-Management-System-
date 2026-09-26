import { useEffect, useState, useRef } from 'react';
import { api } from '../api/apiClient';
import { useLanguage } from '../context/LanguageContext';
import { colors, cardStyle, buttonPrimary, buttonSecondary, inputStyle, selectStyle, tableStyle, thStyle, tdStyle, modalOverlay, modalBox } from '../styles';
import { Package, Plus, Edit2, Barcode, Camera, Search, Check, Zap, Upload, Image } from 'lucide-react';
import ModalCloseButton from '../components/ModalCloseButton';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const emptyForm = { name: '', category: 'Food', quantity: '0', unit: 'pcs', barcode: '' };

export default function InventoryManagement() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Stock edit states
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState('0');
  const [editBarcode, setEditBarcode] = useState('');

  // Barcode Scanner & Auto-Fill states
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'upload' | 'manual'
  const [matchedItem, setMatchedItem] = useState(null);
  const [addQty, setAddQty] = useState('1');
  const [scannerStatus, setScannerStatus] = useState(null); // { type: 'success'|'info'|'error', text: '' }
  const [updatingStock, setUpdatingStock] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const html5QrCodeRef = useRef(null);

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

  // Optimized High-Performance Camera Barcode Reader
  useEffect(() => {
    if (showScannerModal && scanMode === 'camera') {
      let isSubscribed = true;
      const qrCodeId = "barcode-camera-viewport";

      const timer = setTimeout(() => {
        const domElement = document.getElementById(qrCodeId);
        if (!domElement) return;

        // Explicitly include all 1D product barcode formats (EAN-13, EAN-8, UPC-A, UPC-E, CODE-128, etc.)
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.QR_CODE
        ];

        const scanner = new Html5Qrcode(qrCodeId, {
          formatsToSupport,
          verbose: false
        });
        html5QrCodeRef.current = scanner;

        const scanConfig = {
          fps: 15,
          qrbox: (w, h) => {
            // Wide 1D barcode rectangular guide overlay
            const width = Math.floor(w * 0.88);
            const height = Math.floor(h * 0.45);
            return { width: Math.max(width, 220), height: Math.max(height, 120) };
          },
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        };

        const cameraConstraints = {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        };

        scanner.start(
          cameraConstraints,
          scanConfig,
          (decodedText) => {
            if (isSubscribed) {
              setScanInput(decodedText);
              handleLookupBarcode(decodedText);
              scanner.stop().catch(console.error);
              setCameraActive(false);
            }
          },
          () => {} // Ignorable scan error per frame
        ).then(() => {
          if (isSubscribed) setCameraActive(true);
        }).catch((err) => {
          console.warn("HD camera fallback:", err);
          // Fallback to basic camera configuration
          scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 140 } },
            (decodedText) => {
              if (isSubscribed) {
                setScanInput(decodedText);
                handleLookupBarcode(decodedText);
                scanner.stop().catch(console.error);
                setCameraActive(false);
              }
            },
            () => {}
          ).then(() => {
            if (isSubscribed) setCameraActive(true);
          }).catch((err2) => {
            console.warn("Camera init failed completely:", err2);
            if (isSubscribed) {
              setScannerStatus({
                type: 'info',
                text: 'Camera preview unavailable. Upload a barcode photo or type barcode manually.'
              });
              setScanMode('manual');
            }
          });
        });
      }, 300);

      return () => {
        isSubscribed = false;
        clearTimeout(timer);
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(console.error);
        }
      };
    }
  }, [showScannerModal, scanMode]);

  // Image Photo Upload Barcode Scanner Handler
  const handleImageFileScan = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setScannerStatus({ type: 'info', text: 'Scanning uploaded barcode image...' });
    try {
      const html5QrCode = new Html5Qrcode("barcode-file-viewport", {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE
        ]
      });

      const decodedText = await html5QrCode.scanFile(file, true);
      setScanInput(decodedText);
      handleLookupBarcode(decodedText);
    } catch (err) {
      console.error("Barcode photo decode error:", err);
      setScannerStatus({
        type: 'error',
        text: 'Could not detect a clear barcode in this photo. Ensure the barcode numbers are clear and well-lit, or type the code below.'
      });
    }
  };

  const handleLookupBarcode = (barcodeToSearch) => {
    const code = (barcodeToSearch !== undefined ? barcodeToSearch : scanInput).trim();
    if (!code) return;

    const found = items.find(item => item.barcode && item.barcode.trim().toLowerCase() === code.toLowerCase());
    if (found) {
      setMatchedItem(found);
      setAddQty('1');
      setScannerStatus({
        type: 'success',
        text: `Product Recognized: "${found.name}" (${found.quantity} ${found.unit} in stock). Enter quantity to add below.`
      });
    } else {
      setMatchedItem(null);
      setScannerStatus({
        type: 'info',
        text: `Barcode "${code}" not found in inventory. Pre-filling details below...`
      });
      setForm({ ...emptyForm, barcode: code });
      setShowModal(true);
    }
  };

  const handleQuickAddStock = async (e) => {
    e.preventDefault();
    if (!matchedItem) return;
    setUpdatingStock(true);
    try {
      await api.patch(`/inventory/${matchedItem._id}`, {
        addQuantity: Number(addQty),
      });
      const qtyNum = Number(addQty);
      setScannerStatus({
        type: 'success',
        text: `Successfully added +${qtyNum} ${matchedItem.unit} to "${matchedItem.name}"! New Total: ${matchedItem.quantity + qtyNum} ${matchedItem.unit}.`
      });
      setMatchedItem(prev => ({ ...prev, quantity: prev.quantity + qtyNum }));
      setAddQty('1');
      loadInventory();
    } catch (err) {
      setScannerStatus({ type: 'error', text: err.message });
    } finally {
      setUpdatingStock(false);
    }
  };

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
        barcode: editBarcode,
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

  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.barcode && item.barcode.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, color: colors.text, fontSize: '28px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
            {t("Inventory Management")}
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '15px' }}>
            {t("Track kitchen supplies, clothing, medicines, and stationery with barcode support")}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={{
              ...buttonSecondary,
              backgroundColor: colors.primaryGlow,
              borderColor: colors.primary,
              color: colors.primary,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
            }}
            onClick={() => {
              setShowScannerModal(true);
              setMatchedItem(null);
              setScanInput('');
              setScannerStatus(null);
              setScanMode('camera');
            }}
          >
            <Barcode size={18} /> Barcode Reader / Add Qty
          </button>

          <button style={buttonPrimary} onClick={() => { setForm(emptyForm); setShowModal(true); }}>
            <Plus size={16} style={{ marginRight: '6px' }} /> {t("Add Inventory Item")}
          </button>
        </div>
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

      {/* Filter & Barcode Quick Search Bar */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} color={colors.textMuted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            style={{ ...inputStyle, paddingLeft: '36px', margin: 0 }}
            placeholder="Search by item name, category, or scan barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <button
            style={{ ...buttonSecondary, padding: '8px 12px', fontSize: '12px' }}
            onClick={() => setSearchQuery('')}
          >
            Clear Search
          </button>
        )}
      </div>

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
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
            <p>{searchQuery ? `No items found matching "${searchQuery}".` : `No inventory items registered. Click "Add Inventory Item" to get started.`}</p>
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Item Name</th>
                <th style={thStyle}>Barcode</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Current Qty</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
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
                    {item.barcode ? (
                      <span style={{
                        fontFamily: 'monospace',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: `1px solid ${colors.border}`,
                        fontSize: '12px',
                        color: colors.textSecondary
                      }}>
                        <Barcode size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {item.barcode}
                      </span>
                    ) : (
                      <span style={{ color: colors.textMuted, fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px',
                      background: colors.primaryGlow, color: colors.primary,
                      fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {t(item.category)}
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
                      {t(item.status)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setEditQty(item.quantity.toString());
                        setEditBarcode(item.barcode || '');
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

      {/* Barcode Reader & Auto-Fill Modal */}
      {showScannerModal && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: colors.text, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Barcode size={22} color={colors.primary} /> Barcode Reader & Auto-Fill
              </h2>
              <ModalCloseButton onClick={() => setShowScannerModal(false)} />
            </div>

            {/* Scan Mode Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: 'rgba(0,0,0,0.25)', padding: '4px', borderRadius: '10px' }}>
              <button
                type="button"
                onClick={() => setScanMode('camera')}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: scanMode === 'camera' ? colors.primary : 'transparent',
                  color: scanMode === 'camera' ? '#ffffff' : colors.textMuted,
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <Camera size={14} /> HD Camera
              </button>

              <button
                type="button"
                onClick={() => setScanMode('upload')}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: scanMode === 'upload' ? colors.primary : 'transparent',
                  color: scanMode === 'upload' ? '#ffffff' : colors.textMuted,
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <Upload size={14} /> Upload Photo
              </button>

              <button
                type="button"
                onClick={() => setScanMode('manual')}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: scanMode === 'manual' ? colors.primary : 'transparent',
                  color: scanMode === 'manual' ? '#ffffff' : colors.textMuted,
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <Barcode size={14} /> USB / Type
              </button>
            </div>

            {/* Mode 1: Live HD Camera Viewport */}
            {scanMode === 'camera' && (
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                <div
                  id="barcode-camera-viewport"
                  style={{
                    width: '100%',
                    minHeight: '230px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#000000',
                    border: `2px dashed ${colors.primary}`,
                    position: 'relative'
                  }}
                />
                <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '8px' }}>
                  💡 <strong>Tip for 1D product barcodes (EAN/UPC):</strong> Hold product 10-20 cm away in bright light. Keep barcode horizontal inside the scan box.
                </p>
              </div>
            )}

            {/* Mode 2: Upload Photo Scanner */}
            {scanMode === 'upload' && (
              <div style={{
                marginBottom: '16px',
                padding: '24px',
                border: `2px dashed ${colors.border}`,
                borderRadius: '12px',
                textAlign: 'center',
                backgroundColor: 'rgba(255,255,255,0.02)'
              }}>
                <div id="barcode-file-viewport" style={{ display: 'none' }} />
                <Image size={36} color={colors.primary} style={{ marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 4px', color: colors.text }}>Upload Product Barcode Photo</h4>
                <p style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '14px' }}>
                  Select an image or snapshot of the product barcode from your device.
                </p>
                <label style={{
                  ...buttonPrimary,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '10px 20px'
                }}>
                  <Upload size={16} /> Select Barcode Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileScan}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}

            {/* Manual / USB Laser Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleLookupBarcode(); }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>
                Scan or Enter Barcode Number
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  style={{ ...inputStyle, margin: 0, fontFamily: 'monospace', letterSpacing: '0.05em' }}
                  placeholder="e.g., 8901234567890"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  style={{ ...buttonPrimary, padding: '0 18px', whiteSpace: 'nowrap' }}
                >
                  Lookup
                </button>
              </div>
            </form>

            {/* Status Alert */}
            {scannerStatus && (
              <div style={{
                padding: '12px 14px',
                borderRadius: '10px',
                marginBottom: '16px',
                fontSize: '13px',
                lineHeight: 1.5,
                backgroundColor: scannerStatus.type === 'success' ? colors.successGlow : scannerStatus.type === 'error' ? colors.dangerGlow : colors.primaryGlow,
                border: `1px solid ${scannerStatus.type === 'success' ? colors.success : scannerStatus.type === 'error' ? colors.danger : colors.primary}`,
                color: scannerStatus.type === 'success' ? colors.success : scannerStatus.type === 'error' ? colors.danger : colors.primary,
              }}>
                {scannerStatus.text}
              </div>
            )}

            {/* Matched Product Details & Add Quantity Form */}
            {matchedItem && (
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: `1px solid ${colors.border}`,
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: colors.text }}>{matchedItem.name}</span>
                  <span style={{
                    padding: '3px 8px', borderRadius: '6px',
                    background: colors.primaryGlow, color: colors.primary,
                    fontWeight: 600, fontSize: '11px'
                  }}>{matchedItem.category}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: colors.textSecondary, marginBottom: '16px' }}>
                  <div>Barcode: <strong style={{ color: colors.text, fontFamily: 'monospace' }}>{matchedItem.barcode || 'N/A'}</strong></div>
                  <div>Current Stock: <strong style={{ color: colors.text }}>{matchedItem.quantity} {matchedItem.unit}</strong></div>
                </div>

                <form onSubmit={handleQuickAddStock}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>
                    Enter Quantity to Add ({matchedItem.unit})
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="number"
                      min="1"
                      style={{ ...inputStyle, margin: 0, flex: 1 }}
                      value={addQty}
                      onChange={(e) => setAddQty(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      style={{ ...buttonPrimary, backgroundColor: colors.success, borderColor: colors.success }}
                      disabled={updatingStock}
                    >
                      <Zap size={15} style={{ marginRight: '4px' }} />
                      {updatingStock ? 'Updating...' : `Add +${addQty} Stock`}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="button"
                style={buttonSecondary}
                onClick={() => setShowScannerModal(false)}
              >
                Close Scanner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>Add Inventory Item</h2>
              <ModalCloseButton onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleCreate}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Barcode Number (Optional / Scanned)</label>
              <input
                style={{ ...inputStyle, fontFamily: 'monospace' }}
                name="barcode"
                placeholder="e.g. 8901234567890"
                value={form.barcode}
                onChange={handleChange}
              />

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Item Name *</label>
              <input style={inputStyle} name="name" placeholder="Item name (e.g. Paracetamol, Rice)" value={form.name} onChange={handleChange} required />

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Category *</label>
              <select style={selectStyle} name="category" value={form.category} onChange={handleChange}>
                <option value="Food">Food & Groceries</option>
                <option value="Medicine">Medicine & First Aid</option>
                <option value="Education">Education & Toys</option>
                <option value="Clothing">Clothing & Apparel</option>
                <option value="Other">Other General</option>
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Initial Quantity *</label>
                  <input type="number" style={inputStyle} name="quantity" placeholder="Initial stock" value={form.quantity} onChange={handleChange} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Unit *</label>
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
        <div style={modalOverlay}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>Update Item & Stock</h2>
              <ModalCloseButton onClick={() => setEditingItem(null)} />
            </div>
            <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '16px' }}>Item: <strong>{editingItem.name}</strong></p>
            <form onSubmit={handleUpdateStock}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Barcode Number</label>
              <input
                style={{ ...inputStyle, fontFamily: 'monospace' }}
                value={editBarcode}
                onChange={(e) => setEditBarcode(e.target.value)}
                placeholder="Attach barcode code"
              />

              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>Quantity ({editingItem.unit}) *</label>
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
