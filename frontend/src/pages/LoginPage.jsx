import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
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
      position: 'relative',
    }}>
      {/* Back to Website Link */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'transparent',
          border: 'none',
          padding: 0,
          color: colors.textMuted || '#64748b',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          transition: 'all 0.2s ease',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = colors.primary;
          e.currentTarget.style.transform = 'translateX(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = colors.textMuted || '#64748b';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        <ArrowLeft size={14} /> Back to Website
      </button>
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
            Senehasa Dari Sewana
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 600,
                color: colors.textSecondary, margin: 0,
              }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{
                  background: 'none', border: 'none', color: colors.primary,
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0,
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Forgot Password?
              </button>
            </div>
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

      {/* ─── Forgot Password Modal ─── */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowForgotModal(false)}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            width: '420px',
            maxWidth: '90vw',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: colors.text, fontFamily: "'Outfit', sans-serif", fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔑 Reset Password
            </h2>
            <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.5', marginTop: '12px', marginBottom: '20px' }}>
              For security reasons, your account credentials can only be reset by a <strong>System Administrator</strong>.
            </p>
            <div style={{
              backgroundColor: colors.surface,
              padding: '16px',
              borderRadius: '10px',
              fontSize: '13px',
              color: colors.textSecondary,
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              <div>1. Reach out to the admin or Center Warden.</div>
              <div>2. Request a password reset from the <strong>Staff Management</strong> module.</div>
              <div>3. Log in using the temporary password provided by the Admin.</div>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: `linear-gradient(135deg, ${colors.primary}, #4f46e5)`,
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
            >
              Okay, I understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
