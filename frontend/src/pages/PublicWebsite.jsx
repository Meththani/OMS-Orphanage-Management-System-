import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, cardStyle, buttonPrimary, buttonSecondary, inputStyle, selectStyle, modalOverlay, modalBox } from '../styles';
import { Heart, Phone, Mail, MapPin, Calendar, Clock, Award, ShieldAlert, Check } from 'lucide-react';

import { useEffect } from 'react';

export default function PublicWebsite({ initialTab = 'home' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Cash Donation Form State
  const [cashForm, setCashForm] = useState({ name: '', email: '', contactDetails: '', type: 'individual', amount: '50', paymentMethod: 'online' });
  const [cashSuccess, setCashSuccess] = useState(false);
  const [cashLoading, setCashLoading] = useState(false);

  // Meal Booking Form State
  const [mealForm, setMealForm] = useState({ name: '', email: '', contactDetails: '', mealDate: '', mealType: 'lunch', quantity: '50' });
  const [mealSuccess, setMealSuccess] = useState(false);
  const [mealLoading, setMealLoading] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setContactSuccess(true);
        setContactForm({ firstName: '', lastName: '', email: '', phone: '', message: '' });
        setTimeout(() => setContactSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setContactLoading(false);
    }
  };

  const handleCashSubmit = async (e) => {
    e.preventDefault();
    setCashLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/public/donate-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cashForm),
      });
      if (res.ok) {
        setCashSuccess(true);
        setCashForm({ name: '', email: '', contactDetails: '', type: 'individual', amount: '50', paymentMethod: 'online' });
        setTimeout(() => {
          setCashSuccess(false);
          setShowCashModal(false);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCashLoading(false);
    }
  };

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    setMealLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/public/book-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealForm),
      });
      if (res.ok) {
        setMealSuccess(true);
        setMealForm({ name: '', email: '', contactDetails: '', mealDate: '', mealType: 'lunch', quantity: '50' });
        setTimeout(() => {
          setMealSuccess(false);
          setShowMealModal(false);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMealLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', color: colors.text }}>
      {/* ─── Premium Glassmorphism Navbar ─── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 1000,
        backdropFilter: 'blur(16px)', backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '0 40px', height: '80px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
          <img src="/logo-icon.png" alt="OMS Logo" style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            boxShadow: `0 4px 14px ${colors.primaryGlow}`,
          }} />
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>OMS</div>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Orphanage Management</div>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          {['home', 'facilities', 'programs', 'contact', 'donate'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', color: activeTab === tab ? colors.primary : colors.textSecondary,
                fontSize: '14px', fontWeight: activeTab === tab ? 700 : 500, cursor: 'pointer',
                padding: '8px 4px', position: 'relative', transition: 'color 0.2s ease',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
                  borderRadius: '2px', background: `linear-gradient(90deg, ${colors.primary}, #a855f7)`
                }} />
              )}
            </button>
          ))}
          
          <button
            onClick={() => navigate('/login')}
            style={{
              ...buttonSecondary,
              padding: '8px 18px', fontSize: '13px', borderRadius: '8px',
              marginLeft: '12px'
            }}
          >
            Portal Login
          </button>
        </nav>
      </header>

      {/* ─── Main Content Container ─── */}
      <main style={{ padding: '48px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* ─── HOME TAB ─── */}
        {activeTab === 'home' && (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            {/* Hero Section */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '48px', marginBottom: '80px',
              padding: '60px 48px', borderRadius: '24px',
              background: `linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.03) 50%, rgba(9,13,22,0.8) 100%)`,
              border: `1px solid ${colors.border}`, position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ flex: 1, zIndex: 1 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '30px', background: 'rgba(99, 102, 241, 0.1)',
                  color: colors.primary, fontSize: '12px', fontWeight: 700, marginBottom: '20px'
                }}>
                  <Heart size={12} fill={colors.primary} /> Welcome to Charity
                </div>
                <h1 style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1.15, marginBottom: '24px', fontFamily: "'Outfit', sans-serif" }}>
                  Helping Each Other <br />Can Make <span style={{ background: `linear-gradient(135deg, ${colors.primary}, #a855f7)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>World Better</span>
                </h1>
                <p style={{ color: colors.textSecondary, fontSize: '16px', lineHeight: 1.6, marginBottom: '32px', maxWidth: '520px' }}>
                  Every child deserves a secure home, quality education, proper nutrition, and a chance to build a brighter future. Join our community in giving care, hope, and love.
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button style={buttonPrimary} onClick={() => setActiveTab('donate')}>Donate Now</button>
                  <button style={buttonSecondary} onClick={() => setActiveTab('contact')}>Get In Touch</button>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <div style={{
                  width: '380px', height: '380px', borderRadius: '30px',
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '120px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                  position: 'relative'
                }}>
                  👶
                  <div style={{
                    position: 'absolute', bottom: '-20px', left: '-20px',
                    backgroundColor: colors.cardSolid, border: `1px solid ${colors.border}`,
                    borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                  }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: colors.successGlow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>❤️</div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>50+ Children</div>
                      <div style={{ fontSize: '11px', color: colors.textMuted }}>Supported and Cared For</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Us section */}
            <div style={{ display: 'flex', gap: '60px', marginBottom: '80px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '20px', fontFamily: "'Outfit', sans-serif" }}>
                  Your Support Is <span style={{ color: colors.primary }}>Really Powerful</span>
                </h2>
                <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
                  Our facility serves as a refuge for orphaned, abandoned, or underprivileged children, providing them with a safe, caring, and nurturing environment. Through comprehensive childhood support plans, we guide their physical, social, cognitive, and creative development.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
                  <div style={{ ...cardStyle, padding: '20px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ color: colors.info, fontSize: '24px', marginBottom: '8px' }}>🎯</div>
                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Our Mission</div>
                    <div style={{ fontSize: '13px', color: colors.textMuted }}>To offer children safe sanctuary, quality health, tailored learning, and life coaching.</div>
                  </div>
                  <div style={{ ...cardStyle, padding: '20px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ color: colors.success, fontSize: '24px', marginBottom: '8px' }}>✨</div>
                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Our Vision</div>
                    <div style={{ fontSize: '13px', color: colors.textMuted }}>A world where every orphaned child becomes an empowered, successful member of society.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── FACILITIES TAB ─── */}
        {activeTab === 'facilities' && (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
                FACILITIES - Six Pillars of Child Development
              </h2>
              <p style={{ color: colors.textMuted, marginTop: '8px', fontSize: '16px', maxWidth: '600px', margin: '8px auto 0' }}>
                We structure child care across six developmental areas, offering tailored spaces and equipment.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {[
                { title: 'Education', icon: '📚', desc: 'Formal schooling support, classroom setups, textbook distributions, and homework tutoring panels.', color: '#3b82f6' },
                { title: 'Tuition Classes', icon: '📝', desc: 'Supplemental academic coaching in Math, Science, and Languages to reinforce school performance.', color: '#10b981' },
                { title: 'Extra-curricular Activities', icon: '🎭', desc: 'Debating societies, chess clubs, leadership circles, and scout groups to build life-readiness.', color: '#f59e0b' },
                { title: 'Sport Activities', icon: '⚽', desc: 'Physical coordination, outdoor games, track sports, and matches to build teamwork and healthy habits.', color: '#ef4444' },
                { title: 'Health & Nutrition', icon: '🍎', desc: 'Balanced diet planning, fresh daily milk, pediatric checkups, and routine medicine distributions.', color: '#0ea5e9' },
                { title: 'Creative Arts', icon: '🎨', desc: 'Drama classes, traditional dancing, watercolor painting, and musical instrument lessons.', color: '#8b5cf6' },
              ].map((fac, idx) => (
                <div key={idx} style={{ ...cardStyle, borderTop: `4px solid ${fac.color}`, position: 'relative' }}>
                  <div style={{ fontSize: '36px', marginBottom: '16px' }}>{fac.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, marginBottom: '8px' }}>{fac.title}</h3>
                  <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: 1.6 }}>{fac.desc}</p>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '56px', padding: '40px', borderRadius: '16px', backgroundColor: colors.card,
              border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-around', textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: colors.primary, fontFamily: "'Outfit', sans-serif" }}>100%</div>
                <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>Enrolment Rate</div>
              </div>
              <div style={{ width: '1px', backgroundColor: colors.border }} />
              <div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: colors.success, fontFamily: "'Outfit', sans-serif" }}>6 Pillars</div>
                <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>Development Structure</div>
              </div>
              <div style={{ width: '1px', backgroundColor: colors.border }} />
              <div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: colors.info, fontFamily: "'Outfit', sans-serif" }}>24/7</div>
                <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>Care & Support</div>
              </div>
            </div>
          </div>
        )}

        {/* ─── PROGRAMS TAB ─── */}
        {activeTab === 'programs' && (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>All Programs</h2>
              <p style={{ color: colors.textMuted, marginTop: '4px' }}>Special initiatives that connect sponsors and donors directly to kids.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { title: 'Full Plates, Bright Futures Program', desc: 'Covers breakfast, lunch, and dinner bookings. Ensuring that children get high-protein nutritious meals every single day to support healthy development.', category: 'Nutrition' },
                { title: 'Sinhala & Tamil New Year Celebration Program', desc: 'Organizes traditional games, sweetmeat distributions, and new clothes gifting for the kids during the national cultural new year festivity.', category: 'Cultural' },
                { title: 'Children\'s Day Celebration Program', desc: 'A dedicated day of magic shows, talent displays, carnival food, and specialized gifts to let the kids feel special and appreciated.', category: 'Social Event' },
                { title: 'Scholarship & School Supplies Support Program', desc: 'Distributes textbooks, backpacks, stationery kits, and school uniforms prior to the start of the academic semesters.', category: 'Education' },
                { title: 'Child Health & Wellness Programme', desc: 'Annual comprehensive pediatric and dental health screenings, eye tests, vitamin updates, and general wellness follow-ups.', category: 'Medical' },
              ].map((prog, idx) => (
                <div key={idx} style={{
                  ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px',
                  backgroundColor: 'rgba(255,255,255,0.015)', transition: 'background-color 0.2s ease'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.015)'}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                      background: colors.primaryGlow, color: colors.primary, textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>{prog.category}</span>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: colors.text, marginTop: '10px', marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>{prog.title}</h3>
                    <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: 1.6 }}>{prog.desc}</p>
                  </div>
                  <button style={{ ...buttonSecondary, flexShrink: 0 }} onClick={() => setActiveTab('donate')}>Support Program</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CONTACT TAB ─── */}
        {activeTab === 'contact' && (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px' }}>
              <div>
                <h2 style={{ fontSize: '36px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: '20px' }}>Contact Us</h2>
                <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
                  Have questions about donations, volunteering, or meal sponsorships? Send us a message and our coordinator team will respond within 24 hours.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: colors.primaryGlow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={20} color={colors.primary} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: colors.textMuted }}>Address</div>
                      <div style={{ fontSize: '15px', fontWeight: 600 }}>102 Temple Road, Colombo 03, Sri Lanka</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: colors.successGlow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone size={20} color={colors.success} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: colors.textMuted }}>Phone</div>
                      <div style={{ fontSize: '15px', fontWeight: 600 }}>+94 11 234 5678</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail size={20} color={colors.info} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: colors.textMuted }}>Email</div>
                      <div style={{ fontSize: '15px', fontWeight: 600 }}>info@oms-orphanage.org</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', fontFamily: "'Outfit', sans-serif" }}>Get In Touch / Send Us A Message</h3>
                
                {contactSuccess ? (
                  <div style={{
                    padding: '24px', textAlign: 'center', backgroundColor: colors.successGlow,
                    border: `1px solid rgba(16,185,129,0.3)`, borderRadius: '12px', color: colors.success
                  }}>
                    <Check size={40} style={{ margin: '0 auto 12px' }} />
                    <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Message Sent!</h4>
                    <p style={{ fontSize: '13px', color: colors.textSecondary }}>Thank you for your message. Our staff will review and get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>First Name</label>
                        <input style={inputStyle} value={contactForm.firstName} onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>Last Name</label>
                        <input style={inputStyle} value={contactForm.lastName} onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })} required />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>Email Address</label>
                      <input type="email" style={inputStyle} value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>Phone Number (Optional)</label>
                      <input style={inputStyle} value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>Message</label>
                      <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} required />
                    </div>

                    <button type="submit" style={{ ...buttonPrimary, width: '100%' }} disabled={contactLoading}>
                      {contactLoading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── DONATE TAB ─── */}
        {activeTab === 'donate' && (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>Choose How You Want To Help</h2>
              <p style={{ color: colors.textMuted, marginTop: '8px', fontSize: '16px' }}>Make a difference by direct monetary donations or sponsoring healthy meals for the children.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Cash donation card */}
              <div style={{
                ...cardStyle, flex: '1 1 380px', maxWidth: '460px', padding: '36px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                backgroundColor: 'rgba(99,102,241,0.03)', border: `1px solid ${colors.primary}30`
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>💵</div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, fontFamily: "'Outfit', sans-serif", marginBottom: '12px' }}>Donate Cash</h3>
                <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
                  Support operations, healthcare, stationery kits, caregiver payouts, and recreational activities. You can choose card checkout or online bank transfer receipts upload.
                </p>
                <button style={{ ...buttonPrimary, width: '100%', padding: '12px' }} onClick={() => setShowCashModal(true)}>
                  Proceed to Cash Donation
                </button>
              </div>

              {/* Meal booking card */}
              <div style={{
                ...cardStyle, flex: '1 1 380px', maxWidth: '460px', padding: '36px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                backgroundColor: 'rgba(16,185,129,0.03)', border: `1px solid ${colors.success}30`
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🍽️</div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, fontFamily: "'Outfit', sans-serif", marginBottom: '12px' }}>Donate / Book Meal</h3>
                <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
                  Celebrate birthdays or memory milestones by booking a full warm nutritious meal (Breakfast, Lunch, or Dinner) for all the kids. Select date, meal count, and type.
                </p>
                <button style={{ ...buttonPrimary, background: `linear-gradient(135deg, ${colors.success}, #059669)`, width: '100%', padding: '12px', boxShadow: `0 4px 14px ${colors.successGlow}` }} onClick={() => setShowMealModal(true)}>
                  Proceed to Book Meal
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ─── CASH DONATION MODAL ─── */}
      {showCashModal && (
        <div style={modalOverlay} onClick={() => setShowCashModal(false)}>
          <div style={{ ...modalBox, width: '500px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: colors.text, fontFamily: "'Outfit', sans-serif", marginBottom: '6px' }}>Do Cash Donation</h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>Support the orphanage general expenses fund.</p>
            
            {cashSuccess ? (
              <div style={{
                padding: '32px 24px', textAlign: 'center', backgroundColor: colors.successGlow,
                border: `1px solid rgba(16,185,129,0.3)`, borderRadius: '12px', color: colors.success
              }}>
                <Check size={48} style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>Donation Successful!</h3>
                <p style={{ fontSize: '13px', color: colors.textSecondary }}>Thank you for your generous contribution of LKR {Number(cashForm.amount).toLocaleString()}. Your support is really powerful.</p>
              </div>
            ) : (
              <form onSubmit={handleCashSubmit}>
                {/* Amount presets */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '8px' }}>Select Donation Amount</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    {['10', '20', '50', '100', '250'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCashForm({ ...cashForm, amount: preset })}
                        style={{
                          padding: '10px 0', borderRadius: '8px', border: `1px solid ${cashForm.amount === preset ? colors.primary : colors.border}`,
                          backgroundColor: cashForm.amount === preset ? colors.primaryGlow : colors.surface,
                          color: cashForm.amount === preset ? colors.primary : colors.text,
                          fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                        }}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="Custom amount (USD or equivalent LKR)"
                    value={cashForm.amount}
                    onChange={(e) => setCashForm({ ...cashForm, amount: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '8px' }}>Payment Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { id: 'online', label: '💳 Card Checkout' },
                      { id: 'bank_transfer', label: '🏦 Online Bank' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setCashForm({ ...cashForm, paymentMethod: method.id })}
                        style={{
                          padding: '12px', borderRadius: '8px', border: `1px solid ${cashForm.paymentMethod === method.id ? colors.primary : colors.border}`,
                          backgroundColor: cashForm.paymentMethod === method.id ? colors.primaryGlow : colors.surface,
                          color: cashForm.paymentMethod === method.id ? colors.primary : colors.text,
                          fontWeight: 600, fontSize: '13px', cursor: 'pointer'
                        }}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donor Details */}
                <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '16px', marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>Full Name</label>
                  <input style={inputStyle} placeholder="Your full name" value={cashForm.name} onChange={(e) => setCashForm({ ...cashForm, name: e.target.value })} required />

                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>Email Address</label>
                  <input type="email" style={inputStyle} placeholder="your.email@example.com" value={cashForm.email} onChange={(e) => setCashForm({ ...cashForm, email: e.target.value })} required />

                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>Contact Number (Optional)</label>
                  <input style={inputStyle} placeholder="+94 77 123 4567" value={cashForm.contactDetails} onChange={(e) => setCashForm({ ...cashForm, contactDetails: e.target.value })} />

                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>Donor Type</label>
                  <select style={selectStyle} value={cashForm.type} onChange={(e) => setCashForm({ ...cashForm, type: e.target.value })}>
                    <option value="individual">Individual Donor</option>
                    <option value="organization">Corporate/Organization</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" style={buttonSecondary} onClick={() => setShowCashModal(false)}>Cancel</button>
                  <button type="submit" style={buttonPrimary} disabled={cashLoading}>{cashLoading ? 'Processing...' : 'Donate Now'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── BOOK MEAL MODAL ─── */}
      {showMealModal && (
        <div style={modalOverlay} onClick={() => setShowMealModal(false)}>
          <div style={{ ...modalBox, width: '500px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: colors.text, fontFamily: "'Outfit', sans-serif", marginBottom: '6px' }}>Book Meal Page Modal</h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>Sponsor a delicious meal reservation for the children.</p>

            {mealSuccess ? (
              <div style={{
                padding: '32px 24px', textAlign: 'center', backgroundColor: colors.successGlow,
                border: `1px solid rgba(16,185,129,0.3)`, borderRadius: '12px', color: colors.success
              }}>
                <Check size={48} style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>Meal Reservation Confirmed!</h3>
                <p style={{ fontSize: '13px', color: colors.textSecondary }}>Thank you for booking a {mealForm.mealType} meal on {mealForm.mealDate} for {mealForm.quantity} portions.</p>
              </div>
            ) : (
              <form onSubmit={handleMealSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>Select Date</label>
                    <input type="date" style={inputStyle} value={mealForm.mealDate} onChange={(e) => setMealForm({ ...mealForm, mealDate: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>Meal Type</label>
                    <select style={selectStyle} value={mealForm.mealType} onChange={(e) => setMealForm({ ...mealForm, mealType: e.target.value })}>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>Quantity (Meals count)</label>
                  <input type="number" style={inputStyle} min="10" placeholder="e.g. 50" value={mealForm.quantity} onChange={(e) => setMealForm({ ...mealForm, quantity: e.target.value })} required />
                  <span style={{ fontSize: '11px', color: colors.textMuted }}>Minimum 10 meals recommended to cover child facility.</span>
                </div>

                {/* Donor Details */}
                <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>Your Name</label>
                  <input style={inputStyle} placeholder="Full name" value={mealForm.name} onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })} required />

                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>Email Address</label>
                  <input type="email" style={inputStyle} placeholder="email@example.com" value={mealForm.email} onChange={(e) => setMealForm({ ...mealForm, email: e.target.value })} required />

                  <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '6px' }}>Contact Number (Optional)</label>
                  <input style={inputStyle} placeholder="Phone number" value={mealForm.contactDetails} onChange={(e) => setMealForm({ ...mealForm, contactDetails: e.target.value })} />
                </div>

                {/* Agreement */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '14px', marginBottom: '14px' }}>
                  <input type="checkbox" id="agree" required style={{ marginTop: '3px' }} />
                  <label htmlFor="agree" style={{ fontSize: '11px', color: colors.textSecondary, cursor: 'pointer' }}>
                    I agree to coordinates dates with the orphanage coordinator if scheduling conflicts occur.
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" style={buttonSecondary} onClick={() => setShowMealModal(false)}>Cancel</button>
                  <button type="submit" style={{ ...buttonPrimary, background: `linear-gradient(135deg, ${colors.success}, #059669)` }} disabled={mealLoading}>{mealLoading ? 'Scheduling...' : 'Confirm Booking'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
