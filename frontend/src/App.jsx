import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ChildrenManagement from './pages/ChildrenManagement';
import DonationsManagement from './pages/DonationsManagement';
import StaffManagement from './pages/StaffManagement';
import PublicWebsite from './pages/PublicWebsite';
import MealScheduling from './pages/MealScheduling';
import InventoryManagement from './pages/InventoryManagement';
import IncomeManagement from './pages/IncomeManagement';
import ExpenseManagement from './pages/ExpenseManagement';
import BankAccountManagement from './pages/BankAccountManagement';
import PortalSettings from './pages/PortalSettings';
import { colors } from './styles';
import {
  LayoutDashboard, Baby, Heart, Users, LogOut, Shield, Calendar, Package, Landmark, FileText, TrendingUp, Settings
} from 'lucide-react';

/* ─── Sidebar navigation link ─── */
function SidebarLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/portal'}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '11px 16px',
        borderRadius: '10px',
        color: isActive ? '#fff' : colors.textMuted,
        background: isActive
          ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`
          : 'transparent',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: isActive ? 600 : 500,
        transition: 'all 0.2s ease',
        marginBottom: '4px',
        boxShadow: isActive ? `0 4px 14px ${colors.primaryGlow}` : 'none',
      })}
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

/* ─── Main layout with sidebar ─── */
function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: '260px',
        backgroundColor: colors.sidebar,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo-icon.png" alt="OMS Logo" style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              boxShadow: `0 4px 14px ${colors.primaryGlow}`,
            }} />
            <div>
              <div style={{
                fontSize: '16px', fontWeight: 700, color: colors.text,
                fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em',
              }}>
                OMS Portal
              </div>
              <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'capitalize' }}>
                {user.role} workspace
              </div>
            </div>
          </div>
        </div>

        {/* Nav links based on Role */}
        <nav style={{ padding: '16px 14px', flex: 1, overflowY: 'auto' }}>
          <div style={{
            fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase',
            letterSpacing: '0.08em', fontWeight: 600, padding: '0 16px', marginBottom: '10px',
          }}>
            Main Menu
          </div>

          {(user.role === 'admin' || user.role === 'staff') && (
            <>
              <SidebarLink to="/portal/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <SidebarLink to="/portal/children" icon={Baby} label="Children" />
              {user.role === 'admin' && (
                <SidebarLink to="/portal/staff" icon={Users} label="Staff Management" />
              )}
              <SidebarLink to="/portal/meals" icon={Calendar} label="Meal Scheduling" />
              <SidebarLink to="/portal/inventory" icon={Package} label="View Inventory" />
              <SidebarLink to="/portal/donations" icon={Heart} label="View Donation" />
            </>
          )}

          {user.role === 'accountant' && (
            <>
              <SidebarLink to="/portal/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <SidebarLink to="/portal/donations" icon={Heart} label="Donations" />
              <SidebarLink to="/portal/income" icon={TrendingUp} label="Income" />
              <SidebarLink to="/portal/expenses" icon={FileText} label="Expenses" />
              <SidebarLink to="/portal/accounts" icon={Landmark} label="Bank Account" />
            </>
          )}

          <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: '16px', paddingTop: '16px' }} />
          <SidebarLink to="/portal/settings" icon={Settings} label="Settings" />
        </nav>

        {/* User profile & logout */}
        <div style={{
          padding: '16px 14px',
          borderTop: `1px solid ${colors.border}`,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            marginBottom: '10px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: `linear-gradient(135deg, ${colors.primary}, #a855f7)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '14px', fontWeight: 700, flexShrink: 0,
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '13px', fontWeight: 600, color: colors.text,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.name}
              </div>
              <div style={{
                fontSize: '11px', color: colors.textMuted, display: 'flex',
                alignItems: 'center', gap: '4px',
              }}>
                <Shield size={10} />
                <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '10px',
              border: `1px solid ${colors.border}`,
              backgroundColor: 'transparent',
              color: colors.textMuted,
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.dangerGlow;
              e.currentTarget.style.color = colors.danger;
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.textMuted;
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main style={{
        flex: 1,
        marginLeft: '260px',
        padding: '32px 40px',
        backgroundColor: 'transparent',
        minHeight: '100vh',
      }}>
        <Routes>
          {/* Common Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Staff / Admin pages */}
          <Route path="/children" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <ChildrenManagement />
            </ProtectedRoute>
          } />
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffManagement />
            </ProtectedRoute>
          } />
          <Route path="/meals" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <MealScheduling />
            </ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <InventoryManagement />
            </ProtectedRoute>
          } />

          {/* Accountant pages */}
          <Route path="/income" element={
            <ProtectedRoute allowedRoles={['accountant', 'admin']}>
              <IncomeManagement />
            </ProtectedRoute>
          } />
          <Route path="/expenses" element={
            <ProtectedRoute allowedRoles={['accountant', 'admin']}>
              <ExpenseManagement />
            </ProtectedRoute>
          } />
          <Route path="/accounts" element={
            <ProtectedRoute allowedRoles={['accountant', 'admin']}>
              <BankAccountManagement />
            </ProtectedRoute>
          } />

          {/* Donations view (accessible to admin, staff, accountant) */}
          <Route path="/donations" element={
            <ProtectedRoute allowedRoles={['admin', 'staff', 'accountant']}>
              <DonationsManagement />
            </ProtectedRoute>
          } />

          {/* Account settings (accessible to all authenticated users) */}
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['admin', 'staff', 'accountant']}>
              <PortalSettings />
            </ProtectedRoute>
          } />

          {/* Catch-all portal redirects to dashboard */}
          <Route path="*" element={<Navigate to="/portal/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

/* ─── Root App component ─── */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<PublicWebsite initialTab="home" />} />
          <Route path="/facilities" element={<PublicWebsite initialTab="facilities" />} />
          <Route path="/programs" element={<PublicWebsite initialTab="programs" />} />
          <Route path="/contact" element={<PublicWebsite initialTab="contact" />} />
          <Route path="/donate" element={<PublicWebsite initialTab="donate" />} />

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Portal Space */}
          <Route path="/portal/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />

          {/* Catch-all redirects to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
