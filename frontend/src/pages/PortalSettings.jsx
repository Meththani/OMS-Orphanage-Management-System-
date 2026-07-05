import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';
import {
  colors, cardStyle, buttonPrimary, inputStyle
} from '../styles';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export default function PortalSettings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch('/auth/update-credentials', {
        username: form.username,
        password: form.password,
        newPassword: form.newPassword
      });

      setSuccess('Credentials updated successfully.');
      updateUser({ ...user, username: res.user.username });
      setForm({
        username: res.user.username,
        password: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          margin: 0, color: colors.text, fontSize: '28px', fontWeight: 700,
          fontFamily: "'Outfit', sans-serif"
        }}>
          Account Settings
        </h1>
        <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '15px' }}>
          Change your username or update your password
        </p>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, color: colors.text, fontSize: '20px', fontFamily: "'Outfit', sans-serif", marginBottom: '20px' }}>
          Update Security Credentials
        </h2>

        {success && (
          <div style={{
            padding: '12px 16px', backgroundColor: colors.successGlow,
            border: `1px solid rgba(16,185,129,0.3)`, borderRadius: '10px',
            color: colors.success, fontSize: '13px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <ShieldCheck size={16} /> {success}
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px 16px', backgroundColor: colors.dangerGlow,
            border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
            color: colors.danger, fontSize: '13px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.textSecondary, marginBottom: '6px' }}>
            Username
          </label>
          <input
            style={inputStyle}
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.textSecondary, marginBottom: '6px' }}>
            Current Password <span style={{ color: colors.danger }}>*</span>
          </label>
          <input
            style={inputStyle}
            name="password"
            type="password"
            placeholder="Required to authorize change"
            value={form.password}
            onChange={handleChange}
            required
          />

          <div style={{ borderTop: `1px solid ${colors.border}`, margin: '20px 0', paddingTop: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: colors.text }}>
              Change Password (Optional)
            </h3>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.textSecondary, marginBottom: '6px' }}>
              New Password
            </label>
            <input
              style={inputStyle}
              name="newPassword"
              type="password"
              placeholder="Minimum 8 characters"
              value={form.newPassword}
              onChange={handleChange}
              minLength={8}
            />

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.textSecondary, marginBottom: '6px' }}>
              Confirm New Password
            </label>
            <input
              style={inputStyle}
              name="confirmPassword"
              type="password"
              placeholder="Re-type new password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="submit"
              style={{ ...buttonPrimary, padding: '12px 30px' }}
              disabled={loading}
            >
              {loading ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
