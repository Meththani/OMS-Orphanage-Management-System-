import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import {
  colors, cardStyle, buttonPrimary, buttonSecondary, buttonDanger,
  inputStyle, selectStyle, modalOverlay, modalBox,
} from '../styles';
import { Edit2, Trash2, ShieldAlert, Heart, Calendar, Plus, X } from 'lucide-react';

const emptyForm = {
  childID: '', name: '', DOB: '', gender: 'male', admissionDate: '',
  bloodType: '', allergies: '',
  guardianInfo: { name: '', relation: '', contact: '' },
};

const emptyMedical = {
  diagnosis: '', treatment: '', severity: 'mild', notes: ''
};

const emptyEducation = {
  schoolName: '', grade: '', status: 'enrolled'
};

export default function ChildrenManagement() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Child profile modals
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  
  // Selected detail modal
  const [selectedChild, setSelectedChild] = useState(null);
  
  // Inline medical records form
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [medicalForm, setMedicalForm] = useState(emptyMedical);
  const [savingMedical, setSavingMedical] = useState(false);

  // Inline academic records form
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [educationForm, setEducationForm] = useState(emptyEducation);
  const [savingEducation, setSavingEducation] = useState(false);

  const loadChildren = async () => {
    setLoading(true);
    try {
      const res = await api.get('/children?status=active');
      setChildren(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadChildren(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('guardian.')) {
      const field = name.split('.')[1];
      setForm({ ...form, guardianInfo: { ...form.guardianInfo, [field]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEditing) {
        await api.patch(`/children/${form._id}`, form);
        setShowModal(false);
        setIsEditing(false);
        setForm(emptyForm);
      } else {
        await api.post('/children', form);
        setShowModal(false);
        setForm(emptyForm);
      }
      loadChildren();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const viewChild = async (id) => {
    try {
      const res = await api.get(`/children/${id}`);
      setSelectedChild(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (child) => {
    setForm({
      childID: child.childID,
      name: child.name,
      DOB: new Date(child.DOB).toISOString().split('T')[0],
      gender: child.gender,
      admissionDate: new Date(child.admissionDate).toISOString().split('T')[0],
      bloodType: child.bloodType || '',
      allergies: child.allergies || '',
      guardianInfo: {
        name: child.guardianInfo?.name || '',
        relation: child.guardianInfo?.relation || '',
        contact: child.guardianInfo?.contact || '',
      },
      _id: child._id
    });
    setIsEditing(true);
    setShowModal(true);
    setSelectedChild(null);
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Are you sure you want to archive this child profile?")) return;
    try {
      await api.patch(`/children/${id}/archive`);
      setSelectedChild(null);
      loadChildren();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("WARNING: Are you sure you want to PERMANENTLY delete this child record? This will remove all medical and school logs!")) return;
    try {
      await api.delete(`/children/${id}`);
      setSelectedChild(null);
      loadChildren();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddMedical = async (e) => {
    e.preventDefault();
    setSavingMedical(true);
    setError('');
    try {
      await api.post(`/children/${selectedChild.child._id}/medical-records`, {
        ...medicalForm,
        recordDate: new Date()
      });
      setMedicalForm(emptyMedical);
      setShowMedicalForm(false);
      viewChild(selectedChild.child._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingMedical(false);
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    setSavingEducation(true);
    setError('');
    try {
      await api.post(`/children/${selectedChild.child._id}/education-records`, educationForm);
      setEducationForm(emptyEducation);
      setShowEducationForm(false);
      viewChild(selectedChild.child._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingEducation(false);
    }
  };

  const handleDeleteMedical = async (recordId) => {
    console.log("handleDeleteMedical called for ID:", recordId);
    if (!window.confirm("Are you sure you want to delete this medical record?")) {
      console.log("Deletion cancelled.");
      return;
    }
    setError('');
    try {
      console.log("Sending delete request...");
      const res = await api.delete(`/children/medical-records/${recordId}`);
      console.log("Delete request succeeded:", res);
      await viewChild(selectedChild.child._id);
      console.log("Child details reloaded.");
    } catch (err) {
      console.error("Error deleting medical record:", err);
      setError(err.message);
    }
  };

  const handleDeleteEducation = async (recordId) => {
    console.log("handleDeleteEducation called for ID:", recordId);
    if (!window.confirm("Are you sure you want to delete this academic record?")) {
      console.log("Deletion cancelled.");
      return;
    }
    setError('');
    try {
      console.log("Sending delete request...");
      const res = await api.delete(`/children/education-records/${recordId}`);
      console.log("Delete request succeeded:", res);
      await viewChild(selectedChild.child._id);
      console.log("Child details reloaded.");
    } catch (err) {
      console.error("Error deleting academic record:", err);
      setError(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{
            margin: 0, color: colors.text, fontSize: '28px', fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
          }}>
            Our Children
          </h1>
        </div>
        <button style={buttonPrimary} onClick={() => {
          setIsEditing(false);
          setForm(emptyForm);
          setShowModal(true);
        }}>
          + Add Child
        </button>
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
          Loading children...
        </div>
      ) : children.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px', color: colors.textMuted }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👶</div>
          <p>No children registered yet. Click &quot;+ Add Child&quot; to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {children.map((child) => (
            <div
              key={child._id}
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
                  width: '46px', height: '46px', borderRadius: '50%',
                  background: child.gender === 'male' ? 'rgba(14,165,233,0.15)' : 'rgba(168,85,247,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px'
                }}>
                  {child.gender === 'male' ? '👦' : '👧'}
                </div>
                <div>
                  <span style={{
                    padding: '3px 8px', borderRadius: '4px',
                    background: colors.primaryGlow, color: colors.primary,
                    fontWeight: 700, fontSize: '11px'
                  }}>
                    {child.childID}
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: colors.text, margin: '4px 0 0 0' }}>
                    {child.name}
                  </h3>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', color: colors.textSecondary }}>
                <div>Gender: <strong style={{ color: colors.text, textTransform: 'capitalize' }}>{child.gender}</strong></div>
                <div>Age: <strong style={{ color: colors.text }}>{new Date().getFullYear() - new Date(child.DOB).getFullYear()} yrs</strong></div>
                <div>Blood: <strong style={{ color: colors.text }}>{child.bloodType || 'N/A'}</strong></div>
                <div>Allergies: <strong style={{ color: colors.text }}>{child.allergies || 'None'}</strong></div>
              </div>

              <button
                style={{ ...buttonSecondary, width: '100%', padding: '8px', fontSize: '13px' }}
                onClick={() => viewChild(child._id)}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ─── Add/Edit Child Modal ─── */}
      {showModal && (
        <div style={modalOverlay} onClick={() => {
          setShowModal(false);
          setIsEditing(false);
        }}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>
              {isEditing ? 'Edit Child Profile' : 'Add New Child'}
            </h2>
            <form onSubmit={handleCreateOrUpdate}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Registration ID</label>
              <input style={inputStyle} name="childID" placeholder="Registration ID (e.g. Stu-0054)" value={form.childID} onChange={handleChange} required disabled={isEditing} />
              
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Full Name</label>
              <input style={inputStyle} name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
              
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Date of Birth</label>
              <input style={inputStyle} name="DOB" type="date" value={form.DOB} onChange={handleChange} required />
              
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Gender</label>
              <select style={selectStyle} name="gender" value={form.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Admission Date</label>
              <input style={inputStyle} name="admissionDate" type="date" value={form.admissionDate} onChange={handleChange} required />
              
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Blood Type</label>
              <input style={inputStyle} name="bloodType" placeholder="e.g. O+, A-" value={form.bloodType} onChange={handleChange} />
              
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Allergies</label>
              <input style={inputStyle} name="allergies" placeholder="e.g. Peanuts, Penicillin" value={form.allergies} onChange={handleChange} />

              <div style={{
                borderTop: `1px solid ${colors.border}`,
                paddingTop: '16px', marginTop: '16px', marginBottom: '12px',
              }}>
                <p style={{ fontSize: '13px', color: colors.textMuted, fontWeight: 600, marginBottom: '12px' }}>
                  Guardian Information
                </p>
              </div>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Guardian Name</label>
              <input style={inputStyle} name="guardian.name" placeholder="Guardian name" value={form.guardianInfo.name} onChange={handleChange} />
              
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Relationship</label>
              <input style={inputStyle} name="guardian.relation" placeholder="Relationship" value={form.guardianInfo.relation} onChange={handleChange} />
              
              <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Contact Number</label>
              <input style={inputStyle} name="guardian.contact" placeholder="Contact number" value={form.guardianInfo.contact} onChange={handleChange} />
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" style={buttonSecondary} onClick={() => {
                  setShowModal(false);
                  setIsEditing(false);
                }}>
                  Cancel
                </button>
                <button type="submit" style={buttonPrimary} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── View Child Detail Modal ─── */}
      {selectedChild && (
        <div style={modalOverlay} onClick={() => setSelectedChild(null)}>
          <div style={{ ...modalBox, width: '580px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>
                  {selectedChild.child.name}
                </h2>
                <span style={{ fontSize: '12px', color: colors.textMuted }}>Profile & Health Files</span>
              </div>
              <button 
                onClick={() => startEdit(selectedChild.child)}
                style={{ ...buttonSecondary, padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Edit2 size={13} /> Edit Profile
              </button>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', backgroundColor: colors.dangerGlow,
                border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px',
                color: colors.danger, fontSize: '12px', marginBottom: '16px',
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', padding: '16px', backgroundColor: colors.surface, borderRadius: '12px' }}>
              {[
                ['Reg. ID', selectedChild.child.childID],
                ['DOB', new Date(selectedChild.child.DOB).toLocaleDateString()],
                ['Gender', selectedChild.child.gender],
                ['Blood type', selectedChild.child.bloodType || '-'],
                ['Allergies', selectedChild.child.allergies || 'None'],
                ['Guardian', `${selectedChild.child.guardianInfo?.name || '-'} (${selectedChild.child.guardianInfo?.relation || '-'})`],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '13px', color: colors.text, textTransform: 'capitalize', fontWeight: 500 }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Medical Records Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', marginTop: '20px' }}>
              <h3 style={{ color: colors.text, fontSize: '16px', fontFamily: "'Outfit', sans-serif", margin: 0 }}>
                Medical Health Ledger
              </h3>
              <button
                style={{ ...buttonSecondary, padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => {
                  setShowMedicalForm(!showMedicalForm);
                  setShowEducationForm(false);
                }}
              >
                {showMedicalForm ? 'Cancel' : '+ Add Log'}
              </button>
            </div>

            {/* Add Medical Log Form */}
            {showMedicalForm && (
              <form onSubmit={handleAddMedical} style={{ padding: '14px', border: `1px dashed ${colors.border}`, borderRadius: '10px', marginBottom: '16px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: colors.text }}>New Medical Entry</h4>
                
                <input 
                  style={inputStyle} 
                  placeholder="Diagnosis (e.g. Common cold, Asthma checkup)" 
                  value={medicalForm.diagnosis} 
                  onChange={(e) => setMedicalForm({ ...medicalForm, diagnosis: e.target.value })} 
                  required 
                />
                
                <input 
                  style={inputStyle} 
                  placeholder="Treatment details (e.g. Paracetamol 500mg, Inhaler)" 
                  value={medicalForm.treatment} 
                  onChange={(e) => setMedicalForm({ ...medicalForm, treatment: e.target.value })} 
                  required 
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <select 
                    style={selectStyle} 
                    value={medicalForm.severity} 
                    onChange={(e) => setMedicalForm({ ...medicalForm, severity: e.target.value })}
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                  
                  <button 
                    type="submit" 
                    style={{ ...buttonPrimary, padding: '10px' }} 
                    disabled={savingMedical}
                  >
                    {savingMedical ? 'Saving...' : 'Add Record'}
                  </button>
                </div>
              </form>
            )}

            {selectedChild.medicalRecords.length === 0 ? (
              <p style={{ color: colors.textMuted, fontSize: '13px' }}>No medical history logged yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                {selectedChild.medicalRecords.map((r) => (
                  <div key={r._id} style={{
                    fontSize: '13px', padding: '10px 14px',
                    backgroundColor: colors.surface, borderRadius: '8px', color: colors.textSecondary,
                    borderLeft: `3px solid ${r.severity === 'severe' ? colors.danger : r.severity === 'moderate' ? colors.warning : colors.info}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ color: colors.text }}>{r.diagnosis}</strong>
                        <span style={{ fontSize: '11px', color: colors.textMuted }}>{new Date(r.recordDate).toLocaleDateString()}</span>
                      </div>
                      <div>Treatment: <span style={{ color: colors.textSecondary }}>{r.treatment}</span></div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{
                          padding: '1px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: 700,
                          background: r.severity === 'severe' ? colors.dangerGlow : r.severity === 'moderate' ? colors.warningGlow : colors.primaryGlow,
                          color: r.severity === 'severe' ? colors.danger : r.severity === 'moderate' ? colors.warning : colors.primary,
                          textTransform: 'uppercase'
                        }}>
                          {r.severity}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMedical(r._id)}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '4px', color: colors.textMuted, transition: 'color 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = colors.danger}
                      onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                      title="Delete medical record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Academic Records Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', marginTop: '20px' }}>
              <h3 style={{ color: colors.text, fontSize: '16px', fontFamily: "'Outfit', sans-serif", margin: 0 }}>
                Academic Records
              </h3>
              <button
                style={{ ...buttonSecondary, padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => {
                  setShowEducationForm(!showEducationForm);
                  setShowMedicalForm(false);
                }}
              >
                {showEducationForm ? 'Cancel' : '+ Add Log'}
              </button>
            </div>

            {/* Add Education Log Form */}
            {showEducationForm && (
              <form onSubmit={handleAddEducation} style={{ padding: '14px', border: `1px dashed ${colors.border}`, borderRadius: '10px', marginBottom: '16px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: colors.text }}>New Academic Entry</h4>
                
                <input 
                  style={inputStyle} 
                  placeholder="School/Institution Name" 
                  value={educationForm.schoolName} 
                  onChange={(e) => setEducationForm({ ...educationForm, schoolName: e.target.value })} 
                  required 
                />
                
                <input 
                  style={inputStyle} 
                  placeholder="Grade / Standard (e.g. Grade 5, Kindergarten)" 
                  value={educationForm.grade} 
                  onChange={(e) => setEducationForm({ ...educationForm, grade: e.target.value })} 
                  required 
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <select 
                    style={selectStyle} 
                    value={educationForm.status} 
                    onChange={(e) => setEducationForm({ ...educationForm, status: e.target.value })}
                  >
                    <option value="enrolled">Enrolled</option>
                    <option value="graduated">Graduated</option>
                    <option value="transferred">Transferred</option>
                  </select>
                  
                  <button 
                    type="submit" 
                    style={{ ...buttonPrimary, padding: '10px' }} 
                    disabled={savingEducation}
                  >
                    {savingEducation ? 'Saving...' : 'Add Record'}
                  </button>
                </div>
              </form>
            )}

            {selectedChild.educationRecords.length === 0 ? (
              <p style={{ color: colors.textMuted, fontSize: '13px' }}>No education files logged.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedChild.educationRecords.map((r) => (
                  <div key={r._id} style={{
                    fontSize: '13px', padding: '10px 14px',
                    backgroundColor: colors.surface, borderRadius: '8px', color: colors.textSecondary,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: colors.text }}>{r.schoolName}</strong> — {r.grade} 
                      <span style={{
                        padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                        background: r.status === 'enrolled' ? colors.successGlow : colors.warningGlow,
                        color: r.status === 'enrolled' ? colors.success : colors.warning,
                        marginLeft: '10px', textTransform: 'capitalize'
                      }}>
                        {r.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteEducation(r._id)}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '4px', color: colors.textMuted, transition: 'color 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = colors.danger}
                      onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                      title="Delete education record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '24px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
              <div>
                {user?.role === 'admin' && (
                  <button 
                    style={{ ...buttonSecondary, color: colors.danger, borderColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: '6px' }} 
                    onClick={() => handleDelete(selectedChild.child._id)}
                  >
                    <Trash2 size={14} /> Delete Profile
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={buttonSecondary} onClick={() => setSelectedChild(null)}>Close</button>
                {user?.role === 'admin' && (
                  <button
                    style={{ ...buttonSecondary, color: colors.warning, borderColor: 'rgba(241,156,56,0.2)' }}
                    onClick={() => handleArchive(selectedChild.child._id)}
                  >
                    Archive Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
