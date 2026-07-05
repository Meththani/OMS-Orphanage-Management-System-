import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { colors, cardStyle, buttonPrimary, buttonSecondary, tableStyle, thStyle, tdStyle } from '../styles';
import { Calendar, Clock, Check, X, AlertCircle } from 'lucide-react';

export default function MealScheduling() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    loadMeals();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/donations/${id}/status`, { status });
      loadMeals();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, color: colors.text, fontSize: '28px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
            Meal Scheduling
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '15px' }}>
            Monitor and complete meal bookings sponsored by donors
          </p>
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
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Date Scheduled</th>
                <th style={thStyle}>Meal Type</th>
                <th style={thStyle}>Donor / Sponsor</th>
                <th style={thStyle}>Quantity</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meals.map((meal) => {
                const date = meal.mealDate ? new Date(meal.mealDate) : new Date(meal.date);
                const isPast = date < new Date().setHours(0,0,0,0);
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
                    <td style={tdStyle}>{meal.donorID?.name || 'Unknown Sponsor'}</td>
                    <td style={tdStyle}>{meal.quantity} Kids portions</td>
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
                      {meal.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
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
                        </div>
                      )}
                      {meal.status === 'received' && (
                        <span style={{ fontSize: '12px', color: colors.textMuted }}>Served successfully</span>
                      )}
                      {meal.status === 'cancelled' && (
                        <span style={{ fontSize: '12px', color: colors.textMuted }}>Cancelled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
