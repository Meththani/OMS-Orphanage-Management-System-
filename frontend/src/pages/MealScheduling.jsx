import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, cardStyle, buttonPrimary, buttonSecondary, tableStyle, thStyle, tdStyle, modalOverlay, modalBox, inputStyle, selectStyle } from '../styles';
import { Calendar, Clock, Check, X, AlertCircle, List, ChevronLeft, ChevronRight, User, Sparkles, Plus, Edit2, Utensils, ShoppingBag, DollarSign, MessageSquare, Smartphone, FileSpreadsheet, Lock, Baby } from 'lucide-react';
import ModalCloseButton from '../components/ModalCloseButton';
import { formatWithCommas, stripCommas } from '../utils/numberFormat';
import { exportMealBookingsToExcel } from '../utils/excelExport';

export default function MealScheduling() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canEditOrAction = user?.role === 'admin' || user?.role === 'accountant';

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChildrenCount, setActiveChildrenCount] = useState(0);
  
  // New States
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMeal, setSelectedMeal] = useState(null);

  // SMS States
  const [sendingSmsId, setSendingSmsId] = useState(null);
  const [smsAlert, setSmsAlert] = useState(null);

  const handleSendSmsReminder = async (mealId, e) => {
    if (e) e.stopPropagation();
    setSendingSmsId(mealId);
    setSmsAlert(null);
    try {
      const res = await api.post(`/donations/${mealId}/send-sms`);
      setSmsAlert({ type: 'success', text: res.data.message || 'SMS reminder sent successfully!' });
      await loadMeals();
      if (selectedMeal && selectedMeal._id === mealId) {
        setSelectedMeal(res.data.data);
      }
    } catch (err) {
      setSmsAlert({ type: 'error', text: err.message || 'Failed to send SMS reminder.' });
    } finally {
      setSendingSmsId(null);
    }
  };

  // Scheduling Form States
  const [donors, setDonors] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMealId, setEditingMealId] = useState(null);
  const [form, setForm] = useState({
    donorID: '',
    mealDate: '',
    mealType: 'breakfast',
    quantity: '50',
    occasion: '',
    mealDonationType: 'sponsor',   // 'sponsor' | 'bringyourown'
    estimatedCost: '',
    donorCooksMenu: '',
    dietaryNotes: '',
    status: 'pending'
  });
  const [savingForm, setSavingForm] = useState(false);
  const [formError, setFormError] = useState('');

  const loadMeals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/donations?type=meal');
      setMeals(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDonors = async () => {
    try {
      const res = await api.get('/donations/donors-list');
      setDonors(res.data);
    } catch (err) {
      console.error('Error loading donors list:', err);
    }
  };

  const loadActiveChildren = async () => {
    try {
      const res = await api.get('/children?status=active');
      const count = Array.isArray(res.data) ? res.data.length : 0;
      setActiveChildrenCount(count);
    } catch (err) {
      console.error('Error loading active children count:', err);
    }
  };

  useEffect(() => {
    loadMeals();
    loadDonors();
    loadActiveChildren();
  }, []);

  const handleOpenForm = (meal = null) => {
    setFormError('');
    const effectiveCount = activeChildrenCount > 0 ? String(activeChildrenCount) : '50';
    if (meal) {
      if (!canEditOrAction) {
        alert('Action restricted: Only Admin and Accountant are authorized to edit existing meal bookings.');
        return;
      }
      setEditingMealId(meal._id);
      setForm({
        donorID: meal.donorID?._id || meal.donorID || '',
        mealDate: meal.mealDate ? new Date(meal.mealDate).toISOString().split('T')[0] : '',
        mealType: meal.mealType || 'breakfast',
        quantity: String(meal.quantity || effectiveCount),
        occasion: meal.occasion || '',
        mealDonationType: meal.mealDonationType || 'sponsor',
        estimatedCost: meal.estimatedCost ? formatWithCommas(meal.estimatedCost) : '',
        donorCooksMenu: meal.donorCooksMenu || '',
        dietaryNotes: meal.dietaryNotes || '',
        status: meal.status || 'pending'
      });
    } else {
      setEditingMealId(null);
      setForm({
        donorID: donors[0]?._id || '',
        mealDate: new Date().toISOString().split('T')[0],
        mealType: 'breakfast',
        quantity: effectiveCount,
        occasion: '',
        mealDonationType: 'sponsor',
        estimatedCost: '',
        donorCooksMenu: '',
        dietaryNotes: '',
        status: 'pending'
      });
    }
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSavingForm(true);
    setFormError('');
    try {
      const finalCount = activeChildrenCount > 0 ? activeChildrenCount : Number(form.quantity || 50);
      const payload = {
        ...form,
        quantity: finalCount,
        menuPackage: 'standard', // preserve backward compatibility with backend discriminator
        estimatedCost: form.estimatedCost ? Number(stripCommas(form.estimatedCost)) : 0,
      };

      if (editingMealId) {
        await api.put(`/donations/${editingMealId}`, payload);
      } else {
        await api.post('/donations', { ...payload, type: 'meal' });
      }

      setShowFormModal(false);
      loadMeals();
    } catch (err) {
      setFormError(err.message || 'Failed to save booking.');
    } finally {
      setSavingForm(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/donations/${id}/status`, { status });
      loadMeals();
    } catch (err) {
      setError(err.message);
    }
  };

  // Calendar Helpers
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getMealsForDate = (day) => {
    return meals.filter(m => {
      const date = m.mealDate ? new Date(m.mealDate) : new Date(m.date);
      return date.getFullYear() === currentYear &&
             date.getMonth() === currentMonth &&
             date.getDate() === day;
    });
  };

  const calendarDays = [];
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, color: colors.text, fontSize: '28px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
            {t("Meal Scheduling")}
          </h1>
        </div>

        {/* Actions & View Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => exportMealBookingsToExcel(meals)}
            style={{
              ...buttonSecondary,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
            }}
            title="Export all meal bookings to Excel"
          >
            <FileSpreadsheet size={16} color={colors.primary} /> {t("Export to Excel")}
          </button>

          <button
            onClick={() => handleOpenForm()}
            style={{
              ...buttonPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: `linear-gradient(135deg, ${colors.success}, #059669)`,
              boxShadow: `0 4px 14px ${colors.successGlow}`,
            }}
          >
            <Plus size={16} /> {t("Schedule Meal Donation")}
          </button>

          <button
            onClick={() => setViewMode('list')}
            style={{
              ...buttonSecondary,
              backgroundColor: viewMode === 'list' ? colors.primary : colors.surface,
              color: viewMode === 'list' ? '#fff' : colors.text,
              borderColor: viewMode === 'list' ? colors.primary : colors.border,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
            }}
          >
            <List size={16} /> {t("List View")}
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            style={{
              ...buttonSecondary,
              backgroundColor: viewMode === 'calendar' ? colors.primary : colors.surface,
              color: viewMode === 'calendar' ? '#fff' : colors.text,
              borderColor: viewMode === 'calendar' ? colors.primary : colors.border,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
            }}
          >
            <Calendar size={16} /> Calendar View
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

      {smsAlert && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: smsAlert.type === 'success' ? colors.successGlow : colors.dangerGlow,
          border: `1px solid ${smsAlert.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: '10px',
          color: smsAlert.type === 'success' ? colors.success : colors.danger,
          fontSize: '13px',
          marginBottom: '16px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
        }}>
          <span>{smsAlert.type === 'success' ? '📱' : '⚠️'} {smsAlert.text}</span>
          <button onClick={() => setSmsAlert(null)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
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
            {t("Loading meal schedules...")}
          </div>
        ) : meals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
            <p>{t("No meal bookings recorded. Visit the public website to test meal reservations.")}</p>
          </div>
        ) : viewMode === 'list' ? (
          /* ─── LIST VIEW ─── */
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>{t("Date Scheduled")}</th>
                  <th style={thStyle}>{t("Meal Slot")}</th>
                  <th style={thStyle}>{t("Donor / Sponsor")}</th>
                  <th style={thStyle}>{t("Occasion")}</th>
                  <th style={thStyle}>{t("Preparation")}</th>
                  <th style={thStyle}>{t("Beneficiaries")}</th>
                  <th style={thStyle}>{t("Dietary Notes")}</th>
                  <th style={thStyle}>{t("Status")}</th>
                  <th style={thStyle}>{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {meals.map((meal) => {
                  const date = meal.mealDate ? new Date(meal.mealDate) : new Date(meal.date);
                  return (
                    <tr key={meal._id} style={{ transition: 'background-color 0.15s ease', cursor: 'pointer' }}
                      onClick={() => setSelectedMeal(meal)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ ...tdStyle, color: colors.text, fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={14} color={colors.textSecondary} />
                          {date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textTransform: 'capitalize', fontWeight: 600, color: meal.mealType === 'breakfast' ? colors.warning : meal.mealType === 'lunch' ? colors.info : colors.primary }}>
                          <Clock size={12} />
                          {t(meal.mealType)}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600 }}>{meal.donorID?.name || 'Unknown Sponsor'}</div>
                        <div style={{ fontSize: '11px', color: colors.textMuted }}>{meal.donorID?.email || ''}</div>
                      </td>
                      <td style={tdStyle}>
                        {meal.occasion ? (
                          <span style={{ fontSize: '13px' }}>🎉 {meal.occasion}</span>
                        ) : (
                          <span style={{ color: colors.textMuted, fontStyle: 'italic', fontSize: '12px' }}>{t("None")}</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        {meal.mealDonationType === 'bringyourown' ? (
                          <span style={{
                            padding: '3px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                            backgroundColor: 'rgba(168,85,247,0.12)', color: '#a855f7',
                            fontWeight: 600, fontSize: '11px'
                          }}>
                            <ShoppingBag size={10} /> {t("Self-Catered")}
                          </span>
                        ) : (
                          <span style={{
                            padding: '3px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                            backgroundColor: colors.primaryGlow,
                            color: colors.primary,
                            fontWeight: 600, fontSize: '11px'
                          }}>
                            <Utensils size={10} /> {t("Centre-Prepared")}
                          </span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Baby size={13} color={colors.primary} />
                          <span style={{ fontWeight: 600 }}>{meal.quantity || activeChildrenCount || 50} {t("Kids (All)")}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontSize: '12px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={meal.dietaryNotes}>
                        {meal.dietaryNotes ? (
                          <span style={{ color: colors.danger }}>⚠️ {meal.dietaryNotes}</span>
                        ) : (
                          <span style={{ color: colors.textMuted, fontStyle: 'italic' }}>{t("None")}</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '6px',
                          background: meal.status === 'received' ? colors.successGlow : meal.status === 'pending' ? colors.warningGlow : colors.dangerGlow,
                          color: meal.status === 'received' ? colors.success : meal.status === 'pending' ? colors.warning : colors.danger,
                          fontWeight: 600, fontSize: '12px', textTransform: 'capitalize',
                        }}>
                          {meal.status === 'received' ? 'Completed' : meal.status}
                        </span>
                      </td>
                      <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {canEditOrAction ? (
                            <>
                              {meal.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(meal._id, 'received')}
                                    style={{
                                      ...buttonSecondary, display: 'inline-flex', alignItems: 'center', gap: '4px',
                                      padding: '5px 10px', fontSize: '11px', borderColor: 'rgba(16,185,129,0.3)', color: colors.success
                                    }}
                                  >
                                    <Check size={12} /> Mark Served
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(meal._id, 'cancelled')}
                                    style={{
                                      ...buttonSecondary, display: 'inline-flex', alignItems: 'center', gap: '4px',
                                      padding: '5px 10px', fontSize: '11px', borderColor: 'rgba(239,68,68,0.3)', color: colors.danger
                                    }}
                                  >
                                    <X size={12} /> Cancel
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleOpenForm(meal)}
                                style={{
                                  ...buttonSecondary, display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  padding: '5px 10px', fontSize: '11px', borderColor: colors.border, color: colors.primary
                                }}
                              >
                                <Edit2 size={12} /> Edit
                              </button>

                              <button
                                onClick={(e) => handleSendSmsReminder(meal._id, e)}
                                disabled={sendingSmsId === meal._id}
                                style={{
                                  ...buttonSecondary, display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  padding: '5px 10px', fontSize: '11px', borderColor: 'rgba(59,130,246,0.3)', color: '#3b82f6'
                                }}
                                title="Send SMS reminder to donor phone"
                              >
                                <MessageSquare size={12} /> {sendingSmsId === meal._id ? 'Sending...' : 'Send SMS'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedMeal(meal)}
                              style={{
                                ...buttonSecondary, display: 'inline-flex', alignItems: 'center', gap: '4px',
                                padding: '5px 12px', fontSize: '11px', color: colors.primary, borderColor: `${colors.primary}40`
                              }}
                            >
                              👁️ View Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ─── CALENDAR VIEW ─── */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <button type="button" onClick={handlePrevMonth} style={{ ...buttonSecondary, padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={16} /> Prev
              </button>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '20px', color: colors.primary, fontFamily: "'Outfit', sans-serif" }}>
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button type="button" onClick={handleNextMonth} style={{ ...buttonSecondary, padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
                Next <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekdays header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '10px' }}>
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} style={{ fontSize: '12px', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      style={{
                        minHeight: '110px',
                        backgroundColor: 'rgba(0,0,0,0.01)',
                        border: `1px dashed ${colors.border}`,
                        borderRadius: '10px'
                      }}
                    />
                  );
                }

                const targetDate = new Date(currentYear, currentMonth, day);
                const isToday = new Date().toDateString() === targetDate.toDateString();
                const dayMeals = getMealsForDate(day);

                return (
                  <div
                    key={`day-${day}`}
                    style={{
                      minHeight: '110px',
                      backgroundColor: '#fff',
                      border: isToday ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                      borderRadius: '10px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      boxShadow: isToday ? `0 4px 12px ${colors.primaryGlow}` : 'none'
                    }}
                  >
                    <span style={{
                      fontWeight: 700,
                      fontSize: '14px',
                      color: isToday ? colors.primary : colors.textMuted,
                      backgroundColor: isToday ? colors.primaryGlow : 'transparent',
                      padding: isToday ? '2px 6px' : '0',
                      borderRadius: '4px',
                      alignSelf: 'flex-start'
                    }}>
                      {day}
                    </span>

                    {/* Day's Meals */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
                      {dayMeals.map(m => {
                        let itemBg = colors.surface;
                        let itemColor = colors.text;
                        let itemBorder = `1px solid ${colors.border}`;

                        if (m.status === 'received') {
                          itemBg = colors.successGlow;
                          itemColor = colors.success;
                          itemBorder = '1px solid rgba(16,185,129,0.2)';
                        } else if (m.status === 'pending') {
                          itemBg = colors.warningGlow;
                          itemColor = colors.warning;
                          itemBorder = '1px solid rgba(241,156,56,0.2)';
                        } else if (m.status === 'cancelled') {
                          itemBg = colors.dangerGlow;
                          itemColor = colors.danger;
                          itemBorder = '1px solid rgba(239,68,68,0.2)';
                        }

                        return (
                          <div
                            key={m._id}
                            onClick={() => setSelectedMeal(m)}
                            style={{
                              padding: '4px 6px',
                              borderRadius: '6px',
                              backgroundColor: itemBg,
                              color: itemColor,
                              border: itemBorder,
                              fontSize: '10.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              textTransform: 'capitalize',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1px',
                              transition: 'transform 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                            title={`${m.mealType} by ${m.donorID?.name || 'Sponsor'}`}
                          >
                            <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {m.mealType}
                            </div>
                            <div style={{ fontSize: '9px', opacity: 0.8, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {m.donorID?.name || 'Sponsor'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '16px', fontSize: '12px', justifyContent: 'flex-end', color: colors.textSecondary }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.warning }} /> Pending Booking
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.success }} /> Served (Completed)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.danger }} /> Cancelled
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── DETAILED PREVIEW MODAL ─── */}
      {selectedMeal && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, width: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: colors.text, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Outfit', sans-serif" }}>
                <Utensils size={18} color={colors.primary} /> {t("Sponsor Meal Details")}
              </h3>
              <ModalCloseButton onClick={() => setSelectedMeal(null)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>{t("Scheduled Date & Slot")}</span>
                <div style={{ fontWeight: 700, fontSize: '15px', color: colors.text, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <Calendar size={15} color={colors.primary} />
                  {new Date(selectedMeal.mealDate || selectedMeal.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '11px', textTransform: 'capitalize',
                    backgroundColor: selectedMeal.mealType === 'breakfast' ? colors.warningGlow : selectedMeal.mealType === 'lunch' ? colors.infoGlow : colors.primaryGlow,
                    color: selectedMeal.mealType === 'breakfast' ? colors.warning : selectedMeal.mealType === 'lunch' ? colors.info : colors.primary
                  }}>
                    {t(selectedMeal.mealType)}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>{t("Donor / Sponsor")}</span>
                <div style={{ fontWeight: 600, fontSize: '14px', color: colors.text, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <User size={15} color={colors.textSecondary} />
                  {selectedMeal.donorID?.name || 'Unknown Sponsor'}
                </div>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginLeft: '23px' }}>
                  {t("Email")}: {selectedMeal.donorID?.email || 'N/A'} | {t("Contact")}: {selectedMeal.donorID?.contactDetails || 'N/A'}
                </div>
              </div>

              {selectedMeal.occasion && (
                <div>
                  <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>{t("Occasion / Purpose")}</span>
                  <div style={{ fontSize: '13px', color: colors.text, fontWeight: 500, marginTop: '4px', padding: '6px 10px', backgroundColor: colors.surface, borderRadius: '6px' }}>
                    🎉 {selectedMeal.occasion}
                  </div>
                </div>
              )}

              {/* Donation type badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {selectedMeal.mealDonationType === 'bringyourown' ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '5px 12px', borderRadius: '20px',
                    background: 'rgba(168,85,247,0.12)', color: '#a855f7', fontWeight: 700, fontSize: '12px'
                  }}>
                    <ShoppingBag size={12} /> {t("Bring Your Own Meal")}
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '5px 12px', borderRadius: '20px',
                    background: colors.primaryGlow, color: colors.primary, fontWeight: 700, fontSize: '12px'
                  }}>
                    <DollarSign size={12} /> {t("Sponsor a Meal")}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>{t("Beneficiary Children")}</span>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: colors.text, marginTop: '4px' }}>
                    👶 {t("All Children")} ({selectedMeal.quantity || activeChildrenCount || 50} {t("Kids")})
                  </div>
                </div>
                {selectedMeal.mealDonationType === 'sponsor' && selectedMeal.estimatedCost && (
                  <div>
                    <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>{t("Estimated Cost")}</span>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: colors.success, marginTop: '4px' }}>
                      💰 LKR {selectedMeal.estimatedCost.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Advance Payment Details */}
              {(selectedMeal.advanceAmount > 0 || selectedMeal.advanceStatus) && (
                <div style={{
                  padding: '12px 14px', borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>
                      {t("Advance Payment")}
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                      backgroundColor: selectedMeal.advanceStatus === 'received' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.18)',
                      color: selectedMeal.advanceStatus === 'received' ? '#10b981' : '#f59e0b'
                    }}>
                      {selectedMeal.advanceStatus === 'received' ? t('Advance Paid') : t('Advance Pending')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: '#10b981' }}>
                      LKR {Number(selectedMeal.advanceAmount || 0).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '12px', color: colors.textSecondary, textTransform: 'capitalize' }}>
                      {t("Via")}: {selectedMeal.advancePaymentMethod ? t(selectedMeal.advancePaymentMethod.replace('_', ' ')) : t('Bank Transfer')}
                    </span>
                  </div>
                  {selectedMeal.proofOfPayment?.fileData && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(16, 185, 129, 0.3)' }}>
                      <a
                        href={selectedMeal.proofOfPayment.fileData}
                        download={selectedMeal.proofOfPayment.fileName || 'meal-advance-receipt'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: colors.primary, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        📎 {t("View Advance Deposit Slip")} ({selectedMeal.proofOfPayment.fileName || t('Receipt')})
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Bring Your Own Meal description */}
              {selectedMeal.mealDonationType === 'bringyourown' && selectedMeal.donorCooksMenu && (
                <div>
                  <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>{t("Donor's Menu Plan")}</span>
                  <div style={{
                    fontSize: '13px', color: '#a855f7', fontWeight: 500, marginTop: '4px',
                    padding: '8px 12px', background: 'rgba(168,85,247,0.08)',
                    borderRadius: '8px', border: '1px solid rgba(168,85,247,0.15)',
                    display: 'flex', gap: '6px', alignItems: 'flex-start'
                  }}>
                    <ShoppingBag size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{selectedMeal.donorCooksMenu}</span>
                  </div>
                </div>
              )}

              {selectedMeal.dietaryNotes && (
                <div>
                  <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>{t("Dietary Instructions")}</span>
                  <div style={{ fontSize: '12px', color: colors.danger, fontWeight: 500, marginTop: '4px', padding: '8px 12px', backgroundColor: colors.dangerGlow, borderRadius: '8px', display: 'flex', gap: '6px', alignItems: 'start' }}>
                    <AlertCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{selectedMeal.dietaryNotes}</span>
                  </div>
                </div>
              )}

              <div>
                <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>{t("Sponsorship Status")}</span>
                <div style={{ marginTop: '4px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '12px', textTransform: 'capitalize',
                    background: selectedMeal.status === 'received' ? colors.successGlow : selectedMeal.status === 'pending' ? colors.warningGlow : colors.dangerGlow,
                    color: selectedMeal.status === 'received' ? colors.success : selectedMeal.status === 'pending' ? colors.warning : colors.danger,
                  }}>
                    {selectedMeal.status === 'received' ? t('Completed (Served)') : t(selectedMeal.status)}
                  </span>
                </div>
              </div>

              {selectedMeal.notes && (
                <div>
                  <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>{t("Internal Notes")}</span>
                  <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px', fontStyle: 'italic' }}>
                    {selectedMeal.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Actions for Pending/All meals */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
              {canEditOrAction ? (
                <>
                  <button
                    onClick={() => {
                      const mealToEdit = selectedMeal;
                      setSelectedMeal(null);
                      handleOpenForm(mealToEdit);
                    }}
                    style={{ ...buttonSecondary, display: 'inline-flex', alignItems: 'center', gap: '4px', color: colors.primary, borderColor: colors.primaryGlow }}
                  >
                    <Edit2 size={12} /> {t("Edit Details")}
                  </button>
                  {selectedMeal.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedMeal._id, 'cancelled');
                          setSelectedMeal(null);
                        }}
                        style={{ ...buttonSecondary, color: colors.danger, borderColor: 'rgba(239,68,68,0.2)' }}
                      >
                        {t("Cancel Sponsorship")}
                      </button>
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedMeal._id, 'received');
                          setSelectedMeal(null);
                        }}
                        style={{ ...buttonPrimary, background: `linear-gradient(135deg, ${colors.success}, #059669)` }}
                      >
                        {t("Mark Served")}
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div style={{ alignSelf: 'center', fontSize: '12px', color: colors.textMuted, display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: 'auto' }}>
                  <Lock size={13} color={colors.warning} /> {t("Staff View Mode (Read-Only)")}
                </div>
              )}
              <button type="button" style={buttonSecondary} onClick={() => setSelectedMeal(null)}>{t("Close")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SCHEDULING / EDITING FORM MODAL ─── */}
      {showFormModal && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, width: '560px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, color: colors.text, fontFamily: "'Outfit', sans-serif", marginBottom: '4px' }}>
                  {editingMealId ? '✏️ Edit Meal Donation' : '🍽️ Schedule Meal Donation'}
                </h2>
                <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
                  {editingMealId ? 'Update the meal donation reservation details.' : 'Choose how the donor would like to contribute a meal.'}
                </p>
              </div>
              <ModalCloseButton onClick={() => setShowFormModal(false)} />
            </div>

            {formError && (
              <div style={{
                padding: '10px 12px', backgroundColor: colors.dangerGlow,
                border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px',
                color: colors.danger, fontSize: '12px', marginBottom: '14px'
              }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>

              {/* ── DONATION MODE TOGGLE ── */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Donation Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

                  {/* Card 1: Sponsor a Meal */}
                  <div
                    onClick={() => setForm({ ...form, mealDonationType: 'sponsor' })}
                    style={{
                      border: form.mealDonationType === 'sponsor'
                        ? `2px solid ${colors.primary}`
                        : `2px solid ${colors.border}`,
                      borderRadius: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      background: form.mealDonationType === 'sponsor'
                        ? `linear-gradient(135deg, ${colors.primaryGlow}, rgba(29,112,184,0.05))`
                        : colors.surface,
                      transition: 'all 0.2s ease',
                      boxShadow: form.mealDonationType === 'sponsor' ? `0 4px 16px ${colors.primaryGlow}` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '10px',
                        background: form.mealDonationType === 'sponsor'
                          ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`
                          : colors.border,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}>
                        <DollarSign size={16} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: form.mealDonationType === 'sponsor' ? colors.primary : colors.text }}>{t("Sponsor a Meal")}</div>
                        <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '1px' }}>{t("Donate money · Staff cook")}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: colors.textSecondary, margin: 0, lineHeight: '1.5' }}>
                      {t("Donor contributes funds. Our orphanage staff will prepare and serve the meal.")}
                    </p>
                  </div>

                  {/* Card 2: Bring Your Own Meal */}
                  <div
                    onClick={() => setForm({ ...form, mealDonationType: 'bringyourown' })}
                    style={{
                      border: form.mealDonationType === 'bringyourown'
                        ? '2px solid #a855f7'
                        : `2px solid ${colors.border}`,
                      borderRadius: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      background: form.mealDonationType === 'bringyourown'
                        ? 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(168,85,247,0.03))'
                        : colors.surface,
                      transition: 'all 0.2s ease',
                      boxShadow: form.mealDonationType === 'bringyourown' ? '0 4px 16px rgba(168,85,247,0.2)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '10px',
                        background: form.mealDonationType === 'bringyourown'
                          ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                          : colors.border,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}>
                        <ShoppingBag size={16} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: form.mealDonationType === 'bringyourown' ? '#a855f7' : colors.text }}>{t("Bring Your Own Meal")}</div>
                        <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '1px' }}>{t("Self-catered · Donor prepares")}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: colors.textSecondary, margin: 0, lineHeight: '1.5' }}>
                      {t("Donor books a date and brings or prepares the meal themselves.")}
                    </p>
                  </div>

                </div>
              </div>

              {/* ── COMMON FIELDS ── */}
              <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>{t("Select Donor Profile")}</label>
              <select
                style={selectStyle}
                value={form.donorID}
                onChange={(e) => setForm({ ...form, donorID: e.target.value })}
                required
              >
                <option value="" disabled>-- {t("Select Donor")} --</option>
                {donors.map(donor => (
                  <option key={donor._id} value={donor._id}>
                    {donor.name} ({donor.email})
                  </option>
                ))}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>{t("Meal Date")}</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={form.mealDate}
                    onChange={(e) => setForm({ ...form, mealDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>{t("Meal Slot")}</label>
                  <select
                    style={selectStyle}
                    value={form.mealType}
                    onChange={(e) => setForm({ ...form, mealType: e.target.value })}
                  >
                    <option value="breakfast">🌅 {t("Breakfast")}</option>
                    <option value="lunch">☀️ {t("Lunch")}</option>
                    <option value="dinner">🌙 {t("Dinner")}</option>
                  </select>
                </div>
              </div>

              {/* ── SPONSOR-SPECIFIC FIELDS ── */}
              {form.mealDonationType === 'sponsor' && (
                <div style={{
                  background: colors.primaryGlow,
                  border: `1px solid rgba(29,112,184,0.2)`,
                  borderRadius: '10px', padding: '14px', marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Utensils size={14} color={colors.primary} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t("Staff-Cooked Meal Options")}</span>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>{t("Estimated Cost (LKR)")}</label>
                    <input
                      type="text"
                      style={inputStyle}
                      placeholder={t("e.g. 15,000")}
                      value={form.estimatedCost}
                      onChange={(e) => setForm({ ...form, estimatedCost: formatWithCommas(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              {/* ── BRING YOUR OWN MEAL FIELDS ── */}
              {form.mealDonationType === 'bringyourown' && (
                <div style={{
                  background: 'rgba(168,85,247,0.06)',
                  border: '1px solid rgba(168,85,247,0.2)',
                  borderRadius: '10px', padding: '14px', marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <ShoppingBag size={14} color="#a855f7" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t("What Will the Donor Bring?")}</span>
                  </div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>{t("Meal Description / Menu Plan")}</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: '72px', resize: 'vertical', borderColor: 'rgba(168,85,247,0.3)' }}
                    placeholder={t("e.g. Rice & curry with 3 side dishes, fresh juice and dessert for all children")}
                    value={form.donorCooksMenu}
                    onChange={(e) => setForm({ ...form, donorCooksMenu: e.target.value })}
                    required={form.mealDonationType === 'bringyourown'}
                  />
                </div>
              )}

              {/* ── BENEFICIARY CHILDREN (Mandatory: All Active Children) ── */}
              <div style={{
                marginBottom: '16px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(59,130,246,0.04))',
                border: `1.5px solid rgba(37,99,235,0.25)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                  }}>
                    <Baby size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: colors.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t("Beneficiary Children")}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: colors.text, marginTop: '2px' }}>
                      {t("All Orphanage Children")}
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '2px' }}>
                      {t("Meals must cover all children currently residing in the orphanage.")}
                    </div>
                  </div>
                </div>
                <div style={{
                  textAlign: 'right',
                  padding: '8px 14px',
                  backgroundColor: colors.card,
                  border: `1.5px solid rgba(37,99,235,0.3)`,
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                  minWidth: '95px'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                    {t("Active Children")}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: colors.primary, marginTop: '1px' }}>
                    {activeChildrenCount || form.quantity || 50}
                  </div>
                </div>
              </div>

              {/* Occasion */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>{t("Occasion / Purpose (Optional)")}</label>
                <input
                  style={inputStyle}
                  placeholder={t("e.g. Birthday celebration, Memorial day")}
                  value={form.occasion}
                  onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                />
              </div>

              {/* Dietary Notes */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>{t("Dietary Instructions (Optional)")}</label>
                <textarea
                  style={{ ...inputStyle, minHeight: '56px', resize: 'vertical' }}
                  placeholder={t("e.g. Vegetarian only, mild spices, no nuts")}
                  value={form.dietaryNotes}
                  onChange={(e) => setForm({ ...form, dietaryNotes: e.target.value })}
                />
              </div>

              {/* Status (Only when editing) */}
              {editingMealId && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>{t("Status")}</label>
                  <select
                    style={selectStyle}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="pending">{t("Pending")}</option>
                    <option value="received">{t("Completed (Served)")}</option>
                    <option value="cancelled">{t("Cancelled")}</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
                <button type="button" style={buttonSecondary} onClick={() => setShowFormModal(false)}>{t("Cancel")}</button>
                <button
                  type="submit"
                  style={{
                    ...buttonPrimary,
                    background: form.mealDonationType === 'bringyourown'
                      ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                      : `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                  }}
                  disabled={savingForm}
                >
                  {savingForm ? t('Saving...') : editingMealId ? t('Update Booking') : t('Confirm Booking')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meal Details Modal */}
      {selectedMeal && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, width: '600px', maxWidth: '95vw', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: colors.text, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Utensils size={20} color={colors.primary} />
                {t("Meal Scheduling Details")}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  padding: '4px 10px', borderRadius: '6px',
                  background: selectedMeal.status === 'received' ? colors.successGlow : selectedMeal.status === 'pending' ? colors.warningGlow : colors.dangerGlow,
                  color: selectedMeal.status === 'received' ? colors.success : selectedMeal.status === 'pending' ? colors.warning : colors.danger,
                  fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  {selectedMeal.status === 'received' ? t('Completed') : t(selectedMeal.status)}
                </span>
                <ModalCloseButton onClick={() => setSelectedMeal(null)} />
              </div>
            </div>

            <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }}>
              {/* Grid: Donor profile and Scheduling Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                
                {/* Left Column: Sponsor / Donor details */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '13px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{t("Sponsor Profile")}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Name")}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>{selectedMeal.donorID?.name || 'Unknown Sponsor'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Email")}</div>
                      <div style={{ fontSize: '13px', color: colors.text }}>{selectedMeal.donorID?.email || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Contact Details")}</div>
                      <div style={{ fontSize: '13px', color: colors.text }}>{selectedMeal.donorID?.contactDetails || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Donor Type")}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: colors.primary, textTransform: 'capitalize' }}>{t(selectedMeal.donorID?.type || 'individual')}</div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Meal Reservation Info */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '13px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{t("Meal Reservation")}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Date Scheduled")}</div>
                      <div style={{ fontSize: '13px', color: colors.text }}>
                        {selectedMeal.mealDate ? new Date(selectedMeal.mealDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Meal Slot")}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: colors.primary, textTransform: 'uppercase' }}>{t(selectedMeal.mealType)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Beneficiaries")}</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>
                        {t("All Children")} ({selectedMeal.quantity || activeChildrenCount || 50} {t("Kids")})
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{t("Preparation")}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7', textTransform: 'capitalize' }}>
                        {selectedMeal.mealDonationType === 'bringyourown' ? t("Self-Catered") : t("Centre-Prepared")}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Estimated Cost info if provided */}
              {selectedMeal.estimatedCost > 0 && (
                <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: 'rgba(241,156,56,0.04)', border: `1px solid rgba(241,156,56,0.15)`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: colors.primary, fontWeight: 700, textTransform: 'uppercase' }}>{t("Meal Cost / Contribution")}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: colors.success }}>LKR {selectedMeal.estimatedCost.toLocaleString()}</span>
                </div>
              )}

              {/* Self Catered menu description */}
              {selectedMeal.mealDonationType === 'bringyourown' && selectedMeal.donorCooksMenu && (
                <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: 'rgba(168,85,247,0.05)', border: `1px solid rgba(168,85,247,0.15)`, borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>{t("Menu Plan / Description")}</span>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}>{selectedMeal.donorCooksMenu}</div>
                </div>
              )}

              {/* Occasion / Celebration */}
              {selectedMeal.occasion && (
                <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: 'rgba(59,130,246,0.05)', border: `1px solid rgba(59,130,246,0.15)`, borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>{t("Occasion / Purpose")}</span>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>🎉 {selectedMeal.occasion}</div>
                </div>
              )}

              {/* Dietary Instructions */}
              {selectedMeal.dietaryNotes && (
                <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: 'rgba(239,68,68,0.05)', border: `1px solid rgba(239,68,68,0.15)`, borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: colors.danger, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>{t("Dietary Instructions")}</span>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}>⚠️ {selectedMeal.dietaryNotes}</div>
                </div>
              )}

              {/* Internal Notes */}
              {selectedMeal.notes && (
                <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border}`, borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>{t("Sponsor Notes")}</span>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}>{selectedMeal.notes}</div>
                </div>
              )}

              {/* SMS Notification Details */}
              <div style={{ marginBottom: '20px', padding: '14px 16px', backgroundColor: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Smartphone size={13} /> {t("SMS Reminder Status")}
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                    backgroundColor: selectedMeal.smsSent ? colors.successGlow : colors.warningGlow,
                    color: selectedMeal.smsSent ? colors.success : colors.warning,
                  }}>
                    {selectedMeal.smsSent ? '✓ SMS Sent' : '⏳ Pending'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '10px' }}>
                  {selectedMeal.lastSmsSentAt
                    ? `Last SMS sent on ${new Date(selectedMeal.lastSmsSentAt).toLocaleString()}`
                    : 'No SMS reminder has been sent yet.'}
                </div>
                <button
                  type="button"
                  onClick={(e) => handleSendSmsReminder(selectedMeal._id, e)}
                  disabled={sendingSmsId === selectedMeal._id}
                  style={{
                    ...buttonSecondary, display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', fontSize: '12px', borderColor: 'rgba(59,130,246,0.4)', color: '#3b82f6',
                    backgroundColor: '#fff'
                  }}
                >
                  <MessageSquare size={13} />
                  {sendingSmsId === selectedMeal._id ? 'Sending SMS...' : 'Send SMS Reminder Now'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
              <div>
                {selectedMeal.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      style={{ ...buttonPrimary, background: `linear-gradient(135deg, ${colors.success}, #059669)`, boxShadow: `0 4px 12px ${colors.successGlow}`, padding: '10px 20px', fontSize: '13px' }}
                      onClick={async () => {
                        await handleUpdateStatus(selectedMeal._id, 'received');
                        setSelectedMeal(null);
                      }}
                    >
                      ✓ {t("Mark Served")}
                    </button>
                    <button
                      style={{ ...buttonSecondary, color: colors.danger, borderColor: 'rgba(239,68,68,0.3)', padding: '10px 20px', fontSize: '13px' }}
                      onClick={async () => {
                        await handleUpdateStatus(selectedMeal._id, 'cancelled');
                        setSelectedMeal(null);
                      }}
                    >
                      ✗ {t("Cancel")}
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                style={{ ...buttonSecondary, color: colors.danger, borderColor: 'rgba(239,68,68,0.3)', padding: '10px 20px', fontSize: '13px', fontWeight: 600 }}
                onClick={() => setSelectedMeal(null)}
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
