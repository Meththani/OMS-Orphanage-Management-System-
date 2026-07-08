import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { colors, cardStyle, buttonPrimary, buttonSecondary, tableStyle, thStyle, tdStyle, modalOverlay, modalBox, inputStyle, selectStyle } from '../styles';
import { Calendar, Clock, Check, X, AlertCircle, List, ChevronLeft, ChevronRight, User, Sparkles, Plus, Edit2, Utensils, ShoppingBag, DollarSign } from 'lucide-react';

export default function MealScheduling() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New States
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMeal, setSelectedMeal] = useState(null);

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
    menuPackage: 'standard',
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

  useEffect(() => {
    loadMeals();
    loadDonors();
  }, []);

  const handleOpenForm = (meal = null) => {
    setFormError('');
    if (meal) {
      setEditingMealId(meal._id);
      setForm({
        donorID: meal.donorID?._id || meal.donorID || '',
        mealDate: meal.mealDate ? new Date(meal.mealDate).toISOString().split('T')[0] : '',
        mealType: meal.mealType || 'breakfast',
        quantity: String(meal.quantity || 50),
        occasion: meal.occasion || '',
        mealDonationType: meal.mealDonationType || 'sponsor',
        menuPackage: meal.menuPackage || 'standard',
        estimatedCost: meal.estimatedCost ? String(meal.estimatedCost) : '',
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
        quantity: '50',
        occasion: '',
        mealDonationType: 'sponsor',
        menuPackage: 'standard',
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
      const payload = {
        ...form,
        quantity: Number(form.quantity),
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
            Meal Scheduling
          </h1>
        </div>

        {/* Actions & View Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
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
            <Plus size={16} /> Schedule Meal Donation
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
            <List size={16} /> List View
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

      <div style={cardStyle}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 12px',
              border: `3px solid ${colors.border}`, borderTopColor: colors.primary,
              animation: 'spin 0.8s linear infinite',
            }} />
            Loading meal schedules...
          </div>
        ) : meals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
            <p>No meal bookings recorded. Visit the public website to test meal reservations.</p>
          </div>
        ) : viewMode === 'list' ? (
          /* ─── LIST VIEW ─── */
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Date Scheduled</th>
                  <th style={thStyle}>Meal Slot</th>
                  <th style={thStyle}>Donor / Sponsor</th>
                  <th style={thStyle}>Occasion</th>
                  <th style={thStyle}>Menu</th>
                  <th style={thStyle}>Quantity</th>
                  <th style={thStyle}>Dietary Notes</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meals.map((meal) => {
                  const date = meal.mealDate ? new Date(meal.mealDate) : new Date(meal.date);
                  return (
                    <tr key={meal._id} style={{ transition: 'background-color 0.15s ease' }}
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
                          {meal.mealType}
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
                          <span style={{ color: colors.textMuted, fontStyle: 'italic', fontSize: '12px' }}>None</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        {meal.mealDonationType === 'bringyourown' ? (
                          <span style={{
                            padding: '3px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                            backgroundColor: 'rgba(168,85,247,0.12)', color: '#a855f7',
                            fontWeight: 600, fontSize: '11px'
                          }}>
                            <ShoppingBag size={10} /> Self-Catered
                          </span>
                        ) : (
                          <span style={{
                            padding: '3px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                            backgroundColor: meal.menuPackage === 'feast' ? colors.warningGlow : meal.menuPackage === 'special' ? colors.successGlow : colors.primaryGlow,
                            color: meal.menuPackage === 'feast' ? colors.warning : meal.menuPackage === 'special' ? colors.success : colors.primary,
                            fontWeight: 600, fontSize: '11px', textTransform: 'capitalize'
                          }}>
                            <Utensils size={10} /> {meal.menuPackage || 'standard'}
                          </span>
                        )}
                      </td>
                      <td style={tdStyle}>{meal.quantity} Kids portions</td>
                      <td style={{ ...tdStyle, fontSize: '12px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={meal.dietaryNotes}>
                        {meal.dietaryNotes ? (
                          <span style={{ color: colors.danger }}>⚠️ {meal.dietaryNotes}</span>
                        ) : (
                          <span style={{ color: colors.textMuted, fontStyle: 'italic' }}>None</span>
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
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
        <div style={modalOverlay} onClick={() => setSelectedMeal(null)}>
          <div style={{ ...modalBox, width: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: colors.text, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Outfit', sans-serif" }}>
                <Sparkles size={18} color={colors.primary} /> Sponsor Meal Details
              </h3>
              <button onClick={() => setSelectedMeal(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.textMuted }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Scheduled Date & Slot</span>
                <div style={{ fontWeight: 700, fontSize: '15px', color: colors.text, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <Calendar size={15} color={colors.primary} />
                  {new Date(selectedMeal.mealDate || selectedMeal.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '11px', textTransform: 'capitalize',
                    backgroundColor: selectedMeal.mealType === 'breakfast' ? colors.warningGlow : selectedMeal.mealType === 'lunch' ? colors.infoGlow : colors.primaryGlow,
                    color: selectedMeal.mealType === 'breakfast' ? colors.warning : selectedMeal.mealType === 'lunch' ? colors.info : colors.primary
                  }}>
                    {selectedMeal.mealType}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Donor / Sponsor</span>
                <div style={{ fontWeight: 600, fontSize: '14px', color: colors.text, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <User size={15} color={colors.textSecondary} />
                  {selectedMeal.donorID?.name || 'Unknown Sponsor'}
                </div>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginLeft: '23px' }}>
                  Email: {selectedMeal.donorID?.email || 'N/A'} | Contact: {selectedMeal.donorID?.contactDetails || 'N/A'}
                </div>
              </div>

              {selectedMeal.occasion && (
                <div>
                  <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Occasion / Purpose</span>
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
                    <ShoppingBag size={12} /> Bring Your Own Meal
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '5px 12px', borderRadius: '20px',
                    background: colors.primaryGlow, color: colors.primary, fontWeight: 700, fontSize: '12px'
                  }}>
                    <DollarSign size={12} /> Sponsor a Meal
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {selectedMeal.mealDonationType !== 'bringyourown' && (
                  <div>
                    <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Menu Package</span>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: colors.primary, marginTop: '4px', textTransform: 'capitalize' }}>
                      🍽️ {selectedMeal.menuPackage || 'standard'}
                    </div>
                  </div>
                )}
                <div>
                  <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Children to Feed</span>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: colors.text, marginTop: '4px' }}>
                    😋 {selectedMeal.quantity} Kids
                  </div>
                </div>
                {selectedMeal.mealDonationType === 'sponsor' && selectedMeal.estimatedCost && (
                  <div>
                    <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Estimated Cost</span>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: colors.success, marginTop: '4px' }}>
                      💰 LKR {selectedMeal.estimatedCost.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Bring Your Own Meal description */}
              {selectedMeal.mealDonationType === 'bringyourown' && selectedMeal.donorCooksMenu && (
                <div>
                  <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Donor&apos;s Menu Plan</span>
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
                  <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Dietary Instructions</span>
                  <div style={{ fontSize: '12px', color: colors.danger, fontWeight: 500, marginTop: '4px', padding: '8px 12px', backgroundColor: colors.dangerGlow, borderRadius: '8px', display: 'flex', gap: '6px', alignItems: 'start' }}>
                    <AlertCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{selectedMeal.dietaryNotes}</span>
                  </div>
                </div>
              )}

              <div>
                <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Sponsorship Status</span>
                <div style={{ marginTop: '4px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '12px', textTransform: 'capitalize',
                    background: selectedMeal.status === 'received' ? colors.successGlow : selectedMeal.status === 'pending' ? colors.warningGlow : colors.dangerGlow,
                    color: selectedMeal.status === 'received' ? colors.success : selectedMeal.status === 'pending' ? colors.warning : colors.danger,
                  }}>
                    {selectedMeal.status === 'received' ? 'Completed (Served)' : selectedMeal.status}
                  </span>
                </div>
              </div>

              {selectedMeal.notes && (
                <div>
                  <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Internal Notes</span>
                  <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px', fontStyle: 'italic' }}>
                    {selectedMeal.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Actions for Pending/All meals */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
              <button
                onClick={() => {
                  const mealToEdit = selectedMeal;
                  setSelectedMeal(null);
                  handleOpenForm(mealToEdit);
                }}
                style={{ ...buttonSecondary, display: 'inline-flex', alignItems: 'center', gap: '4px', color: colors.primary, borderColor: colors.primaryGlow }}
              >
                <Edit2 size={12} /> Edit Details
              </button>
              <button type="button" style={buttonSecondary} onClick={() => setSelectedMeal(null)}>Close</button>
              {selectedMeal.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedMeal._id, 'cancelled');
                      setSelectedMeal(null);
                    }}
                    style={{ ...buttonSecondary, color: colors.danger, borderColor: 'rgba(239,68,68,0.2)' }}
                  >
                    Cancel Sponsorship
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedMeal._id, 'received');
                      setSelectedMeal(null);
                    }}
                    style={{ ...buttonPrimary, background: `linear-gradient(135deg, ${colors.success}, #059669)` }}
                  >
                    Mark Served
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── SCHEDULING / EDITING FORM MODAL ─── */}
      {showFormModal && (
        <div style={modalOverlay} onClick={() => setShowFormModal(false)}>
          <div style={{ ...modalBox, width: '560px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: colors.text, fontFamily: "'Outfit', sans-serif", marginBottom: '4px' }}>
              {editingMealId ? '✏️ Edit Meal Donation' : '🍽️ Schedule Meal Donation'}
            </h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>
              {editingMealId ? 'Update the meal donation reservation details.' : 'Choose how the donor would like to contribute a meal.'}
            </p>

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
                        <div style={{ fontWeight: 700, fontSize: '13px', color: form.mealDonationType === 'sponsor' ? colors.primary : colors.text }}>Sponsor a Meal</div>
                        <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '1px' }}>Donate money · Staff cook</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: colors.textSecondary, margin: 0, lineHeight: '1.5' }}>
                      Donor contributes funds. Our orphanage staff will prepare and serve the meal.
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
                        <div style={{ fontWeight: 700, fontSize: '13px', color: form.mealDonationType === 'bringyourown' ? '#a855f7' : colors.text }}>Bring Your Own Meal</div>
                        <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '1px' }}>Self-catered · Donor prepares</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: colors.textSecondary, margin: 0, lineHeight: '1.5' }}>
                      Donor books a date and brings or prepares the meal themselves.
                    </p>
                  </div>

                </div>
              </div>

              {/* ── COMMON FIELDS ── */}
              <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>Select Donor Profile</label>
              <select
                style={selectStyle}
                value={form.donorID}
                onChange={(e) => setForm({ ...form, donorID: e.target.value })}
                required
              >
                <option value="" disabled>-- Select Donor --</option>
                {donors.map(donor => (
                  <option key={donor._id} value={donor._id}>
                    {donor.name} ({donor.email})
                  </option>
                ))}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>Meal Date</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={form.mealDate}
                    onChange={(e) => setForm({ ...form, mealDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>Meal Slot</label>
                  <select
                    style={selectStyle}
                    value={form.mealType}
                    onChange={(e) => setForm({ ...form, mealType: e.target.value })}
                  >
                    <option value="breakfast">🌅 Breakfast</option>
                    <option value="lunch">☀️ Lunch</option>
                    <option value="dinner">🌙 Dinner</option>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <Utensils size={14} color={colors.primary} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Staff-Cooked Meal Options</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>Menu Package</label>
                      <select
                        style={selectStyle}
                        value={form.menuPackage}
                        onChange={(e) => setForm({ ...form, menuPackage: e.target.value })}
                      >
                        <option value="standard">🍛 Standard Menu</option>
                        <option value="special">⭐ Special Menu</option>
                        <option value="feast">🎉 Feast Menu</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>Estimated Cost (LKR)</label>
                      <input
                        type="number"
                        min="0"
                        style={inputStyle}
                        placeholder="e.g. 15000"
                        value={form.estimatedCost}
                        onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                      />
                    </div>
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
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What Will the Donor Bring?</span>
                  </div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>Meal Description / Menu Plan</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: '72px', resize: 'vertical', borderColor: 'rgba(168,85,247,0.3)' }}
                    placeholder="e.g. Rice & curry with 3 side dishes, fresh juice and dessert for all children"
                    value={form.donorCooksMenu}
                    onChange={(e) => setForm({ ...form, donorCooksMenu: e.target.value })}
                    required={form.mealDonationType === 'bringyourown'}
                  />
                </div>
              )}

              {/* ── QUANTITY (always shown) ── */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>Number of Children to Feed</label>
                <input
                  type="number"
                  min="1"
                  style={inputStyle}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                />
              </div>

              {/* Occasion */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>Occasion / Purpose (Optional)</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Birthday celebration, Memorial day"
                  value={form.occasion}
                  onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                />
              </div>

              {/* Dietary Notes */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>Dietary Instructions (Optional)</label>
                <textarea
                  style={{ ...inputStyle, minHeight: '56px', resize: 'vertical' }}
                  placeholder="e.g. Vegetarian only, mild spices, no nuts"
                  value={form.dietaryNotes}
                  onChange={(e) => setForm({ ...form, dietaryNotes: e.target.value })}
                />
              </div>

              {/* Status (Only when editing) */}
              {editingMealId && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>Status</label>
                  <select
                    style={selectStyle}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="received">Completed (Served)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
                <button type="button" style={buttonSecondary} onClick={() => setShowFormModal(false)}>Cancel</button>
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
                  {savingForm ? 'Saving...' : editingMealId ? 'Update Booking' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
