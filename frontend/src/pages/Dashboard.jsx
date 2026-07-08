import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { colors, cardStyle, buttonSecondary } from '../styles';
import {
  Baby, Users, DollarSign, Heart, Activity, TrendingUp, Mail, Landmark, FileText, Calendar, Check, AlertCircle
} from 'lucide-react';

/* ─── Stat Card component ─── */
function StatCard({ icon: Icon, label, value, color, glow, onClick }) {
  return (
    <div
      style={{
        ...cardStyle,
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flex: '1 1 220px',
        minWidth: '220px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 14px 40px -10px rgba(0,0,0,0.6), 0 0 20px ${glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = cardStyle.boxShadow;
      }}
    >
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: glow, display: 'flex', alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '26px', fontWeight: 800, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>
          {value}
        </div>
        <div style={{ fontSize: '13px', color: colors.textMuted, fontWeight: 500 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Staff / Admin Dashboard States
  const [staffStats, setStaffStats] = useState({
    totalChildren: 0,
    activeStaff: 0,
    pendingDonations: 0,
    mealsToday: 0,
  });
  const [messages, setMessages] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);

  // 2. Accountant Dashboard States
  const [financialStats, setFinancialStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    recentTransactions: [],
  });
  const [bankAccounts, setBankAccounts] = useState([]);

  const fetchStaffDashboard = async () => {
    try {
      const [childRes, donationRes, mealRes, msgRes] = await Promise.all([
        api.get('/children?status=active').catch(() => ({ data: [] })),
        api.get('/donations').catch(() => ({ data: [] })),
        api.get('/donations?type=meal').catch(() => ({ data: [] })),
        api.get('/messages').catch(() => ({ data: [] })),
      ]);

      let staffCount = 0;
      if (user?.role === 'admin') {
        const staffRes = await api.get('/staff').catch(() => ({ data: [] }));
        staffCount = (staffRes.data || []).filter(s => s.isActive).length;
      }

      const pending = (donationRes.data || []).filter(d => d.status === 'pending').length;
      
      const todayStr = new Date().toDateString();
      const todayMeals = (mealRes.data || []).filter(m => {
        const mDate = m.mealDate ? new Date(m.mealDate) : new Date(m.date);
        return mDate.toDateString() === todayStr && m.status === 'received';
      }).length;

      setStaffStats({
        totalChildren: (childRes.data || []).length,
        activeStaff: staffCount,
        pendingDonations: pending,
        mealsToday: todayMeals,
      });

      setMessages((msgRes.data || []).slice(0, 5));
      setRecentDonations((donationRes.data || []).slice(0, 5));
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAccountantDashboard = async () => {
    try {
      const [finRes, bankRes] = await Promise.all([
        api.get('/finances/summary').catch(() => ({ data: { totalBankBalance: 0, totalIncome: 0, totalExpenses: 0, recentTransactions: [] } })),
        api.get('/finances/bank-accounts').catch(() => ({ data: [] })),
      ]);

      const finData = finRes.data || { totalBankBalance: 0, totalIncome: 0, totalExpenses: 0, recentTransactions: [] };
      setFinancialStats({
        totalBalance: finData.totalBankBalance,
        totalIncome: finData.totalIncome,
        totalExpenses: finData.totalExpenses,
        recentTransactions: finData.recentTransactions || [],
      });
      setBankAccounts(bankRes.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMessageStatus = async (id, status) => {
    try {
      await api.patch(`/messages/${id}/status`, { status });
      fetchStaffDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      if (user?.role === 'admin' || user?.role === 'staff') {
        await fetchStaffDashboard();
      } else if (user?.role === 'accountant') {
        await fetchAccountantDashboard();
      }
      setLoading(false);
    };

    if (user) {
      loadDashboard();
    }
  }, [user]);

  const greeting = () => {
    const hr = new Date().getHours();
    return hr < 12 ? 'Good Morning' : hr < 17 ? 'Good Afternoon' : 'Good Evening';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: colors.textMuted }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          border: `3px solid ${colors.border}`, borderTopColor: colors.primary,
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div>
      {/* Greeting Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: colors.text, margin: '0 0 6px', fontFamily: "'Outfit', sans-serif" }}>
          {greeting()}, {user?.name || 'User'} 👋
        </h1>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: colors.dangerGlow, border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: colors.danger, fontSize: '13px', marginBottom: '24px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ─── STAFF & ADMIN LAYOUT ─── */}
      {(user?.role === 'admin' || user?.role === 'staff') && (
        <div>
          {/* Stats row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
            <StatCard icon={Baby} label="Active Children" value={staffStats.totalChildren} color={colors.info} glow="rgba(14,165,233,0.12)" />
            {user?.role === 'admin' && (
              <StatCard icon={Users} label="Active Staff" value={staffStats.activeStaff} color={colors.success} glow={colors.successGlow} />
            )}
            <StatCard icon={Heart} label="Pending Donations" value={staffStats.pendingDonations} color={colors.warning} glow={colors.warningGlow} />
            <StatCard icon={Calendar} label="Meals Scheduled Today" value={staffStats.mealsToday} color={colors.primary} glow={colors.primaryGlow} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
            {/* Contact messages inbox */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Outfit', sans-serif" }}>
                <Mail size={18} color={colors.primary} /> Public Website Inquiries
              </h2>

              {messages.length === 0 ? (
                <p style={{ color: colors.textMuted, fontSize: '14px' }}>No messages in inbox.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {messages.map((msg) => (
                    <div key={msg._id} style={{
                      padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}`,
                      backgroundColor: msg.status === 'pending' ? 'rgba(99,102,241,0.02)' : 'transparent',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '14px' }}>{msg.firstName} {msg.lastName}</span>
                          <span style={{ fontSize: '11px', color: colors.textMuted, marginLeft: '8px' }}>({msg.email})</span>
                        </div>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                          background: msg.status === 'pending' ? colors.warningGlow : colors.successGlow,
                          color: msg.status === 'pending' ? colors.warning : colors.success,
                          textTransform: 'uppercase'
                        }}>{msg.status}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: colors.textSecondary, lineHeight: 1.5, margin: '0 0 12px 0' }}>
                        &quot;{msg.message}&quot;
                      </p>
                      
                      {msg.status === 'pending' && (
                        <button
                          onClick={() => handleMessageStatus(msg._id, 'read')}
                          style={{
                            ...buttonSecondary, display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '4px 10px', fontSize: '11px', borderRadius: '6px'
                          }}
                        >
                          <Check size={12} /> Mark Read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Donations list */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Outfit', sans-serif" }}>
                <Heart size={18} color={colors.warning} /> Recent Donations Log
              </h2>

              {recentDonations.length === 0 ? (
                <p style={{ color: colors.textMuted, fontSize: '14px' }}>No donations registered.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {recentDonations.map((d) => (
                    <div key={d._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${colors.border}` }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>{d.donorID?.name || 'Anonymous Donor'}</div>
                        <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
                          Type: <span style={{ textTransform: 'capitalize' }}>{d.type}</span> | {new Date(d.date || d.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: colors.primary }}>
                          {d.type === 'cash' ? `LKR ${d.amount?.toLocaleString()}` : `${d.quantity} units`}
                        </div>
                        <span style={{ fontSize: '11px', color: d.status === 'received' ? colors.success : colors.warning, textTransform: 'capitalize' }}>
                          {d.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── ACCOUNTANT LAYOUT ─── */}
      {user?.role === 'accountant' && (
        <div>
          {/* Stats row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
            <StatCard icon={Landmark} label="Total Bank Balance" value={`LKR ${financialStats.totalBalance.toLocaleString()}`} color={colors.success} glow={colors.successGlow} />
            <StatCard icon={TrendingUp} label="Total Income" value={`LKR ${financialStats.totalIncome.toLocaleString()}`} color={colors.primary} glow={colors.primaryGlow} />
            <StatCard icon={FileText} label="Total Expenses" value={`LKR ${financialStats.totalExpenses.toLocaleString()}`} color={colors.danger} glow={colors.dangerGlow} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
            {/* Recent financial transactions */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Outfit', sans-serif" }}>
                <Activity size={18} color={colors.primary} /> Recent Transactions Ledger
              </h2>

              {financialStats.recentTransactions.length === 0 ? (
                <p style={{ color: colors.textMuted, fontSize: '14px' }}>No transaction records found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {financialStats.recentTransactions.map((tx) => (
                    <div key={tx._id} style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '14px 0', borderBottom: `1px solid ${colors.border}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                            background: tx.type === 'income' ? colors.successGlow : colors.dangerGlow,
                            color: tx.type === 'income' ? colors.success : colors.danger,
                            textTransform: 'uppercase'
                          }}>{tx.type}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>{tx.category}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>{tx.description}</div>
                      </div>
                      
                      <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: tx.type === 'income' ? colors.success : colors.danger }}>
                          {tx.type === 'income' ? '+' : '-'} LKR {tx.amount.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>{new Date(tx.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bank account summaries */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Outfit', sans-serif" }}>
                <Landmark size={18} color={colors.success} /> Active Accounts
              </h2>

              {bankAccounts.length === 0 ? (
                <p style={{ color: colors.textMuted, fontSize: '14px' }}>No active bank accounts.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {bankAccounts.map((acc) => (
                    <div key={acc._id} style={{
                      padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}`,
                      background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: colors.text }}>{acc.accountName}</div>
                        <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '2px' }}>{acc.bankName}</div>
                        <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: 'monospace', marginTop: '4px' }}>{acc.accountNumber}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: colors.success }}>LKR {acc.balance.toLocaleString()}</div>
                        <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>Available</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
