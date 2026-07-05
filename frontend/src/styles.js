/* ─── Shared style objects used by all page components ───
   These use CSS-in-JS objects (React inline styles).
   They complement the global index.css design tokens.           */

export const colors = {
  primary: '#1d70b8', // Royal blue from the kids silhouette
  primaryDark: '#154e80',
  primaryGlow: 'rgba(29, 112, 184, 0.15)',
  sidebar: '#0c3254', // Deep contrast navy blue for sidebar
  background: 'rgba(230, 241, 252, 0.72)',
  card: 'rgba(255, 255, 255, 0.75)',
  cardSolid: '#ffffff',
  surface: '#f1f6fb',
  border: 'rgba(15, 23, 42, 0.08)',
  borderHover: 'rgba(15, 23, 42, 0.15)',
  text: '#1e293b',
  textSecondary: '#475569',
  textMuted: '#64748b',
  success: '#10b981',
  successGlow: 'rgba(16, 185, 129, 0.12)',
  warning: '#f19c38', // Warm amber from kids silhouette
  warningGlow: 'rgba(241, 156, 56, 0.15)',
  danger: '#ef4444',
  dangerGlow: 'rgba(239, 68, 68, 0.12)',
  info: '#0ea5e9',
};

export const cardStyle = {
  backgroundColor: colors.card,
  borderRadius: '16px',
  padding: '24px',
  border: `1px solid ${colors.border}`,
  backdropFilter: 'blur(12px)',
  boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.06), 0 1px 1px 0 rgba(255, 255, 255, 0.6) inset',
};

export const buttonPrimary = {
  background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '10px 20px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '14px',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  transition: 'all 0.2s ease',
  boxShadow: `0 4px 14px ${colors.primaryGlow}`,
};

export const buttonSecondary = {
  backgroundColor: colors.surface,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: '10px',
  padding: '10px 20px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '14px',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  transition: 'all 0.2s ease',
};

export const buttonDanger = {
  background: `linear-gradient(135deg, ${colors.danger}, #dc2626)`,
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '10px 20px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '14px',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  transition: 'all 0.2s ease',
  boxShadow: `0 4px 14px ${colors.dangerGlow}`,
};

export const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: `1px solid ${colors.border}`,
  backgroundColor: '#ffffff', // Clean white background for light theme input fields
  color: colors.text,
  fontSize: '14px',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  marginBottom: '14px',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.2s ease',
};

export const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: '36px',
};

export const tableStyle = { width: '100%', borderCollapse: 'collapse' };

export const thStyle = {
  textAlign: 'left',
  padding: '14px 16px',
  fontSize: '11px',
  color: colors.textMuted,
  borderBottom: `1px solid ${colors.border}`,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 600,
};

export const tdStyle = {
  padding: '14px 16px',
  fontSize: '14px',
  borderBottom: `1px solid ${colors.border}`,
  color: colors.textSecondary,
};

export const modalOverlay = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.4)', // Soft overlay on light theme
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

export const modalBox = {
  backgroundColor: colors.cardSolid,
  borderRadius: '16px',
  padding: '32px',
  width: '480px',
  maxWidth: '90vw',
  maxHeight: '85vh',
  overflowY: 'auto',
  border: `1px solid ${colors.border}`,
  boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
};
