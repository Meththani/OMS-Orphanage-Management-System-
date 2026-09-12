import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, HandHeart, Phone, Mail, MapPin, Calendar, Clock, Check, Lock,
  ChevronLeft, ChevronRight, BookOpen, FileText, Sparkles, Trophy, Apple, Palette,
  HandCoins, UtensilsCrossed, Utensils, CreditCard, Landmark, Target, Compass,
  ShieldCheck, Users, ArrowRight
} from 'lucide-react';
import ModalCloseButton from '../components/ModalCloseButton';
import { formatWithCommas, stripCommas } from '../utils/numberFormat';

// Refined, human-centered charity design tokens
const charityTheme = {
  primary: '#1d70b8',        // Trustworthy humanitarian blue
  primaryDark: '#134e80',
  primaryLight: '#ebf4fc',
  primaryGlow: 'rgba(29, 112, 184, 0.12)',

  accentAmber: '#d97706',    // Warm golden amber (sunlight, warmth)
  accentAmberLight: '#fef3c7',
  accentGreen: '#059669',    // Healing emerald / nourishment
  accentGreenLight: '#ecfdf5',
  accentRose: '#e11d48',     // Heart & care
  accentRoseLight: '#ffe4e6',

  bgMain: '#fcfbf9',         // Warm paper off-white
  bgCard: '#ffffff',
  bgSurface: '#f8fafc',
  bgSoft: '#f1f5f9',

  textHeading: '#0f172a',    // Deep slate
  textBody: '#334155',
  textMuted: '#64748b',

  border: '#e2e8f0',
  borderWarm: '#e7e5e4',
  borderHover: '#cbd5e1',

  fontSerif: "'Lora', Georgia, serif",
  fontSans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  shadowCard: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
  shadowHover: '0 12px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.03)',
};

export default function PublicWebsite({ initialTab = 'home' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const amt = params.get('amount');
    const sessionId = params.get('session_id');

    if (status === 'success') {
      setDonatedAmount(amt || '0');
      setCashSuccess(true);
      setShowCashModal(true);

      if (sessionId) {
        fetch('http://localhost:5000/api/public/confirm-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
          .then(res => res.json())
          .then(data => {
            console.log('Stripe checkout session verification result:', data);
          })
          .catch(err => {
            console.error('Error verifying Stripe session:', err);
          });
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'cancel') {
      alert('Donation cancelled. You can try again whenever you are ready.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Cash Donation Form State
  const [cashForm, setCashForm] = useState({ name: '', email: '', contactDetails: '', type: 'individual', amount: '1,000', paymentMethod: 'online', proof: null, notes: '' });
  const [cashSuccess, setCashSuccess] = useState(false);
  const [cashLoading, setCashLoading] = useState(false);
  const [donatedAmount, setDonatedAmount] = useState('0');

  // Meal Booking Form State
  const [mealForm, setMealForm] = useState({
    name: '',
    email: '',
    contactDetails: '',
    mealDate: '',
    mealType: 'lunch',
    quantity: '50',
    occasion: '',
    menuPackage: 'standard',
    dietaryNotes: ''
  });
  const [mealSuccess, setMealSuccess] = useState(false);
  const [mealLoading, setMealLoading] = useState(false);

  // Calendar & Booked Meals State
  const [bookings, setBookings] = useState([]);
  const [childCount, setChildCount] = useState(50);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarLoading, setCalendarLoading] = useState(false);

  const fetchBookedMeals = async () => {
    setCalendarLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/public/booked-meals');
      const json = await res.json();
      if (json.status === 'success') {
        setBookings(json.data.bookings || []);
        setChildCount(json.data.activeChildCount || 50);
        setMealForm(prev => ({
          ...prev,
          quantity: String(json.data.activeChildCount || 50)
        }));
      }
    } catch (err) {
      console.error('Error fetching booked meals:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => {
    if (showMealModal) {
      fetchBookedMeals();
    }
  }, [showMealModal]);

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getSlotsForDate = (dateKey) => {
    return bookings.filter(b => {
      const bDate = new Date(b.mealDate);
      const bYear = bDate.getFullYear();
      const bMonth = String(bDate.getMonth() + 1).padStart(2, '0');
      const bDay = String(bDate.getDate()).padStart(2, '0');
      const bKey = `${bYear}-${bMonth}-${bDay}`;
      return bKey === dateKey;
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getPackagePrice = (pkg) => {
    if (pkg === 'feast') return 1800;
    if (pkg === 'special') return 1200;
    return 600; // standard
  };

  const calendarDays = [];
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

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
      const cleanAmount = stripCommas(cashForm.amount);
      if (!cleanAmount || isNaN(Number(cleanAmount)) || Number(cleanAmount) <= 0) {
        alert('Please enter a valid donation amount.');
        setCashLoading(false);
        return;
      }

      if (cashForm.paymentMethod === 'bank_transfer' && !cashForm.proof) {
        alert('Please upload a bank transfer receipt as proof of payment.');
        setCashLoading(false);
        return;
      }

      if (cashForm.paymentMethod === 'online') {
        const res = await fetch('http://localhost:5000/api/public/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: cleanAmount,
            name: cashForm.name,
            email: cashForm.email,
            contactDetails: cashForm.contactDetails,
            notes: cashForm.notes
          }),
        });
        const data = await res.json();
        if (res.ok && data.url) {
          window.location.href = data.url;
          return;
        } else {
          alert(data.message || 'Failed to initialize Stripe checkout session.');
          setCashLoading(false);
          return;
        }
      }

      const res = await fetch('http://localhost:5000/api/public/donate-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cashForm,
          amount: cleanAmount
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDonatedAmount(cleanAmount);
        setCashSuccess(true);
        setCashForm({ name: '', email: '', contactDetails: '', type: 'individual', amount: '1,000', paymentMethod: 'online', proof: null, notes: '' });
        setTimeout(() => {
          setCashSuccess(false);
          setShowCashModal(false);
        }, 3000);
      } else {
        alert(data.message || 'Donation submission failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to submit donation.');
    } finally {
      setCashLoading(false);
    }
  };

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    if (!mealForm.mealDate) {
      alert('Please select a date from the calendar.');
      return;
    }
    setMealLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/public/book-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealForm),
      });
      const data = await res.json();
      if (res.ok) {
        setMealSuccess(true);
        setMealForm({
          name: '',
          email: '',
          contactDetails: '',
          mealDate: '',
          mealType: 'lunch',
          quantity: String(childCount),
          occasion: '',
          menuPackage: 'standard',
          dietaryNotes: ''
        });
        fetchBookedMeals();
        setTimeout(() => {
          setMealSuccess(false);
          setShowMealModal(false);
        }, 3000);
      } else {
        alert(data.message || 'Booking failed.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during booking.');
    } finally {
      setMealLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: charityTheme.bgMain,
      color: charityTheme.textBody,
      fontFamily: charityTheme.fontSans,
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* ─── Top Trust & Accreditation Bar ─── */}
      <div style={{
        backgroundColor: '#0c2d48',
        color: '#cbd5e1',
        fontSize: '12px',
        padding: '9px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={14} color="#f59e0b" />
          <span>Registered Child Development Center & Sanctuary &bull; National Registration No. <strong>CDC/WP/2014-088</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="tel:+94112345678" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0', textDecoration: 'none' }}>
            <Phone size={13} color="#f59e0b" />
            <span>+94 11 234 5678</span>
          </a>
          <a href="mailto:info@oms-orphanage.org" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0', textDecoration: 'none' }}>
            <Mail size={13} color="#f59e0b" />
            <span>info@oms-orphanage.org</span>
          </a>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
            <MapPin size={13} />
            <span>Colombo 03, Sri Lanka</span>
          </span>
        </div>
      </div>

      {/* ─── Main Charity Navigation Header ─── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        borderBottom: `1px solid ${charityTheme.border}`,
        padding: '0 32px',
        height: '76px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
          onClick={() => setActiveTab('home')}
        >
          <img
            src="/logo-icon.png"
            alt="Senehasa Dari Sewana Logo"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: `2px solid ${charityTheme.primaryLight}`,
              boxShadow: '0 2px 8px rgba(29, 112, 184, 0.15)'
            }}
          />
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              fontFamily: charityTheme.fontSerif,
              color: charityTheme.textHeading,
              letterSpacing: '-0.01em',
              lineHeight: 1.1
            }}>
              Senehasa Dari Sewana
            </div>
            <div style={{
              fontSize: '11px',
              color: charityTheme.textMuted,
              letterSpacing: '0.04em',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginTop: '3px'
            }}>
              Child Development Center & Sanctuary
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[
            { id: 'home', label: 'Home' },
            { id: 'facilities', label: 'Facilities' },
            { id: 'programs', label: 'Programs' },
            { id: 'contact', label: 'Contact Us' },
            { id: 'donate', label: 'Support Us' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? charityTheme.primaryLight : 'transparent',
                  border: 'none',
                  color: isActive ? charityTheme.primary : charityTheme.textBody,
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {tab.id === 'donate' && <Heart size={14} fill={isActive ? charityTheme.primary : 'none'} color={isActive ? charityTheme.primary : charityTheme.accentAmber} />}
                {tab.label}
              </button>
            );
          })}

          <div style={{ width: '1px', height: '24px', backgroundColor: charityTheme.border, margin: '0 8px' }} />

          <button
            onClick={() => setActiveTab('donate')}
            style={{
              backgroundColor: charityTheme.primary,
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(29, 112, 184, 0.25)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = charityTheme.primaryDark}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = charityTheme.primary}
          >
            <HandHeart size={15} />
            <span>Donate Now</span>
          </button>

          <button
            onClick={() => navigate('/login')}
            style={{
              backgroundColor: 'transparent',
              color: charityTheme.textMuted,
              border: `1px solid ${charityTheme.border}`,
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = charityTheme.borderHover;
              e.currentTarget.style.color = charityTheme.textHeading;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = charityTheme.border;
              e.currentTarget.style.color = charityTheme.textMuted;
            }}
          >
            <Lock size={13} />
            <span>Staff Portal</span>
          </button>
        </nav>
      </header>

      {/* ─── Main Page Content ─── */}
      <main style={{ flex: 1, padding: '40px 32px 64px', maxWidth: '1240px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* ═══════════════════════════════════════════════════════
            HOME TAB
           ═══════════════════════════════════════════════════════ */}
        {activeTab === 'home' && (
          <div style={{ animation: 'fadeIn 0.35s ease-out' }}>

            {/* Authentic Hero Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.15fr 0.95fr',
              gap: '48px',
              alignItems: 'center',
              marginBottom: '64px',
              padding: '48px 44px',
              borderRadius: '24px',
              backgroundColor: '#ffffff',
              border: `1px solid ${charityTheme.borderWarm}`,
              boxShadow: charityTheme.shadowCard
            }}>
              <div>
                {/* Non-Profit Badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 16px',
                  borderRadius: '30px',
                  backgroundColor: charityTheme.primaryLight,
                  color: charityTheme.primary,
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  marginBottom: '20px'
                }}>
                  <HandHeart size={15} />
                  <span>Caring for Vulnerable Children in Sri Lanka</span>
                </div>

                <h1 style={{
                  fontSize: '44px',
                  fontWeight: 700,
                  fontFamily: charityTheme.fontSerif,
                  color: charityTheme.textHeading,
                  lineHeight: 1.2,
                  marginBottom: '20px',
                  letterSpacing: '-0.02em'
                }}>
                  Every Child Deserves a Safe Home, Wholesome Food, and a Brighter Tomorrow.
                </h1>

                <p style={{
                  color: charityTheme.textBody,
                  fontSize: '16px',
                  lineHeight: 1.7,
                  marginBottom: '32px',
                  maxWidth: '540px'
                }}>
                  At Senehasa Dari Sewana, we provide loving shelter, complete educational support, nutritional meals, and healthcare to orphaned and underprivileged children. Together, we can empower them toward an independent, dignity-filled future.
                </p>

                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => setActiveTab('donate')}
                    style={{
                      backgroundColor: charityTheme.primary,
                      color: '#ffffff',
                      border: 'none',
                      padding: '14px 28px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '15px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 6px 16px rgba(29, 112, 184, 0.28)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = charityTheme.primaryDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = charityTheme.primary}
                  >
                    <Heart size={18} fill="#ffffff" />
                    <span>Make a Donation</span>
                  </button>

                  <button
                    onClick={() => setShowMealModal(true)}
                    style={{
                      backgroundColor: charityTheme.accentGreenLight,
                      color: charityTheme.accentGreen,
                      border: `1px solid rgba(5, 150, 105, 0.3)`,
                      padding: '14px 24px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '15px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = charityTheme.accentGreenLight}
                  >
                    <UtensilsCrossed size={16} />
                    <span>Sponsor a Child's Meal</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('contact')}
                    style={{
                      backgroundColor: 'transparent',
                      color: charityTheme.textBody,
                      border: 'none',
                      padding: '14px 16px',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Get In Touch</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Hero Visual Presentation */}
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: '100%',
                  maxWidth: '430px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: `1px solid ${charityTheme.borderWarm}`,
                  boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.12)',
                  position: 'relative',
                  backgroundColor: '#ffffff'
                }}>
                  <img
                    src="/hero-child.jpg"
                    alt="Children learning at Senehasa sanctuary"
                    style={{
                      width: '100%',
                      height: '380px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />

                  {/* Impact Float Badge 1: 50+ Children */}
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.96)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${charityTheme.border}`,
                    borderRadius: '14px',
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.1)'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: charityTheme.primaryLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Users size={20} color={charityTheme.primary} />
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: charityTheme.textHeading, lineHeight: 1.1 }}>50+ Children</div>
                      <div style={{ fontSize: '12px', color: charityTheme.textMuted, marginTop: '2px' }}>Supported &amp; Cared For</div>
                    </div>
                  </div>

                  {/* Trust Float Badge 2: Verified Sanctuary */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid rgba(5, 150, 105, 0.25)`,
                    borderRadius: '30px',
                    padding: '6px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: charityTheme.accentGreen,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                  }}>
                    <ShieldCheck size={14} />
                    <span>Government Approved Sanctuary</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Metric Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
              marginBottom: '64px'
            }}>
              {[
                { number: '50+', label: 'Active Children in Residence', icon: Users, color: charityTheme.primary, bg: charityTheme.primaryLight },
                { number: '100%', label: 'School & Tuition Enrollment', icon: BookOpen, color: charityTheme.accentGreen, bg: charityTheme.accentGreenLight },
                { number: '3 Meals', label: 'Fresh Daily Balanced Nutrition', icon: Utensils, color: charityTheme.accentAmber, bg: charityTheme.accentAmberLight },
                { number: '24 / 7', label: 'Dedicated Caregiver Support', icon: Heart, color: charityTheme.accentRose, bg: charityTheme.accentRoseLight },
              ].map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={i}
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '24px',
                      borderRadius: '16px',
                      border: `1px solid ${charityTheme.borderWarm}`,
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: item.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <IconComponent size={22} color={item.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: charityTheme.fontSerif, color: charityTheme.textHeading, lineHeight: 1.1 }}>
                        {item.number}
                      </div>
                      <div style={{ fontSize: '12px', color: charityTheme.textMuted, marginTop: '4px', fontWeight: 500 }}>
                        {item.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* About Us / Mission & Vision Section */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '48px',
              border: `1px solid ${charityTheme.borderWarm}`,
              boxShadow: charityTheme.shadowCard,
              marginBottom: '40px'
            }}>
              <div style={{ maxWidth: '780px', marginBottom: '36px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: charityTheme.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px'
                }}>
                  About Senehasa Dari Sewana
                </div>
                <h2 style={{
                  fontSize: '34px',
                  fontWeight: 700,
                  fontFamily: charityTheme.fontSerif,
                  color: charityTheme.textHeading,
                  lineHeight: 1.25,
                  marginBottom: '16px'
                }}>
                  Your Support Truly Changes Young Lives
                </h2>
                <p style={{ color: charityTheme.textBody, fontSize: '15px', lineHeight: 1.75 }}>
                  Our facility serves as a refuge for orphaned, abandoned, or underprivileged children, providing them with a safe, caring, and nurturing environment. Through comprehensive childhood support plans, we guide their physical, social, cognitive, and creative development.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {/* Mission Card */}
                <div style={{
                  padding: '28px',
                  borderRadius: '16px',
                  backgroundColor: charityTheme.bgSurface,
                  border: `1px solid ${charityTheme.border}`
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: charityTheme.primaryLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    <Target size={22} color={charityTheme.primary} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '8px', fontFamily: charityTheme.fontSerif }}>
                    Our Mission
                  </h3>
                  <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.6 }}>
                    To offer children safe sanctuary, quality health, tailored learning, and life coaching so they may build confident futures.
                  </p>
                </div>

                {/* Vision Card */}
                <div style={{
                  padding: '28px',
                  borderRadius: '16px',
                  backgroundColor: charityTheme.bgSurface,
                  border: `1px solid ${charityTheme.border}`
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: charityTheme.accentGreenLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    <Compass size={22} color={charityTheme.accentGreen} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '8px', fontFamily: charityTheme.fontSerif }}>
                    Our Vision
                  </h3>
                  <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.6 }}>
                    A world where every orphaned child becomes an empowered, educated, and successful contributing member of society.
                  </p>
                </div>

                {/* Transparency Card */}
                <div style={{
                  padding: '28px',
                  borderRadius: '16px',
                  backgroundColor: charityTheme.bgSurface,
                  border: `1px solid ${charityTheme.border}`
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: charityTheme.accentAmberLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    <ShieldCheck size={22} color={charityTheme.accentAmber} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '8px', fontFamily: charityTheme.fontSerif }}>
                    Full Transparency
                  </h3>
                  <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.6 }}>
                    100% of contributions are managed systematically with digital accounting, official receipt issuance, and regular audit inspections.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            FACILITIES TAB
           ═══════════════════════════════════════════════════════ */}
        {activeTab === 'facilities' && (
          <div style={{ animation: 'fadeIn 0.35s ease-out' }}>
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                color: charityTheme.primary,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '8px'
              }}>
                Holistic Child Development
              </div>
              <h2 style={{ fontSize: '38px', fontWeight: 700, fontFamily: charityTheme.fontSerif, color: charityTheme.textHeading, marginBottom: '12px' }}>
                Six Pillars of Child Development
              </h2>
              <p style={{ color: charityTheme.textMuted, fontSize: '16px', lineHeight: 1.6 }}>
                We structure child care across six developmental areas, offering tailored spaces, modern equipment, and qualified staff supervision.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {[
                { title: 'Education', icon: BookOpen, desc: 'Formal schooling support, classroom setups, textbook distributions, and homework tutoring panels.', color: '#1d70b8', bg: '#ebf4fc' },
                { title: 'Tuition Classes', icon: FileText, desc: 'Supplemental academic coaching in Math, Science, and Languages to reinforce school performance.', color: '#059669', bg: '#ecfdf5' },
                { title: 'Extra-curricular Activities', icon: Sparkles, desc: 'Debating societies, chess clubs, leadership circles, and scout groups to build life-readiness.', color: '#d97706', bg: '#fef3c7' },
                { title: 'Sport Activities', icon: Trophy, desc: 'Physical coordination, outdoor games, track sports, and matches to build teamwork and healthy habits.', color: '#e11d48', bg: '#ffe4e6' },
                { title: 'Health & Nutrition', icon: Apple, desc: 'Balanced diet planning, fresh daily milk, pediatric checkups, and routine medicine distributions.', color: '#0284c7', bg: '#e0f2fe' },
                { title: 'Creative Arts', icon: Palette, desc: 'Drama classes, traditional dancing, watercolor painting, and musical instrument lessons.', color: '#7c3aed', bg: '#ede9fe' },
              ].map((fac, idx) => {
                const IconComponent = fac.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      padding: '30px',
                      border: `1px solid ${charityTheme.borderWarm}`,
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = charityTheme.shadowHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.03)';
                    }}
                  >
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      backgroundColor: fac.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px'
                    }}>
                      <IconComponent size={26} color={fac.color} />
                    </div>
                    <h3 style={{ fontSize: '19px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '10px', fontFamily: charityTheme.fontSerif }}>
                      {fac.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.65 }}>
                      {fac.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div style={{
              marginTop: '56px',
              padding: '36px',
              borderRadius: '20px',
              backgroundColor: '#ffffff',
              border: `1px solid ${charityTheme.borderWarm}`,
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center',
              boxShadow: charityTheme.shadowCard
            }}>
              <div>
                <div style={{ fontSize: '40px', fontWeight: 700, color: charityTheme.primary, fontFamily: charityTheme.fontSerif }}>100%</div>
                <div style={{ fontSize: '13px', color: charityTheme.textMuted, marginTop: '4px', fontWeight: 600 }}>Enrolment Rate</div>
              </div>
              <div style={{ width: '1px', backgroundColor: charityTheme.border }} />
              <div>
                <div style={{ fontSize: '40px', fontWeight: 700, color: charityTheme.accentGreen, fontFamily: charityTheme.fontSerif }}>6 Pillars</div>
                <div style={{ fontSize: '13px', color: charityTheme.textMuted, marginTop: '4px', fontWeight: 600 }}>Development Structure</div>
              </div>
              <div style={{ width: '1px', backgroundColor: charityTheme.border }} />
              <div>
                <div style={{ fontSize: '40px', fontWeight: 700, color: charityTheme.accentAmber, fontFamily: charityTheme.fontSerif }}>24 / 7</div>
                <div style={{ fontSize: '13px', color: charityTheme.textMuted, marginTop: '4px', fontWeight: 600 }}>Continuous Care</div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            PROGRAMS TAB
           ═══════════════════════════════════════════════════════ */}
        {activeTab === 'programs' && (
          <div style={{ animation: 'fadeIn 0.35s ease-out' }}>
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                color: charityTheme.primary,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '6px'
              }}>
                Community Initiatives
              </div>
              <h2 style={{ fontSize: '38px', fontWeight: 700, fontFamily: charityTheme.fontSerif, color: charityTheme.textHeading }}>All Programs</h2>
              <p style={{ color: charityTheme.textMuted, marginTop: '6px', fontSize: '16px' }}>
                Special initiatives that connect sponsors and donors directly to the children.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { title: 'Full Plates, Bright Futures Program', desc: 'Covers breakfast, lunch, and dinner bookings. Ensuring that children get high-protein nutritious meals every single day to support healthy development.', category: 'Nutrition', color: '#059669', bg: '#ecfdf5' },
                { title: 'Sinhala & Tamil New Year Celebration Program', desc: 'Organizes traditional games, sweetmeat distributions, and new clothes gifting for the kids during the national cultural new year festivity.', category: 'Cultural', color: '#d97706', bg: '#fef3c7' },
                { title: 'Children\'s Day Celebration Program', desc: 'A dedicated day of magic shows, talent displays, carnival food, and specialized gifts to let the kids feel special and appreciated.', category: 'Social Event', color: '#7c3aed', bg: '#ede9fe' },
                { title: 'Scholarship & School Supplies Support Program', desc: 'Distributes textbooks, backpacks, stationery kits, and school uniforms prior to the start of the academic semesters.', category: 'Education', color: '#1d70b8', bg: '#ebf4fc' },
                { title: 'Child Health & Wellness Programme', desc: 'Annual comprehensive pediatric and dental health screenings, eye tests, vitamin updates, and general wellness follow-ups.', category: 'Medical', color: '#e11d48', bg: '#ffe4e6' },
              ].map((prog, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '28px 32px',
                    border: `1px solid ${charityTheme.borderWarm}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '28px',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = charityTheme.borderHover;
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(15, 23, 42, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = charityTheme.borderWarm;
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.02)';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '30px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: prog.bg,
                      color: prog.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      display: 'inline-block'
                    }}>
                      {prog.category}
                    </span>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: charityTheme.textHeading,
                      marginTop: '10px',
                      marginBottom: '8px',
                      fontFamily: charityTheme.fontSerif
                    }}>
                      {prog.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.65 }}>
                      {prog.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('donate')}
                    style={{
                      backgroundColor: '#ffffff',
                      color: charityTheme.primary,
                      border: `1px solid ${charityTheme.primary}`,
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexShrink: 0,
                      transition: 'all 0.18s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = charityTheme.primaryLight;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    <span>Support Program</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            CONTACT TAB
           ═══════════════════════════════════════════════════════ */}
        {activeTab === 'contact' && (
          <div style={{ animation: 'fadeIn 0.35s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '48px', alignItems: 'start' }}>
              <div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: charityTheme.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '6px'
                }}>
                  Direct Assistance
                </div>
                <h2 style={{ fontSize: '38px', fontWeight: 700, fontFamily: charityTheme.fontSerif, color: charityTheme.textHeading, marginBottom: '16px' }}>
                  Contact Us
                </h2>
                <p style={{ color: charityTheme.textBody, fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
                  Have questions about donations, volunteering, or meal sponsorships? Send us a message and our coordinator team will respond within 24 hours.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Address */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: `1px solid ${charityTheme.borderWarm}`
                  }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      backgroundColor: charityTheme.primaryLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <MapPin size={20} color={charityTheme.primary} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: charityTheme.textMuted, fontWeight: 600 }}>Sanctuary Address</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: charityTheme.textHeading, marginTop: '2px' }}>102 Temple Road, Colombo 03, Sri Lanka</div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: `1px solid ${charityTheme.borderWarm}`
                  }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      backgroundColor: charityTheme.accentGreenLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Phone size={20} color={charityTheme.accentGreen} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: charityTheme.textMuted, fontWeight: 600 }}>Phone Lines (Mon - Sun)</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: charityTheme.textHeading, marginTop: '2px' }}>+94 11 234 5678</div>
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: `1px solid ${charityTheme.borderWarm}`
                  }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      backgroundColor: charityTheme.accentAmberLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Mail size={20} color={charityTheme.accentAmber} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: charityTheme.textMuted, fontWeight: 600 }}>Official Email</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: charityTheme.textHeading, marginTop: '2px' }}>info@oms-orphanage.org</div>
                    </div>
                  </div>

                  {/* Visiting Hours */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: `1px solid ${charityTheme.borderWarm}`
                  }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      backgroundColor: charityTheme.primaryLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Clock size={20} color={charityTheme.primary} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: charityTheme.textMuted, fontWeight: 600 }}>Sponsor Visiting Hours</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: charityTheme.textHeading, marginTop: '2px' }}>09:00 AM - 05:00 PM (Prior Appointment)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Card */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '36px',
                border: `1px solid ${charityTheme.borderWarm}`,
                boxShadow: charityTheme.shadowCard
              }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px', fontFamily: charityTheme.fontSerif, color: charityTheme.textHeading }}>
                  Send Us a Message
                </h3>
                <p style={{ fontSize: '13px', color: charityTheme.textMuted, marginBottom: '24px' }}>
                  Fill in the details below and our coordinator team will be in touch shortly.
                </p>

                {contactSuccess ? (
                  <div style={{
                    padding: '28px',
                    textAlign: 'center',
                    backgroundColor: charityTheme.accentGreenLight,
                    border: `1px solid rgba(5, 150, 105, 0.3)`,
                    borderRadius: '12px',
                    color: charityTheme.accentGreen
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      boxShadow: '0 2px 8px rgba(5, 150, 105, 0.2)'
                    }}>
                      <Check size={26} color={charityTheme.accentGreen} />
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Message Received!</h4>
                    <p style={{ fontSize: '13px', color: charityTheme.textBody }}>Thank you for reaching out. Our coordinator will review your note and respond promptly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textBody, marginBottom: '6px' }}>First Name *</label>
                        <input
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: '8px',
                            border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                            color: charityTheme.textHeading, fontSize: '14px', boxSizing: 'border-box'
                          }}
                          value={contactForm.firstName}
                          onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textBody, marginBottom: '6px' }}>Last Name *</label>
                        <input
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: '8px',
                            border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                            color: charityTheme.textHeading, fontSize: '14px', boxSizing: 'border-box'
                          }}
                          value={contactForm.lastName}
                          onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textBody, marginBottom: '6px' }}>Email Address *</label>
                      <input
                        type="email"
                        style={{
                          width: '100%', padding: '11px 14px', borderRadius: '8px',
                          border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                          color: charityTheme.textHeading, fontSize: '14px', boxSizing: 'border-box'
                        }}
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textBody, marginBottom: '6px' }}>Phone Number (Optional)</label>
                      <input
                        style={{
                          width: '100%', padding: '11px 14px', borderRadius: '8px',
                          border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                          color: charityTheme.textHeading, fontSize: '14px', boxSizing: 'border-box'
                        }}
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textBody, marginBottom: '6px' }}>Message *</label>
                      <textarea
                        style={{
                          width: '100%', padding: '11px 14px', borderRadius: '8px',
                          border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                          color: charityTheme.textHeading, fontSize: '14px', minHeight: '110px',
                          resize: 'vertical', boxSizing: 'border-box'
                        }}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        backgroundColor: charityTheme.primary,
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      disabled={contactLoading}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = charityTheme.primaryDark}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = charityTheme.primary}
                    >
                      {contactLoading ? 'Submitting Message...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            DONATE / SUPPORT US TAB
           ═══════════════════════════════════════════════════════ */}
        {activeTab === 'donate' && (
          <div style={{ animation: 'fadeIn 0.35s ease-out' }}>
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                color: charityTheme.primary,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '8px'
              }}>
                Ways to Make an Impact
              </div>
              <h2 style={{ fontSize: '38px', fontWeight: 700, fontFamily: charityTheme.fontSerif, color: charityTheme.textHeading, marginBottom: '12px' }}>
                Choose How You Wish to Support
              </h2>
              <p style={{ color: charityTheme.textMuted, fontSize: '16px', lineHeight: 1.6 }}>
                Make a tangible difference through direct financial contributions or sponsoring warm, nutritious daily meals for our 50+ children.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto 48px' }}>
              {/* Option 1: Cash Donation */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '36px',
                border: `1px solid ${charityTheme.borderWarm}`,
                boxShadow: charityTheme.shadowCard,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: charityTheme.primaryLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <HandCoins size={28} color={charityTheme.primary} />
                </div>

                <h3 style={{ fontSize: '24px', fontWeight: 700, fontFamily: charityTheme.fontSerif, color: charityTheme.textHeading, marginBottom: '10px' }}>
                  Donate Funds
                </h3>

                <p style={{ color: charityTheme.textBody, fontSize: '14px', lineHeight: 1.65, marginBottom: '24px', flex: 1 }}>
                  Support general sanctuary operations, healthcare checkups, textbooks, uniform kits, caregiver stipends, and children's recreational activities. Choose instant card checkout or direct bank deposit.
                </p>

                <div style={{ borderTop: `1px solid ${charityTheme.border}`, paddingTop: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: charityTheme.textBody }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color={charityTheme.accentGreen} />
                      <span>Instant official digital receipt</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color={charityTheme.accentGreen} />
                      <span>Secure card checkout via Stripe or bank transfer</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color={charityTheme.accentGreen} />
                      <span>100% directly allocated to child welfare</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowCashModal(true)}
                  style={{
                    backgroundColor: charityTheme.primary,
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s ease',
                    boxShadow: '0 4px 12px rgba(29, 112, 184, 0.25)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = charityTheme.primaryDark}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = charityTheme.primary}
                >
                  <HandCoins size={18} />
                  <span>Proceed to Cash Donation</span>
                </button>
              </div>

              {/* Option 2: Meal Booking */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '36px',
                border: `1px solid rgba(5, 150, 105, 0.25)`,
                boxShadow: charityTheme.shadowCard,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: charityTheme.accentGreenLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <UtensilsCrossed size={28} color={charityTheme.accentGreen} />
                </div>

                <h3 style={{ fontSize: '24px', fontWeight: 700, fontFamily: charityTheme.fontSerif, color: charityTheme.textHeading, marginBottom: '10px' }}>
                  Sponsor a Meal
                </h3>

                <p style={{ color: charityTheme.textBody, fontSize: '14px', lineHeight: 1.65, marginBottom: '24px', flex: 1 }}>
                  Celebrate birthdays, family anniversaries, or memorial days by sponsoring a full warm nutritious meal (Breakfast, Lunch, or Dinner) for all 50+ children residing at the sanctuary.
                </p>

                <div style={{ borderTop: `1px solid ${charityTheme.border}`, paddingTop: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: charityTheme.textBody }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color={charityTheme.accentGreen} />
                      <span>Live interactive booking calendar</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color={charityTheme.accentGreen} />
                      <span>Choice of Standard, Special, or Feast menus</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color={charityTheme.accentGreen} />
                      <span>Dedicated child portion allocations</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowMealModal(true)}
                  style={{
                    backgroundColor: charityTheme.accentGreen,
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s ease',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = charityTheme.accentGreen}
                >
                  <UtensilsCrossed size={18} />
                  <span>Open Meal Booking Calendar</span>
                </button>
              </div>
            </div>

            {/* Direct Bank Wire Transparency Reference */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              border: `1px solid ${charityTheme.borderWarm}`,
              maxWidth: '1000px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: charityTheme.accentAmberLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Landmark size={22} color={charityTheme.accentAmber} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: charityTheme.textHeading }}>Direct Bank Transfer Details</div>
                  <div style={{ fontSize: '13px', color: charityTheme.textMuted }}>Commercial Bank of Ceylon &bull; A/C: <strong>800-459-2104</strong> &bull; Branch: Kollupitiya</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setCashForm(prev => ({ ...prev, paymentMethod: 'bank_transfer' }));
                  setShowCashModal(true);
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: charityTheme.textHeading,
                  border: `1px solid ${charityTheme.border}`,
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Upload Bank Slip
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ─── Comprehensive Authentic Charity Footer ─── */}
      <footer style={{
        backgroundColor: '#0c2d48',
        color: '#94a3b8',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '56px',
        paddingBottom: '32px',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr', gap: '40px', marginBottom: '48px' }}>
            {/* Column 1: Organization */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <img src="/logo-icon.png" alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: charityTheme.fontSerif, color: '#ffffff' }}>
                  Senehasa Dari Sewana
                </span>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#cbd5e1', marginBottom: '16px' }}>
                A registered residential sanctuary providing shelter, education, medical care, and daily nourishment to over 50 orphaned and vulnerable children in Sri Lanka.
              </p>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Government Registered: <strong>CDC/WP/2014-088</strong>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>Quick Navigation</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <span onClick={() => setActiveTab('home')} style={{ cursor: 'pointer', color: '#cbd5e1' }}>About Our Sanctuary</span>
                <span onClick={() => setActiveTab('facilities')} style={{ cursor: 'pointer', color: '#cbd5e1' }}>Six Developmental Pillars</span>
                <span onClick={() => setActiveTab('programs')} style={{ cursor: 'pointer', color: '#cbd5e1' }}>Welfare Programs</span>
                <span onClick={() => setActiveTab('donate')} style={{ cursor: 'pointer', color: '#cbd5e1' }}>Donate &amp; Support</span>
                <span onClick={() => setActiveTab('contact')} style={{ cursor: 'pointer', color: '#cbd5e1' }}>Contact Coordinators</span>
              </div>
            </div>

            {/* Column 3: Giving Programs */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>Ways to Help</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <span onClick={() => setShowCashModal(true)} style={{ cursor: 'pointer', color: '#cbd5e1' }}>Direct Monetary Gift</span>
                <span onClick={() => setShowMealModal(true)} style={{ cursor: 'pointer', color: '#cbd5e1' }}>Sponsor a Daily Meal</span>
                <span onClick={() => setActiveTab('programs')} style={{ cursor: 'pointer', color: '#cbd5e1' }}>Scholarship &amp; Books Fund</span>
                <span onClick={() => setActiveTab('programs')} style={{ cursor: 'pointer', color: '#cbd5e1' }}>Health &amp; Pediatric Care</span>
              </div>
            </div>

            {/* Column 4: Contact & Visiting */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>Contact &amp; Sanctuary</div>
              <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>102 Temple Road, Colombo 03, Sri Lanka</div>
                <div>Phone: +94 11 234 5678</div>
                <div>Email: info@oms-orphanage.org</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#f59e0b' }}>
                  Visiting hours: 09:00 AM - 05:00 PM (Appointment required)
                </div>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              &copy; {new Date().getFullYear()} Senehasa Dari Sewana Child Development Center. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>Non-Profit Child Protection Organization</span>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Lock size={11} />
                <span>Authorized Staff Login</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════
          CASH DONATION MODAL (Refined Charity UX)
         ═══════════════════════════════════════════════════════ */}
      {showCashModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setShowCashModal(false)}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              width: '520px',
              maxWidth: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              border: `1px solid ${charityTheme.border}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, fontFamily: charityTheme.fontSerif, color: charityTheme.textHeading }}>
                  Make a Donation
                </h2>
                <p style={{ fontSize: '13px', color: charityTheme.textMuted, margin: '4px 0 0' }}>
                  Support operations, health, and schooling at Senehasa sanctuary.
                </p>
              </div>
              <ModalCloseButton onClick={() => setShowCashModal(false)} />
            </div>

            {cashSuccess ? (
              <div style={{
                padding: '36px 24px',
                textAlign: 'center',
                backgroundColor: charityTheme.accentGreenLight,
                border: `1px solid rgba(5, 150, 105, 0.3)`,
                borderRadius: '16px',
                color: charityTheme.accentGreen
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
                }}>
                  <Check size={28} color={charityTheme.accentGreen} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px', color: charityTheme.textHeading }}>
                  Thank You for Your Generosity!
                </h3>
                <p style={{ fontSize: '14px', color: charityTheme.textBody }}>
                  Your contribution of <strong>LKR {Number(donatedAmount).toLocaleString()}</strong> provides vital support to the children. An official digital receipt is recorded in the system.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCashSubmit}>
                {/* Amount presets */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '8px' }}>
                    Select Donation Amount
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    {['1000', '2500', '5000', '10000', '25000'].map((preset) => {
                      const isSelected = stripCommas(cashForm.amount) === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCashForm({ ...cashForm, amount: formatWithCommas(preset) })}
                          style={{
                            padding: '10px 4px',
                            borderRadius: '8px',
                            border: `1px solid ${isSelected ? charityTheme.primary : charityTheme.border}`,
                            backgroundColor: isSelected ? charityTheme.primaryLight : '#ffffff',
                            color: isSelected ? charityTheme.primary : charityTheme.textBody,
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          Rs. {Number(preset).toLocaleString()}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '11px', fontSize: '13px', fontWeight: 600, color: charityTheme.textMuted }}>
                      LKR
                    </span>
                    <input
                      type="text"
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 48px',
                        borderRadius: '8px',
                        border: `1px solid ${charityTheme.border}`,
                        backgroundColor: '#ffffff',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: charityTheme.textHeading,
                        boxSizing: 'border-box'
                      }}
                      placeholder="Custom amount (e.g. 10,000)"
                      value={cashForm.amount}
                      onChange={(e) => setCashForm({ ...cashForm, amount: formatWithCommas(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '8px' }}>
                    Payment Method
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { id: 'online', label: 'Card Payment (Stripe)', icon: CreditCard },
                      { id: 'bank_transfer', label: 'Bank Transfer Slip', icon: Landmark }
                    ].map((method) => {
                      const isSelected = cashForm.paymentMethod === method.id;
                      const MethodIcon = method.icon;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setCashForm({ ...cashForm, paymentMethod: method.id })}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            border: `1px solid ${isSelected ? charityTheme.primary : charityTheme.border}`,
                            backgroundColor: isSelected ? charityTheme.primaryLight : '#ffffff',
                            color: isSelected ? charityTheme.primary : charityTheme.textBody,
                            fontWeight: 600,
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <MethodIcon size={16} />
                          <span>{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stripe Secure Info Box */}
                {cashForm.paymentMethod === 'online' && (
                  <div style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: charityTheme.bgSurface,
                    border: `1px solid ${charityTheme.border}`,
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <Lock size={18} color={charityTheme.primary} />
                    <div style={{ fontSize: '12px', color: charityTheme.textBody, lineHeight: 1.5 }}>
                      You will be seamlessly redirected to Stripe's SSL 256-bit encrypted checkout to complete your transaction safely.
                    </div>
                  </div>
                )}

                {/* Bank Transfer Upload Box */}
                {cashForm.paymentMethod === 'bank_transfer' && (
                  <div style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: charityTheme.bgSurface,
                    border: `1px solid ${charityTheme.border}`,
                    marginBottom: '18px'
                  }}>
                    <div style={{ fontSize: '12px', color: charityTheme.textHeading, fontWeight: 600, marginBottom: '6px' }}>
                      Bank Account Details for Wire Deposit:
                    </div>
                    <div style={{ fontSize: '12px', color: charityTheme.textMuted, lineHeight: 1.6, marginBottom: '12px' }}>
                      Bank: <strong>Commercial Bank of Ceylon</strong><br />
                      Account Name: <strong>Senehasa Dari Sewana Foundation</strong><br />
                      Account Number: <strong>800-459-2104</strong> &bull; Branch: Kollupitiya
                    </div>

                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: charityTheme.textBody, marginBottom: '6px' }}>
                      Upload Deposit Receipt (Image or PDF) *
                    </label>
                    <input
                      type="file"
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: `1px solid ${charityTheme.border}`,
                        backgroundColor: '#ffffff',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          setCashForm(prev => ({
                            ...prev,
                            proof: {
                              fileData: reader.result,
                              fileName: file.name,
                              fileType: file.type
                            }
                          }));
                        };
                        reader.readAsDataURL(file);
                      }}
                      required={cashForm.paymentMethod === 'bank_transfer'}
                    />
                    {cashForm.proof && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '8px', background: charityTheme.primaryLight, padding: '6px 10px', borderRadius: '6px' }}>
                        <span>File: <strong>{cashForm.proof.fileName}</strong></span>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                          onClick={() => setCashForm(prev => ({ ...prev, proof: null }))}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Donor Contact Details */}
                <div style={{ borderTop: `1px solid ${charityTheme.border}`, paddingTop: '16px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '4px' }}>Full Name *</label>
                    <input
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                        fontSize: '13px', color: charityTheme.textHeading, boxSizing: 'border-box'
                      }}
                      placeholder="e.g. Priyantha Silva"
                      value={cashForm.name}
                      onChange={(e) => setCashForm({ ...cashForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '4px' }}>Email Address *</label>
                      <input
                        type="email"
                        style={{
                          width: '100%', padding: '10px 12px', borderRadius: '8px',
                          border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                          fontSize: '13px', color: charityTheme.textHeading, boxSizing: 'border-box'
                        }}
                        placeholder="your.email@example.com"
                        value={cashForm.email}
                        onChange={(e) => setCashForm({ ...cashForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '4px' }}>Contact Number</label>
                      <input
                        style={{
                          width: '100%', padding: '10px 12px', borderRadius: '8px',
                          border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                          fontSize: '13px', color: charityTheme.textHeading, boxSizing: 'border-box'
                        }}
                        placeholder="+94 77 123 4567"
                        value={cashForm.contactDetails}
                        onChange={(e) => setCashForm({ ...cashForm, contactDetails: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '4px' }}>Donor Type</label>
                    <select
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                        fontSize: '13px', color: charityTheme.textHeading, boxSizing: 'border-box'
                      }}
                      value={cashForm.type}
                      onChange={(e) => setCashForm({ ...cashForm, type: e.target.value })}
                    >
                      <option value="individual">Individual Donor</option>
                      <option value="organization">Corporate / NGO Partner</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '4px' }}>Dedication or Notes (Optional)</label>
                    <textarea
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: '8px',
                        border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                        fontSize: '13px', color: charityTheme.textHeading, minHeight: '60px',
                        resize: 'vertical', boxSizing: 'border-box'
                      }}
                      placeholder="e.g. In memory of family, birthday celebration, etc."
                      value={cashForm.notes}
                      onChange={(e) => setCashForm({ ...cashForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowCashModal(false)}
                    style={{
                      padding: '10px 18px', borderRadius: '8px',
                      border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                      color: charityTheme.textMuted, fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={cashLoading}
                    style={{
                      padding: '10px 24px', borderRadius: '8px',
                      backgroundColor: charityTheme.primary, color: '#ffffff',
                      border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    {cashLoading ? 'Processing Contribution...' : 'Confirm Donation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          BOOK MEAL MODAL (Refined Charity UX)
         ═══════════════════════════════════════════════════════ */}
      {showMealModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setShowMealModal(false)}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '28px 32px',
              width: '880px',
              maxWidth: '96vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              border: `1px solid ${charityTheme.border}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, fontFamily: charityTheme.fontSerif, color: charityTheme.textHeading }}>
                  Sponsor a Nutritious Meal
                </h2>
                <p style={{ fontSize: '13px', color: charityTheme.textMuted, margin: '4px 0 0' }}>
                  Select an open date on the calendar to reserve Breakfast, Lunch, or Dinner for our 50+ children.
                </p>
              </div>
              <ModalCloseButton onClick={() => setShowMealModal(false)} />
            </div>

            {mealSuccess ? (
              <div style={{
                padding: '40px 24px',
                textAlign: 'center',
                backgroundColor: charityTheme.accentGreenLight,
                border: `1px solid rgba(5, 150, 105, 0.3)`,
                borderRadius: '16px',
                color: charityTheme.accentGreen
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
                }}>
                  <Check size={30} color={charityTheme.accentGreen} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px', color: charityTheme.textHeading }}>
                  Meal Sponsorship Scheduled!
                </h3>
                <p style={{ fontSize: '14px', color: charityTheme.textBody }}>
                  Thank you for sponsoring a <strong>{mealForm.mealType}</strong> meal on <strong>{mealForm.mealDate}</strong> ({mealForm.quantity} portions). Our kitchen supervisor and coordinator will prepare everything according to your reservation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleMealSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '28px', alignItems: 'start' }}>

                  {/* Left Column: Interactive Calendar */}
                  <div style={{ borderRight: `1px solid ${charityTheme.border}`, paddingRight: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        style={{
                          padding: '6px 10px', borderRadius: '8px', border: `1px solid ${charityTheme.border}`,
                          backgroundColor: '#ffffff', color: charityTheme.textHeading, cursor: 'pointer'
                        }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: charityTheme.textHeading, fontFamily: charityTheme.fontSerif }}>
                        {monthNames[currentMonth]} {currentYear}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        style={{
                          padding: '6px 10px', borderRadius: '8px', border: `1px solid ${charityTheme.border}`,
                          backgroundColor: '#ffffff', color: charityTheme.textHeading, cursor: 'pointer'
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* Weekday Labels */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} style={{ fontSize: '11px', fontWeight: 700, color: charityTheme.textMuted, textTransform: 'uppercase' }}>
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    {calendarLoading ? (
                      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: charityTheme.textMuted, fontSize: '13px' }}>
                        Checking meal slot availability...
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                        {calendarDays.map((day, idx) => {
                          if (day === null) {
                            return <div key={`empty-${idx}`} />;
                          }

                          const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const targetDate = new Date(currentYear, currentMonth, day);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const isPast = targetDate < today;
                          const isSelected = mealForm.mealDate === dateKey;
                          const isToday = new Date().toDateString() === targetDate.toDateString();

                          const dayBookings = getSlotsForDate(dateKey);
                          const breakfastBooked = dayBookings.some(b => b.mealType === 'breakfast');
                          const lunchBooked = dayBookings.some(b => b.mealType === 'lunch');
                          const dinnerBooked = dayBookings.some(b => b.mealType === 'dinner');
                          const allBooked = breakfastBooked && lunchBooked && dinnerBooked;

                          let bg = '#ffffff';
                          let txtColor = charityTheme.textHeading;
                          let borderStyle = `1px solid ${charityTheme.border}`;
                          let opacityVal = 1;
                          let cursorVal = 'pointer';

                          if (isPast) {
                            opacityVal = 0.35;
                            cursorVal = 'not-allowed';
                            bg = charityTheme.bgSurface;
                          } else if (isSelected) {
                            bg = charityTheme.primary;
                            txtColor = '#ffffff';
                            borderStyle = `1px solid ${charityTheme.primary}`;
                          } else if (allBooked) {
                            bg = '#fee2e2';
                            txtColor = '#dc2626';
                            borderStyle = '1px solid #fca5a5';
                          } else if (isToday) {
                            borderStyle = `2px solid ${charityTheme.accentAmber}`;
                          }

                          return (
                            <div
                              key={`day-${day}`}
                              onClick={() => {
                                if (!isPast) {
                                  setMealForm(prev => ({ ...prev, mealDate: dateKey }));
                                }
                              }}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '6px 2px',
                                borderRadius: '8px',
                                height: '42px',
                                backgroundColor: bg,
                                color: txtColor,
                                border: borderStyle,
                                opacity: opacityVal,
                                cursor: cursorVal,
                                fontWeight: (isSelected || isToday) ? 700 : 500,
                                fontSize: '13px',
                                transition: 'all 0.15s ease',
                                boxSizing: 'border-box'
                              }}
                            >
                              <span>{day}</span>
                              {!isPast && (
                                <div style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
                                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: breakfastBooked ? '#ef4444' : '#10b981' }} title="Breakfast" />
                                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: lunchBooked ? '#ef4444' : '#10b981' }} title="Lunch" />
                                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: dinnerBooked ? '#ef4444' : '#10b981' }} title="Dinner" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Calendar Legend */}
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: charityTheme.textMuted }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Slot Available
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Already Sponsored
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '9px', height: '9px', borderRadius: '2px', backgroundColor: charityTheme.primary }} /> Selected
                        </div>
                      </div>
                      <div style={{ fontSize: '10px', color: charityTheme.textMuted, marginTop: '2px' }}>
                        * To avoid kitchen surplus, each meal slot (Breakfast, Lunch, Dinner) is assigned to a single sponsor.
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Slot Selection & Form */}
                  <div>
                    {!mealForm.mealDate ? (
                      <div style={{ textAlign: 'center', padding: '48px 20px', color: charityTheme.textMuted }}>
                        <Calendar size={44} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <h4 style={{ margin: '0 0 6px', color: charityTheme.textHeading, fontFamily: charityTheme.fontSerif }}>No Date Selected</h4>
                        <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
                          Please click an available date on the calendar to view meal slot availability.
                        </p>
                      </div>
                    ) : (
                      <div>
                        {/* Selected Date Header */}
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ fontSize: '11px', color: charityTheme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                            Selected Date
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: charityTheme.primary, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <Calendar size={15} />
                            {new Date(mealForm.mealDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>

                        {/* Meal Slot Selector */}
                        <div style={{ marginBottom: '14px' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '6px' }}>
                            Choose Meal Slot
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {['breakfast', 'lunch', 'dinner'].map(slotType => {
                              const dayBookings = getSlotsForDate(mealForm.mealDate);
                              const existingSponsor = dayBookings.find(b => b.mealType === slotType);

                              if (existingSponsor) {
                                return (
                                  <div
                                    key={slotType}
                                    style={{
                                      padding: '10px 6px',
                                      borderRadius: '8px',
                                      border: `1px solid ${charityTheme.border}`,
                                      backgroundColor: charityTheme.bgSurface,
                                      textAlign: 'center',
                                      fontSize: '11px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      gap: '3px',
                                      opacity: 0.8
                                    }}
                                  >
                                    <Lock size={12} color="#ef4444" />
                                    <span style={{ textTransform: 'capitalize', fontWeight: 600, color: charityTheme.textMuted }}>{slotType}</span>
                                    <span style={{ fontSize: '10px', color: '#ef4444', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }} title={existingSponsor.donorName}>
                                      Sponsored
                                    </span>
                                  </div>
                                );
                              }

                              const isSelectedSlot = mealForm.mealType === slotType;
                              return (
                                <button
                                  key={slotType}
                                  type="button"
                                  onClick={() => setMealForm(prev => ({ ...prev, mealType: slotType }))}
                                  style={{
                                    padding: '10px 6px',
                                    borderRadius: '8px',
                                    border: `2px solid ${isSelectedSlot ? charityTheme.accentGreen : charityTheme.border}`,
                                    backgroundColor: isSelectedSlot ? charityTheme.accentGreenLight : '#ffffff',
                                    color: isSelectedSlot ? charityTheme.accentGreen : charityTheme.textHeading,
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    textTransform: 'capitalize',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  {isSelectedSlot ? <Check size={12} /> : <Clock size={12} color={charityTheme.textMuted} />}
                                  <span>{slotType}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Menu Package Selection */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '4px' }}>Menu Package</label>
                            <select
                              style={{
                                width: '100%', padding: '9px 10px', borderRadius: '8px',
                                border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                                fontSize: '12px', color: charityTheme.textHeading, boxSizing: 'border-box'
                              }}
                              value={mealForm.menuPackage}
                              onChange={(e) => setMealForm(prev => ({ ...prev, menuPackage: e.target.value }))}
                            >
                              <option value="standard">Standard Menu (LKR 600/kid)</option>
                              <option value="special">Special Menu (LKR 1,200/kid)</option>
                              <option value="feast">Feast Menu (LKR 1,800/kid)</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '4px' }}>Portions Count</label>
                            <input
                              type="number"
                              min="10"
                              style={{
                                width: '100%', padding: '9px 10px', borderRadius: '8px',
                                border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                                fontSize: '12px', color: charityTheme.textHeading, boxSizing: 'border-box'
                              }}
                              value={mealForm.quantity}
                              onChange={(e) => setMealForm(prev => ({ ...prev, quantity: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        {/* Menu Details Description */}
                        <div style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: charityTheme.bgSurface,
                          fontSize: '11px',
                          color: charityTheme.textBody,
                          lineHeight: '1.45',
                          marginBottom: '12px',
                          border: `1px solid ${charityTheme.border}`
                        }}>
                          {mealForm.menuPackage === 'standard' && (
                            <span><strong>Standard Package:</strong> White rice, tempered dhal, mixed seasonal vegetable curry, fresh coconut sambol, and crispy papadum.</span>
                          )}
                          {mealForm.menuPackage === 'special' && (
                            <span><strong>Special Package:</strong> Fragrant ghee rice, chicken or fresh paneer curry, dhal gravy, fresh fruit salad, and caramel pudding dessert.</span>
                          )}
                          {mealForm.menuPackage === 'feast' && (
                            <span><strong>Grand Feast:</strong> Premium basmati biryani (chicken/paneer), eggs, raita, traditional watalappam dessert, ice cream, and chilled fruit juice.</span>
                          )}
                        </div>

                        {/* Occasion & Dietary notes */}
                        <div style={{ marginBottom: '10px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '3px' }}>Occasion / In Honor of (Optional)</label>
                          <input
                            style={{
                              width: '100%', padding: '8px 10px', borderRadius: '8px',
                              border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                              fontSize: '12px', color: charityTheme.textHeading, boxSizing: 'border-box'
                            }}
                            placeholder="e.g. In memory of mother, child's 7th birthday"
                            value={mealForm.occasion}
                            onChange={(e) => setMealForm(prev => ({ ...prev, occasion: e.target.value }))}
                          />
                        </div>

                        {/* Estimated Contribution Summary */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          backgroundColor: charityTheme.accentGreenLight,
                          border: `1px solid rgba(5, 150, 105, 0.25)`,
                          borderRadius: '8px',
                          color: charityTheme.accentGreen,
                          marginBottom: '14px'
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>Total Contribution:</span>
                          <span style={{ fontWeight: 800, fontSize: '16px' }}>
                            LKR {(Number(mealForm.quantity || childCount) * getPackagePrice(mealForm.menuPackage)).toLocaleString()}
                          </span>
                        </div>

                        {/* Donor Contact Details */}
                        <div style={{ borderTop: `1px solid ${charityTheme.border}`, paddingTop: '10px', marginBottom: '10px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
                            <input
                              style={{
                                width: '100%', padding: '8px 10px', borderRadius: '8px',
                                border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                                fontSize: '12px', color: charityTheme.textHeading, boxSizing: 'border-box'
                              }}
                              placeholder="Your full name *"
                              value={mealForm.name}
                              onChange={(e) => setMealForm(prev => ({ ...prev, name: e.target.value }))}
                              required
                            />
                            <input
                              type="email"
                              style={{
                                width: '100%', padding: '8px 10px', borderRadius: '8px',
                                border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                                fontSize: '12px', color: charityTheme.textHeading, boxSizing: 'border-box'
                              }}
                              placeholder="Email address *"
                              value={mealForm.email}
                              onChange={(e) => setMealForm(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                          <input
                            style={{
                              width: '100%', padding: '8px 10px', borderRadius: '8px',
                              border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                              fontSize: '12px', color: charityTheme.textHeading, boxSizing: 'border-box'
                            }}
                            placeholder="Contact phone number (optional)"
                            value={mealForm.contactDetails}
                            onChange={(e) => setMealForm(prev => ({ ...prev, contactDetails: e.target.value }))}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                          <button
                            type="button"
                            onClick={() => setShowMealModal(false)}
                            style={{
                              padding: '8px 16px', borderRadius: '8px',
                              border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                              color: charityTheme.textMuted, fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={mealLoading}
                            style={{
                              padding: '8px 20px', borderRadius: '8px',
                              backgroundColor: charityTheme.accentGreen, color: '#ffffff',
                              border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                          >
                            {mealLoading ? 'Confirming...' : 'Reserve Meal Slot'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
