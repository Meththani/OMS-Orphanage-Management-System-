import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.toLowerCase(), password);
      navigate('/portal/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
    }}>
      {/* Decorative orbs */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        borderRadius: '50%', background: 'rgba(99,102,241,0.06)',
        filter: 'blur(80px)', top: '-100px', left: '-100px', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '300px', height: '300px',
        borderRadius: '50%', background: 'rgba(16,185,129,0.05)',
        filter: 'blur(60px)', bottom: '-50px', right: '-50px', pointerEvents: 'none',
      }} />

      <div style={{
        width: '420px',
        maxWidth: '90vw',
        backgroundColor: colors.card,
        borderRadius: '20px',
        padding: '48px 40px',
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.08)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <img src="/logo-icon.png" alt="OMS Logo" style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'block',
            margin: '0 auto 16px',
            boxShadow: `0 8px 24px ${colors.primaryGlow}`,
          }} />
          <h1 style={{
            fontSize: '26px', fontWeight: 700, color: colors.text,
            margin: '0 0 6px', fontFamily: "'Outfit', sans-serif",
            letterSpacing: '-0.02em',
          }}>
            Orphanage Management
          </h1>
          <p style={{ color: colors.textMuted, fontSize: '14px', margin: 0 }}>
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: colors.dangerGlow,
            border: `1px solid rgba(239,68,68,0.3)`,
            borderRadius: '10px',
            color: colors.danger,
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block', fontSize: '13px', fontWeight: 600,
              color: colors.textSecondary, marginBottom: '8px',
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '10px',
                border: `1px solid ${colors.border}`, backgroundColor: colors.surface,
                color: colors.text, fontSize: '14px', outline: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block', fontSize: '13px', fontWeight: 600,
              color: colors.textSecondary, marginBottom: '8px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '10px',
                border: `1px solid ${colors.border}`, backgroundColor: colors.surface,
                color: colors.text, fontSize: '14px', outline: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: loading
                ? colors.surface
                : `linear-gradient(135deg, ${colors.primary}, #4f46e5)`,
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : `0 4px 20px ${colors.primaryGlow}`,
            }}
          >
            {loading ? '⏳ Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: '24px',
          fontSize: '12px', color: colors.textMuted,
        }}>
          Contact your administrator for access
        </p>
      </div>
    </div>
  );
}
