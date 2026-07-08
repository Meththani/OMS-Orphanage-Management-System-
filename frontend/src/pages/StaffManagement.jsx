import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import {
  colors, cardStyle, buttonPrimary, buttonSecondary, buttonDanger,
  inputStyle, selectStyle, modalOverlay, modalBox,
} from '../styles';
import { Eye, Edit2, Trash2, X, Phone, User, Calendar, Hash, Briefcase, Award } from 'lucide-react';

const emptyForm = {
  name: '', username: '', password: '', role: 'staff',
  jobRole: '', department: '', contactDetails: '', nic: '', DOB: '',
};

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff');
      setStaff(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStaff(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEditing) {
        await api.patch(`/staff/${editingId}`, form);
        if (selectedStaff && selectedStaff._id === editingId) {
          const res = await api.get(`/staff/${editingId}`);
          setSelectedStaff(res.data);
        }
        setShowModal(false);
        setIsEditing(false);
        setEditingId('');
        setForm(emptyForm);
      } else {
        // Account creation goes through /auth/register (admin-only)
        await api.post('/auth/register', form);
        setShowModal(false);
        setForm(emptyForm);
      }
      loadStaff();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (member) => {
    setForm({
      name: member.name || '',
      username: member.username || '',
      password: '', // blank to keep current
      role: member.role || 'staff',
      jobRole: member.jobRole || '',
      department: member.department || '',
      contactDetails: member.contactDetails || '',
      nic: member.nic || '',
      DOB: member.DOB ? new Date(member.DOB).toISOString().split('T')[0] : '',
    });
    setIsEditing(true);
    setEditingId(member._id);
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("WARNING: Are you sure you want to PERMANENTLY delete this staff profile? This action cannot be undone!")) return;
    try {
      await api.delete(`/staff/${id}`);
      setSelectedStaff(null);
      loadStaff();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (member) => {
    const path = member.isActive
      ? `/staff/${member._id}/deactivate`
      : `/staff/${member._id}/reactivate`;
    try {
      await api.patch(path);
      // Update selectedStaff if currently being viewed in modal
      if (selectedStaff && selectedStaff._id === member._id) {
        const res = await api.get(`/staff/${member._id}`);
        setSelectedStaff(res.data);
      }
      loadStaff();
    } catch (err) {
      setError(err.message);
    }
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setEditingId('');
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId('');
    setForm(emptyForm);
    setError('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{
            margin: 0, color: colors.text, fontSize: '28px', fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
          }}>
            Staff
          </h1>
        </div>
        <button style={buttonPrimary} onClick={openAddModal}>+ Add Staff Member</button>
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

      {loading ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px', color: colors.textMuted }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 12px',
            border: `3px solid ${colors.border}`, borderTopColor: colors.primary,
            animation: 'spin 0.8s linear infinite',
          }} />
          Loading staff...
        </div>
      ) : staff.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px', color: colors.textMuted }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
          <p>No staff members found. Click &quot;+ Add Staff Member&quot; to register.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {staff.map((member) => (
            <div
              key={member._id}
              style={{
                ...cardStyle,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                border: `1px solid ${colors.border}`,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '8px',
                  background: `linear-gradient(135deg, ${colors.primary}, #a855f7)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '18px', fontWeight: 800, flexShrink: 0
                }}>
                  {member.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: colors.text, margin: 0 }}>
                    {member.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{
                      padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                      background: member.role === 'admin' ? colors.dangerGlow : member.role === 'accountant' ? colors.warningGlow : colors.primaryGlow,
                      color: member.role === 'admin' ? colors.danger : member.role === 'accountant' ? colors.warning : colors.primary,
                      textTransform: 'uppercase'
                    }}>
                      {member.role}
                    </span>
                    <span style={{
                      padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                      background: member.isActive ? colors.successGlow : colors.dangerGlow,
                      color: member.isActive ? colors.success : colors.danger,
                    }}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: colors.textSecondary }}>
                <div>Job Title: <strong style={{ color: colors.text }}>{member.jobRole || 'Staff Member'}</strong></div>
                {member.department && <div>Dept: <strong style={{ color: colors.text }}>{member.department}</strong></div>}
                <div>Phone: <strong style={{ color: colors.text }}>{member.contactDetails || 'N/A'}</strong></div>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => setSelectedStaff(member)}
                  title="View Profile Details"
                  style={{
                    ...buttonSecondary,
                    flex: 1,
                    padding: '8px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={14} /> Details
                </button>
                <button
                  onClick={() => startEdit(member)}
                  title="Edit Profile"
                  style={{
                    ...buttonSecondary,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(member._id)}
                  title="Delete Account"
                  style={{
                    ...buttonSecondary,
                    padding: '8px 12px',
                    color: colors.danger,
                    borderColor: 'rgba(239,68,68,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.dangerGlow;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.surface;
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <button
                style={{
                  ...buttonSecondary,
                  width: '100%',
                  padding: '8px',
                  fontSize: '13px',
                  color: member.isActive ? colors.danger : colors.success,
                  borderColor: member.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                }}
                onClick={() => toggleActive(member)}
              >
                {member.isActive ? 'Deactivate Account' : 'Reactivate Account'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ─── Add/Edit Staff Modal ─── */}
      {showModal && (
        <div style={modalOverlay} onClick={closeModal}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>
              {isEditing ? 'Edit Staff Member' : 'Add Staff Member'}
            </h2>
            <form onSubmit={handleCreateOrUpdate}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: colors.textSecondary, marginBottom: '6px' }}>Full Name</label>
              <input style={inputStyle} name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
              
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: colors.textSecondary, marginBottom: '6px' }}>Username</label>
              <input style={inputStyle} name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
              
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: colors.textSecondary, marginBottom: '6px' }}>
                {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
              </label>
              <input 
                style={inputStyle} 
                name="password" 
                type="password" 
                placeholder={isEditing ? "Leave blank to keep unchanged" : "Temporary password (min 8 chars)"} 
                value={form.password} 
                onChange={handleChange} 
                required={!isEditing} 
                minLength={8} 
              />
              
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: colors.textSecondary, marginBottom: '6px' }}>Access Role (Permission level)</label>
              <select style={selectStyle} name="role" value={form.role} onChange={handleChange}>
                <option value="staff">Staff</option>
                <option value="accountant">Accountant</option>
                <option value="admin">Admin</option>
              </select>

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: colors.textSecondary, marginBottom: '6px' }}>Job Title</label>
              <input style={inputStyle} name="jobRole" placeholder="Job title (e.g. Caregiver)" value={form.jobRole} onChange={handleChange} />
              
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: colors.textSecondary, marginBottom: '6px' }}>Department</label>
              <input style={inputStyle} name="department" placeholder="Department" value={form.department} onChange={handleChange} />
              
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: colors.textSecondary, marginBottom: '6px' }}>Phone Number</label>
              <input style={inputStyle} name="contactDetails" placeholder="Phone number" value={form.contactDetails} onChange={handleChange} />

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: colors.textSecondary, marginBottom: '6px' }}>NIC Number</label>
              <input style={inputStyle} name="nic" placeholder="NIC Identification (optional)" value={form.nic || ''} onChange={handleChange} />

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: colors.textSecondary, marginBottom: '6px' }}>Date of Birth</label>
              <input type="date" style={inputStyle} name="DOB" value={form.DOB} onChange={handleChange} />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '18px' }}>
                <button type="button" style={buttonSecondary} onClick={closeModal}>Cancel</button>
                <button type="submit" style={buttonPrimary} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Staff Details Popup Modal ─── */}
      {selectedStaff && (
        <div style={modalOverlay} onClick={() => setSelectedStaff(null)}>
          <div style={{ ...modalBox, width: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '12px',
                  background: `linear-gradient(135deg, ${colors.primary}, #a855f7)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '24px', fontWeight: 800
                }}>
                  {selectedStaff.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h2 style={{ margin: 0, color: colors.text, fontFamily: "'Outfit', sans-serif", fontSize: '22px' }}>
                    {selectedStaff.name}
                  </h2>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                      background: selectedStaff.role === 'admin' ? colors.dangerGlow : selectedStaff.role === 'accountant' ? colors.warningGlow : colors.primaryGlow,
                      color: selectedStaff.role === 'admin' ? colors.danger : selectedStaff.role === 'accountant' ? colors.warning : colors.primary,
                      textTransform: 'uppercase'
                    }}>
                      {selectedStaff.role}
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                      background: selectedStaff.isActive ? colors.successGlow : colors.dangerGlow,
                      color: selectedStaff.isActive ? colors.success : colors.danger,
                    }}>
                      {selectedStaff.isActive ? 'Active Account' : 'Deactivated'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
                style={{
                  background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer',
                  padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              padding: '20px',
              backgroundColor: colors.surface,
              borderRadius: '12px',
              marginBottom: '24px',
              border: `1px solid ${colors.border}`
            }}>
              {[
                { label: 'Username', value: selectedStaff.username, icon: User },
                { label: 'Job Title', value: selectedStaff.jobRole || 'N/A', icon: Briefcase },
                { label: 'Department', value: selectedStaff.department || 'N/A', icon: Award },
                { label: 'NIC Number', value: selectedStaff.nic || 'N/A', icon: Hash },
                { label: 'Contact Phone', value: selectedStaff.contactDetails || 'N/A', icon: Phone },
                { label: 'Date of Birth', value: selectedStaff.DOB ? new Date(selectedStaff.DOB).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A', icon: Calendar },
                { label: 'Profile Created', value: selectedStaff.createdAt ? new Date(selectedStaff.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A', icon: Calendar },
                { label: 'Last Updated', value: selectedStaff.updatedAt ? new Date(selectedStaff.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A', icon: Calendar },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Icon size={16} style={{ color: colors.textMuted, marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '13px', color: colors.text, fontWeight: 500 }}>
                      {value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                style={{ ...buttonSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => {
                  startEdit(selectedStaff);
                }}
              >
                <Edit2 size={14} /> Edit Profile
              </button>
              <button
                style={{
                  ...buttonSecondary,
                  color: selectedStaff.isActive ? colors.danger : colors.success,
                  borderColor: selectedStaff.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                }}
                onClick={async () => {
                  await toggleActive(selectedStaff);
                }}
              >
                {selectedStaff.isActive ? 'Deactivate Account' : 'Reactivate Account'}
              </button>
              <button
                style={{ ...buttonDanger, display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => handleDelete(selectedStaff._id)}
              >
                <Trash2 size={14} /> Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
