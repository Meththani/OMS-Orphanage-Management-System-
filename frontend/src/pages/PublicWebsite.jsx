import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, HandHeart, Phone, Mail, MapPin, Calendar, Clock, Check, Lock,
  ChevronLeft, ChevronRight, BookOpen, FileText, Sparkles, Trophy, Apple, Palette,
  HandCoins, UtensilsCrossed, Utensils, CreditCard, Landmark, Target, Compass,
  ShieldCheck, Users, ArrowRight, Award, GraduationCap, Baby
} from 'lucide-react';
import ModalCloseButton from '../components/ModalCloseButton';
import AboutHeroCard from '../components/AboutHeroCard';
import HistoryTimelineCard from '../components/HistoryTimelineCard';
import LanguageSelector from '../components/LanguageSelector';
import { formatWithCommas, stripCommas } from '../utils/numberFormat';
import { useLanguage } from '../context/LanguageContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Shared Refined Theme Tokens (Matched to Staff Portal UI) ───
const charityTheme = {
  primary: '#1d70b8',        // Portal Royal Blue
  primaryDark: '#154e80',
  primaryLight: 'rgba(29, 112, 184, 0.08)',
  primaryGlow: 'rgba(29, 112, 184, 0.18)',

  sidebarNavy: '#0c3254',    // Portal Dark Navy Contrast
  accentAmber: '#f19c38',    // Portal Warm Amber Accent
  accentAmberLight: 'rgba(241, 156, 56, 0.15)',
  accentGreen: '#10b981',    // Portal Success Green
  accentGreenLight: 'rgba(16, 185, 129, 0.12)',
  accentRose: '#e11d48',     // Warm Heart Accent
  accentRoseLight: '#ffe4e6',

  bgMain: 'rgba(230, 241, 252, 0.65)', // Portal Soft Translucent Blue Backdrop
  bgCard: 'rgba(255, 255, 255, 0.88)',
  bgSurface: '#f1f6fb',
  bgSoft: '#f8fafc',

  textHeading: '#1e293b',    // Portal Slate Heading
  textBody: '#475569',
  textMuted: '#64748b',

  border: 'rgba(15, 23, 42, 0.08)',
  borderWarm: 'rgba(241, 156, 56, 0.22)',
  borderHover: 'rgba(15, 23, 42, 0.18)',

  fontHeading: "'Outfit', sans-serif",
  fontSerif: "'Lora', Georgia, serif",
  fontSans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  shadowCard: '0 10px 30px -10px rgba(15, 23, 42, 0.06), 0 1px 1px 0 rgba(255, 255, 255, 0.6) inset',
  shadowHover: '0 20px 40px -12px rgba(15, 23, 42, 0.12), 0 0 20px rgba(29, 112, 184, 0.1)',
};

export default function PublicWebsite({ initialTab = 'home' }) {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [bookedAdvanceAmount, setBookedAdvanceAmount] = useState('0');
  const navigate = useNavigate();

  // ─── Hero Auto-Swiping Card Slides State (Whole Card Carousel) ───
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);

  const heroSlides = [
    {
      badge: t('Empowering Children Across Sri Lanka'),
      badgeIcon: HandHeart,
      badgeColor: charityTheme.primary,
      badgeBg: charityTheme.primaryLight,
      title: t('Safe Shelter, Wholesome Food, & Bright Educational Futures.'),
      description: t('At Senehasa Dari Sewana, we provide round-the-clock loving care, nutritious daily meals, complete schooling support, and medical protection to over 50 orphaned and vulnerable children.'),
      primaryBtnText: t('Make a Financial Gift'),
      primaryBtnIcon: Heart,
      primaryBtnColor: charityTheme.primary,
      primaryBtnHoverColor: charityTheme.primaryDark,
      primaryBtnAction: () => setShowCashModal(true),
      secondaryBtnText: t('Sponsor a Daily Meal'),
      secondaryBtnIcon: UtensilsCrossed,
      secondaryBtnAction: () => setShowMealModal(true),
      image: '/hero-child.jpg',
      imageTag: t('Kirillawala Sanctuary • 50+ Children'),
    },
    {
      badge: t('Full Daily Meals Initiative'),
      badgeIcon: UtensilsCrossed,
      badgeColor: charityTheme.accentGreen,
      badgeBg: charityTheme.accentGreenLight,
      title: t('Nourishing 50+ Children Everyday with Fresh, Wholesome Meals.'),
      description: t('Every child deserves wholesome, balanced nutrition. You can sponsor a warm breakfast, high-protein lunch, or comforting dinner cooked daily in our sanitary kitchen facility.'),
      primaryBtnText: t('Sponsor a Daily Meal'),
      primaryBtnIcon: UtensilsCrossed,
      primaryBtnColor: charityTheme.accentGreen,
      primaryBtnHoverColor: '#059669',
      primaryBtnAction: () => setShowMealModal(true),
      secondaryBtnText: t('View Meal Schedule'),
      secondaryBtnIcon: Calendar,
      secondaryBtnAction: () => setActiveTab('programs'),
      image: '/full-plates-meal-program.jpg',
      imageTag: t('100% Nutritious • Fresh Daily Preparation'),
    },
    {
      badge: t('Educational Scholarship Program'),
      badgeIcon: GraduationCap,
      badgeColor: charityTheme.accentAmber,
      badgeBg: charityTheme.accentAmberLight,
      title: t('Empowering Young Minds Through Books, Supplies & Tuition.'),
      description: t('Breaking generational cycles through quality schooling. Our scholarship program provides textbooks, school uniforms, shoes, stationery sets, and private tutoring.'),
      primaryBtnText: t('Sponsor a Student'),
      primaryBtnIcon: GraduationCap,
      primaryBtnColor: charityTheme.primary,
      primaryBtnHoverColor: charityTheme.primaryDark,
      primaryBtnAction: () => setShowCashModal(true),
      secondaryBtnText: t('Learn About Scholarships'),
      secondaryBtnIcon: BookOpen,
      secondaryBtnAction: () => setActiveTab('programs'),
      image: '/scholarship-school-supplies.jpg',
      imageTag: t('100% School Attendance • Academic Excellence'),
    },
    {
      badge: t('Pediatric Health & Wellness'),
      badgeIcon: ShieldCheck,
      badgeColor: charityTheme.accentRose,
      badgeBg: charityTheme.accentRoseLight,
      title: t('Round-the-Clock Healthcare, Dental Care & Emergency Coverage.'),
      description: t('We ensure every resident child receives routine physician checkups, pediatric dental visits, prescription medicines, and complete mental wellness support.'),
      primaryBtnText: t('Support Healthcare Fund'),
      primaryBtnIcon: ShieldCheck,
      primaryBtnColor: charityTheme.primary,
      primaryBtnHoverColor: charityTheme.primaryDark,
      primaryBtnAction: () => setShowCashModal(true),
      secondaryBtnText: t('Contact Medical Team'),
      secondaryBtnIcon: Phone,
      secondaryBtnAction: () => setActiveTab('contact'),
      image: '/child-health-wellness.jpg',
      imageTag: t('Routine Screenings • 24/7 Medical Care'),
    },
    {
      badge: t('Sri Lankan Cultural Heritage'),
      badgeIcon: Trophy,
      badgeColor: '#f19c38',
      badgeBg: 'rgba(241, 156, 56, 0.15)',
      title: t('Preserving Cultural Heritage with Festive Outfits & Traditions.'),
      description: t('Celebrating traditional holidays like Sinhala & Tamil New Year with new festive clothes (traditional Lama Sariya outfits), festive meals, and traditional games.'),
      primaryBtnText: t('Donate Festive Outfits'),
      primaryBtnIcon: Trophy,
      primaryBtnColor: '#f19c38',
      primaryBtnHoverColor: '#d97706',
      primaryBtnAction: () => setShowCashModal(true),
      secondaryBtnText: t('Explore Cultural Events'),
      secondaryBtnIcon: Sparkles,
      secondaryBtnAction: () => setActiveTab('programs'),
      image: '/new-year-celebration.jpg',
      imageTag: t('Traditional Costumes • Festive Celebration'),
    },
    {
      badge: t('Annual Youth Events & Celebrations'),
      badgeIcon: Award,
      badgeColor: '#8b5cf6',
      badgeBg: 'rgba(139, 92, 246, 0.15)',
      title: t('Creating Unforgettable Smiles with Magic Shows & Gifts.'),
      description: t('Bringing joy to every child on Children’s Day and special occasions with customized gift hampers, magic shows, carnival treats, and outdoor educational trips.'),
      primaryBtnText: t('Sponsor Event Joy'),
      primaryBtnIcon: Award,
      primaryBtnColor: charityTheme.primary,
      primaryBtnHoverColor: charityTheme.primaryDark,
      primaryBtnAction: () => setShowCashModal(true),
      secondaryBtnText: t('Volunteer for Events'),
      secondaryBtnIcon: Users,
      secondaryBtnAction: () => setActiveTab('contact'),
      image: '/childrens-day-celebration.jpg',
      imageTag: t('Gift Packages • Field Trips & Joy'),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlideIdx((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    setActiveTab(initialTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        fetch(`${API_BASE_URL}/public/confirm-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
          .then(res => res.json())
          .then(data => console.log('Stripe checkout session verified:', data))
          .catch(err => console.error('Error verifying Stripe session:', err));
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'meal_success') {
      setBookedAdvanceAmount(amt || '0');
      setMealSuccess(true);
      setShowMealModal(true);

      if (sessionId) {
        fetch(`${API_BASE_URL}/public/confirm-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
          .then(res => res.json())
          .then(data => {
            console.log('Stripe meal advance verified:', data);
            fetchBookedMeals();
          })
          .catch(err => console.error('Error verifying Stripe meal session:', err));
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'cancel') {
      alert(language === 'si' ? 'ගෙවීම අවලංගු කරන ලදී. ඔබට නැවත උත්සාහ කළ හැක.' : 'Payment cancelled. You can try again whenever you are ready.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [language]);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Cash Donation Form State
  const [cashForm, setCashForm] = useState({ name: '', email: '', contactDetails: '', type: 'individual', amount: '1,000', paymentMethod: 'online', proof: null, notes: '' });
  const [cashSuccess, setCashSuccess] = useState(false);
  const [cashLoading, setCashLoading] = useState(false);
  const [donatedAmount, setDonatedAmount] = useState('0');

  // Meal Booking Form State with Advance Payment
  const [mealForm, setMealForm] = useState({
    name: '',
    email: '',
    contactDetails: '',
    mealDate: '',
    mealType: 'lunch',
    quantity: '50',
    occasion: '',
    menuPackage: 'standard',
    dietaryNotes: '',
    advanceOption: '2500', // '2500', '5000', 'custom'
    customAdvance: '',
    paymentMethod: 'bank_transfer', // 'bank_transfer', 'online'
    proof: null
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
      const res = await fetch(`${API_BASE_URL}/public/booked-meals`);
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

  const calculateMealTotal = () => {
    const qty = Number(childCount || mealForm.quantity || 50);
    return qty * 600;
  };

  const calculateAdvanceAmount = () => {
    if (mealForm.advanceOption === '5000') return 5000;
    if (mealForm.advanceOption === 'custom') {
      const clean = stripCommas(String(mealForm.customAdvance || '0'));
      const customVal = Number(clean);
      return isNaN(customVal) || customVal <= 0 ? 0 : customVal;
    }
    // Default standard confirmation deposit: LKR 2,500
    return 2500;
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
      const res = await fetch(`${API_BASE_URL}/public/contact`, {
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
        alert(language === 'si' ? 'කරුණාකර වලංගු පරිත්‍යාග මුදලක් ඇතුළත් කරන්න.' : 'Please enter a valid donation amount.');
        setCashLoading(false);
        return;
      }

      if (cashForm.paymentMethod === 'bank_transfer' && !cashForm.proof) {
        alert(language === 'si' ? 'කරුණාකර ගෙවීමේ සාක්ෂියක් ලෙස බැංකු රිසිට්පත උඩුගත කරන්න.' : 'Please upload a bank transfer receipt as proof of payment.');
        setCashLoading(false);
        return;
      }

      if (cashForm.paymentMethod === 'online') {
        const res = await fetch(`${API_BASE_URL}/public/create-checkout-session`, {
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
          alert(data.message || (language === 'si' ? 'Stripe සබැඳිය සකස් කිරීම අසාර්ථක විය.' : 'Failed to initialize Stripe checkout session.'));
          setCashLoading(false);
          return;
        }
      }

      const res = await fetch(`${API_BASE_URL}/public/donate-cash`, {
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
        }, 3500);
      } else {
        alert(data.message || (language === 'si' ? 'පරිත්‍යාගය සටහන් කිරීම අසාර්ථක විය.' : 'Donation submission failed.'));
      }
    } catch (err) {
      console.error(err);
      alert(language === 'si' ? 'ජාල දෝෂයකි. කරුණාකර නැවත උත්සාහ කරන්න.' : 'Network error. Failed to submit donation.');
    } finally {
      setCashLoading(false);
    }
  };

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    if (!mealForm.mealDate) {
      alert(language === 'si' ? 'කරුණාකර දින දර්ශනයෙන් දිනයක් තෝරන්න.' : 'Please select an available date on the calendar.');
      return;
    }

    const advance = calculateAdvanceAmount();

    if (!advance || advance < 1000) {
      alert(language === 'si' ? 'කරුණාකර වලංගු තහවුරු තැන්පතු මුදලක් ඇතුළත් කරන්න (අවම වශයෙන් රු. 1,000).' : 'Please specify a valid confirmation deposit amount (at least LKR 1,000).');
      return;
    }

    if (mealForm.paymentMethod === 'bank_transfer' && !mealForm.proof) {
      alert(language === 'si' ? 'කරුණාකර තහවුරු තැන්පතු ගෙවීමේ බැංකු රිසිට්පත උඩුගත කරන්න.' : 'Please upload a bank deposit slip as proof of the confirmation deposit.');
      return;
    }

    setMealLoading(true);
    try {
      if (mealForm.paymentMethod === 'online') {
        const res = await fetch(`${API_BASE_URL}/public/create-meal-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...mealForm,
            quantity: String(childCount || 50),
            totalAmount: advance,
            advanceAmount: advance
          }),
        });
        const data = await res.json();
        if (res.ok && data.url) {
          window.location.href = data.url;
          return;
        } else {
          alert(data.message || (language === 'si' ? 'Stripe සබැඳිය සකස් කිරීම අසාර්ථක විය.' : 'Failed to initialize Stripe checkout session for meal advance.'));
          setMealLoading(false);
          return;
        }
      }

      // Direct Bank Transfer
      const res = await fetch(`${API_BASE_URL}/public/book-meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mealForm,
          quantity: String(childCount || 50),
          totalAmount: advance,
          advanceAmount: advance,
          advancePaymentMethod: 'bank_transfer'
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookedAdvanceAmount(String(advance));
        setMealSuccess(true);
        setMealForm({
          name: '',
          email: '',
          contactDetails: '',
          mealDate: '',
          mealType: 'lunch',
          quantity: String(childCount || 50),
          occasion: '',
          menuPackage: 'standard',
          dietaryNotes: '',
          advanceOption: '2500',
          customAdvance: '',
          paymentMethod: 'bank_transfer',
          proof: null
        });
        fetchBookedMeals();
        setTimeout(() => {
          setMealSuccess(false);
          setShowMealModal(false);
        }, 4000);
      } else {
        alert(data.message || (language === 'si' ? 'වෙන්කිරීම අසාර්ථක විය.' : 'Booking failed.'));
      }
    } catch (err) {
      console.error(err);
      alert(language === 'si' ? 'වෙන්කිරීමේදී දෝෂයක් සිදු විය.' : 'An error occurred during meal booking.');
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

      {/* ═══════════════════════════════════════════════════════
          1. TOP TRUST & ACCREDITATION BAR (Memorability & Trust)
         ═══════════════════════════════════════════════════════ */}
      <div style={{
        backgroundColor: charityTheme.sidebarNavy,
        color: '#cbd5e1',
        fontSize: '12px',
        padding: '9px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={15} color={charityTheme.accentAmber} />
          <span>{t("Government Registered Child Sanctuary")} &bull; <strong style={{ color: '#ffffff' }}>{t("Kirillawala Senehasa Dari Sewana")}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="tel:+94112972129" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0' }}>
            <Phone size={13} color={charityTheme.accentAmber} />
            <span>011 297 2129</span>
          </a>
          <a href="mailto:info@senehasadarisewana.org" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0' }}>
            <Mail size={13} color={charityTheme.accentAmber} />
            <span>info@senehasadarisewana.org</span>
          </a>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
            <MapPin size={13} />
            <span>{t("Kirillawala, Webada, Sri Lanka")}</span>
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          2. STICKY BRAND NAVIGATION HEADER (Learnability)
         ═══════════════════════════════════════════════════════ */}
      <header className="public-header-container" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: charityTheme.bgCard,
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${charityTheme.borderWarm}`,
        padding: '0 32px',
        height: '76px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
      }}>
        <div
          className="public-header-brand"
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
          onClick={() => { setActiveTab('home'); }}
        >
          <img
            src="/logo-icon.png"
            alt="OMS Senehasa Dari Sewana Logo"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: `2px solid ${charityTheme.accentAmber}`,
              boxShadow: '0 0 15px rgba(241, 156, 56, 0.35)'
            }}
          />
          <div>
            <div style={{
              fontSize: '21px',
              fontWeight: 800,
              fontFamily: charityTheme.fontHeading,
              color: charityTheme.textHeading,
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              {t("Senehasa Dari Sewana")}
            </div>
            <div style={{
              fontSize: '11px',
              color: charityTheme.textMuted,
              letterSpacing: '0.04em',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginTop: '2px'
            }}>
              {t("Child Development Center & Sanctuary")}
            </div>
          </div>
        </div>

        {/* Desktop & Mobile Navigation Links */}
        <nav className="public-nav-list" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[
            { id: 'home', label: 'Home' },
            { id: 'about', label: 'About Us' },
            { id: 'facilities', label: 'Facilities' },
            { id: 'programs', label: 'Programs' },
            { id: 'contact', label: 'Contact Us' },
            { id: 'donate', label: 'Support Us' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
                {t(tab.label)}
              </button>
            );
          })}

          <div style={{ width: '1px', height: '24px', backgroundColor: charityTheme.border, margin: '0 8px' }} />

          {/* Language Switcher Dropdown: 🇬🇧 English / 🇱🇰 සිංහල */}
          <div style={{ marginRight: '6px' }}>
            <LanguageSelector />
          </div>

          {/* Quick Action Buttons */}
          <button
            onClick={() => setShowCashModal(true)}
            style={{
              backgroundColor: charityTheme.primary,
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(29, 112, 184, 0.25)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = charityTheme.primaryDark;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = charityTheme.primary;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <HandHeart size={16} />
            <span>{t("Donate Now")}</span>
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
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = charityTheme.borderHover;
              e.currentTarget.style.color = charityTheme.textHeading;
              e.currentTarget.style.backgroundColor = charityTheme.bgSurface;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = charityTheme.border;
              e.currentTarget.style.color = charityTheme.textMuted;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Lock size={13} />
            <span>{t("Authorized Staff Login", "Staff Portal")}</span>
          </button>
        </nav>
      </header>

      {/* ═══════════════════════════════════════════════════════
          3. MAIN WEBSITE PAGE CONTENT
         ═══════════════════════════════════════════════════════ */}
      <main style={{ flex: 1, padding: '36px 32px 64px', maxWidth: '1240px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* ───────────────────────────────────────────────────────
            HOME TAB CONTENT (Visual Wow & Learnability)
           ─────────────────────────────────────────────────────── */}
        {activeTab === 'home' && (
          <div style={{ animation: 'fadeIn 0.35s ease-out' }}>

            {/* Whole Hero Card Auto-Swiping Carousel */}
            <div style={{
              position: 'relative',
              marginBottom: '48px',
              borderRadius: '24px',
              backgroundColor: charityTheme.bgCard,
              border: `1px solid ${charityTheme.borderWarm}`,
              boxShadow: charityTheme.shadowCard,
              backdropFilter: 'blur(12px)',
              overflow: 'hidden',
              minHeight: '480px'
            }}>
              {/* Slides Container */}
              <div style={{ position: 'relative', width: '100%', minHeight: '480px' }}>
                {heroSlides.map((slide, idx) => {
                  const isActive = idx === heroSlideIdx;
                  return (
                    <div
                      key={idx}
                      className="hero-slide-grid"
                      style={{
                        position: isActive ? 'relative' : 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: isActive ? 1 : 0,
                        visibility: isActive ? 'visible' : 'hidden',
                        transform: `scale(${isActive ? 1 : 0.98})`,
                        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.6s ease',
                        pointerEvents: isActive ? 'auto' : 'none',
                        display: 'grid',
                        gridTemplateColumns: '1.15fr 0.95fr',
                        gap: '40px',
                        alignItems: 'center',
                        padding: '44px 48px 64px 48px',
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* Left Column: Text & Buttons */}
                      <div>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 16px',
                          borderRadius: '30px',
                          backgroundColor: slide.badgeBg,
                          color: slide.badgeColor,
                          fontSize: '12px',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          marginBottom: '20px'
                        }}>
                          <slide.badgeIcon size={15} />
                          <span>{slide.badge}</span>
                        </div>

                        <h1 className="hero-slide-headline" style={{
                          fontSize: '38px',
                          fontWeight: 800,
                          fontFamily: charityTheme.fontHeading,
                          color: charityTheme.textHeading,
                          lineHeight: 1.2,
                          marginBottom: '18px',
                          letterSpacing: '-0.02em',
                          minHeight: '92px'
                        }}>
                          {slide.title}
                        </h1>

                        <p className="hero-slide-desc" style={{
                          color: charityTheme.textBody,
                          fontSize: '15px',
                          lineHeight: 1.7,
                          marginBottom: '30px',
                          maxWidth: '540px',
                          minHeight: '75px'
                        }}>
                          {slide.description}
                        </p>

                        <div className="mobile-stack-buttons" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <button
                            onClick={slide.primaryBtnAction}
                            style={{
                              backgroundColor: slide.primaryBtnColor || charityTheme.primary,
                              color: '#ffffff',
                              border: 'none',
                              padding: '13px 26px',
                              borderRadius: '12px',
                              fontWeight: 700,
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '9px',
                              boxShadow: `0 4px 14px ${slide.primaryBtnColor ? slide.primaryBtnColor + '35' : 'rgba(29, 112, 184, 0.22)'}`,
                              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                              fontFamily: charityTheme.fontSans,
                              letterSpacing: '0.01em'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = slide.primaryBtnHoverColor || charityTheme.primaryDark;
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = `0 6px 20px ${slide.primaryBtnColor ? slide.primaryBtnColor + '45' : 'rgba(29, 112, 184, 0.35)'}`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = slide.primaryBtnColor || charityTheme.primary;
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = `0 4px 14px ${slide.primaryBtnColor ? slide.primaryBtnColor + '35' : 'rgba(29, 112, 184, 0.22)'}`;
                            }}
                          >
                            <slide.primaryBtnIcon size={17} fill={slide.primaryBtnIcon === Heart ? '#ffffff' : 'none'} />
                            <span>{slide.primaryBtnText}</span>
                          </button>

                          <button
                            onClick={slide.secondaryBtnAction}
                            style={{
                              backgroundColor: '#ffffff',
                              color: charityTheme.textHeading,
                              border: `1.5px solid ${charityTheme.borderWarm}`,
                              padding: '13px 22px',
                              borderRadius: '12px',
                              fontWeight: 700,
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                              fontFamily: charityTheme.fontSans,
                              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = charityTheme.primaryLight;
                              e.currentTarget.style.borderColor = charityTheme.primary;
                              e.currentTarget.style.color = charityTheme.primary;
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = charityTheme.borderWarm;
                              e.currentTarget.style.color = charityTheme.textHeading;
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <slide.secondaryBtnIcon size={16} />
                            <span>{slide.secondaryBtnText}</span>
                          </button>
                        </div>
                      </div>

                      {/* Right Column: Hero Image Frame */}
                      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                        <div className="hero-image-frame" style={{
                          width: '100%',
                          maxWidth: '430px',
                          height: '370px',
                          borderRadius: '24px',
                          overflow: 'hidden',
                          border: `1px solid ${charityTheme.borderWarm}`,
                          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.14)',
                          position: 'relative',
                          backgroundColor: '#ffffff'
                        }}>
                          <img
                            src={slide.image}
                            alt={slide.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />

                          {/* Floating Bottom Badge */}
                          <div style={{
                            position: 'absolute',
                            bottom: '16px',
                            left: '16px',
                            right: '16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${charityTheme.border}`,
                            borderRadius: '14px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)'
                          }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: slide.badgeBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: slide.badgeColor,
                              flexShrink: 0
                            }}>
                              <slide.badgeIcon size={18} />
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: charityTheme.textHeading }}>
                              {slide.imageTag}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Navigation & Pagination Bar */}
              <div className="hero-bottom-bar" style={{
                position: 'absolute',
                bottom: '16px',
                left: '48px',
                right: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 10
              }}>
                {/* Left Side: Slide Counter */}
                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: charityTheme.textMuted,
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  border: `1px solid ${charityTheme.border}`,
                  backdropFilter: 'blur(6px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  {language === 'si' ? `කාඩ්පත ${heroSlideIdx + 1} / ${heroSlides.length}` : `Card ${heroSlideIdx + 1} of ${heroSlides.length}`}
                </div>

                {/* Center: Pagination Dots */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {heroSlides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setHeroSlideIdx(dotIdx)}
                      style={{
                        width: dotIdx === heroSlideIdx ? '26px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        backgroundColor: dotIdx === heroSlideIdx ? heroSlides[heroSlideIdx].badgeColor : 'rgba(15, 23, 42, 0.2)',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      title={language === 'si' ? `${dotIdx + 1} වන කාඩ්පත වෙත යන්න` : `Go to card ${dotIdx + 1}`}
                    />
                  ))}
                </div>

                {/* Right Side: Navigation Arrows */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setHeroSlideIdx((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.92)',
                      border: `1px solid ${charityTheme.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: charityTheme.textHeading,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)'}
                    title={t("Previous card")}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setHeroSlideIdx((prev) => (prev + 1) % heroSlides.length)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.92)',
                      border: `1px solid ${charityTheme.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: charityTheme.textHeading,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)'}
                    title={t("Next card")}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Pillar Cards (3 Core Giving Pathways) */}
            <div className="pillar-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              marginBottom: '48px'
            }}>
              {/* Pillar 1: Financial Support */}
              <div
                style={{
                  backgroundColor: charityTheme.bgCard,
                  borderRadius: '20px',
                  padding: '28px',
                  border: `1px solid ${charityTheme.borderWarm}`,
                  boxShadow: charityTheme.shadowCard,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => setShowCashModal(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = charityTheme.shadowHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = charityTheme.shadowCard;
                }}
              >
                <div style={{
                  width: '100%',
                  height: '160px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  border: `1px solid ${charityTheme.border}`,
                  position: 'relative'
                }}>
                  <img
                    src="/financial-gift.jpg"
                    alt="Direct Financial Gift"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <HandCoins size={22} color={charityTheme.primary} />
                  </div>
                </div>

                <h3 style={{ fontSize: '22px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '10px', fontFamily: charityTheme.fontHeading }}>
                  {t("Direct Financial Gift")}
                </h3>
                <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.6, flex: 1, marginBottom: '20px' }}>
                  {t("Fund educational textbooks, medical checkups, utility bills, and caregiver stipends. Instant online card donation or bank deposit.")}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: charityTheme.primary, fontWeight: 700, fontSize: '14px' }}>
                  <span>{t("Donate Now")}</span>
                  <ArrowRight size={16} />
                </div>
              </div>

              {/* Pillar 2: Meal Booking */}
              <div
                style={{
                  backgroundColor: charityTheme.bgCard,
                  borderRadius: '20px',
                  padding: '32px',
                  border: `1px solid rgba(16, 185, 129, 0.25)`,
                  boxShadow: charityTheme.shadowCard,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => setShowMealModal(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = charityTheme.shadowHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = charityTheme.shadowCard;
                }}
              >
                <div style={{
                  width: '100%',
                  height: '160px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  border: `1px solid ${charityTheme.border}`,
                  position: 'relative'
                }}>
                  <img
                    src="/sponsor-meal.jpg"
                    alt="Sponsor a Warm Meal"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <UtensilsCrossed size={22} color={charityTheme.accentGreen} />
                  </div>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '10px', fontFamily: charityTheme.fontHeading }}>
                  {t("Sponsor a Warm Meal")}
                </h3>
                <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.6, flex: 1, marginBottom: '20px' }}>
                  {t("Mark your birthday or special family occasion by sponsoring Breakfast, Lunch, or Dinner for our 50+ children.")}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: charityTheme.accentGreen, fontWeight: 700, fontSize: '14px' }}>
                  <span>{t("Open Booking Calendar")}</span>
                  <ArrowRight size={16} />
                </div>
              </div>

              {/* Pillar 3: Educational Scholarships */}
              <div
                style={{
                  backgroundColor: charityTheme.bgCard,
                  borderRadius: '20px',
                  padding: '32px',
                  border: `1px solid rgba(241, 156, 56, 0.25)`,
                  boxShadow: charityTheme.shadowCard,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveTab('programs')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = charityTheme.shadowHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = charityTheme.shadowCard;
                }}
              >
                <div style={{
                  width: '100%',
                  height: '160px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  border: `1px solid ${charityTheme.border}`,
                  position: 'relative'
                }}>
                  <img
                    src="/child-scholarship.jpg"
                    alt="Child Scholarship Fund"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <BookOpen size={22} color={charityTheme.accentAmber} />
                  </div>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '10px', fontFamily: charityTheme.fontHeading }}>
                  {t("Child Scholarship Fund")}
                </h3>
                <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.6, flex: 1, marginBottom: '20px' }}>
                  {t("Provide school uniform sets, shoes, stationeries, tuition classes, and specialized learning materials for school-going kids.")}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: charityTheme.accentAmber, fontWeight: 700, fontSize: '14px' }}>
                  <span>{t("Explore Programs")}</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>

            {/* Impact Statistics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
              marginBottom: '48px'
            }}>
              {[
                { number: '50+', label: t('Active Children in Care'), icon: Users, color: charityTheme.primary, bg: charityTheme.primaryLight },
                { number: '100%', label: t('School Enrollment Rate'), icon: BookOpen, color: charityTheme.accentGreen, bg: charityTheme.accentGreenLight },
                { number: '3 Meals', label: t('Daily Balanced Nutrition'), icon: Utensils, color: charityTheme.accentAmber, bg: charityTheme.accentAmberLight },
                { number: '24 / 7', label: t('Dedicated Caregiver Staff'), icon: Heart, color: charityTheme.accentRose, bg: charityTheme.accentRoseLight },
              ].map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={i}
                    style={{
                      backgroundColor: charityTheme.bgCard,
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
                      <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading, lineHeight: 1.1 }}>
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

            {/* How Your Donation Works (Step-by-Step Learnability) */}
            <div style={{
              backgroundColor: charityTheme.bgCard,
              borderRadius: '24px',
              padding: '48px',
              border: `1px solid ${charityTheme.borderWarm}`,
              boxShadow: charityTheme.shadowCard,
              marginBottom: '48px'
            }}>
              <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: charityTheme.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px'
                }}>
                  {t("Transparent Giving Process")}
                </div>
                <h2 style={{ fontSize: '34px', fontWeight: 800, fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading, marginBottom: '12px' }}>
                  {t("How Your Contribution Reaches the Children")}
                </h2>
                <p style={{ color: charityTheme.textMuted, fontSize: '15px' }}>
                  {t("We prioritize total transparency, digital receipting, and real-time portal logging for every single rupee received.")}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                <div style={{
                  padding: '28px', borderRadius: '16px', backgroundColor: charityTheme.bgSurface, border: `1px solid ${charityTheme.border}`
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: charityTheme.primary, marginBottom: '10px' }}>{t("STEP 01")}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '8px', fontFamily: charityTheme.fontHeading }}>
                    {t("Select Cause or Meal Date")}
                  </h3>
                  <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.6 }}>
                    {t("Choose between monetary donations or select an open slot on the interactive meal calendar.")}
                  </p>
                </div>

                <div style={{
                  padding: '28px', borderRadius: '16px', backgroundColor: charityTheme.bgSurface, border: `1px solid ${charityTheme.border}`
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: charityTheme.accentGreen, marginBottom: '10px' }}>{t("STEP 02")}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '8px', fontFamily: charityTheme.fontHeading }}>
                    {t("Instant Digital Verification")}
                  </h3>
                  <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.6 }}>
                    {t("Payments via Stripe or bank receipt uploads are logged into the staff portal system instantly.")}
                  </p>
                </div>

                <div style={{
                  padding: '28px', borderRadius: '16px', backgroundColor: charityTheme.bgSurface, border: `1px solid ${charityTheme.border}`
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: charityTheme.accentAmber, marginBottom: '10px' }}>{t("STEP 03")}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '8px', fontFamily: charityTheme.fontHeading }}>
                    {t("Direct Child Impact")}
                  </h3>
                  <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.6 }}>
                    {t("100% of funds are allocated to purchasing fresh food, school supplies, and medical care for the kids.")}
                  </p>
                </div>
              </div>
            </div>

            {/* Mission & Vision Section */}
            <div style={{
              backgroundColor: charityTheme.bgCard,
              borderRadius: '24px',
              padding: '48px',
              border: `1px solid ${charityTheme.borderWarm}`,
              boxShadow: charityTheme.shadowCard
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
                  {t("About Senehasa Dari Sewana")}
                </div>
                <h2 style={{
                  fontSize: '34px',
                  fontWeight: 800,
                  fontFamily: charityTheme.fontHeading,
                  color: charityTheme.textHeading,
                  lineHeight: 1.25,
                  marginBottom: '16px'
                }}>
                  {t("Dedicated to Restoring Hope & Happiness")}
                </h2>
                <p style={{ color: charityTheme.textBody, fontSize: '15px', lineHeight: 1.75 }}>
                  {t("Founded in Sri Lanka as a sanctuary for orphaned and underprivileged children, Senehasa Dari Sewana offers safe living space, wholesome daily meals, tuition classes, and emotional support.")}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div style={{ padding: '28px', borderRadius: '16px', backgroundColor: charityTheme.bgSurface, border: `1px solid ${charityTheme.border}` }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: charityTheme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Target size={22} color={charityTheme.primary} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '8px', fontFamily: charityTheme.fontHeading }}>
                    {t("Our Mission")}
                  </h3>
                  <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.6 }}>
                    {t("To offer vulnerable children safe sanctuary, quality health, tailored learning, and life coaching.")}
                  </p>
                </div>

                <div style={{ padding: '28px', borderRadius: '16px', backgroundColor: charityTheme.bgSurface, border: `1px solid ${charityTheme.border}` }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: charityTheme.accentGreenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Compass size={22} color={charityTheme.accentGreen} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '8px', fontFamily: charityTheme.fontHeading }}>
                    {t("Our Vision")}
                  </h3>
                  <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.6 }}>
                    {t("A world where every orphaned child becomes an empowered, educated, and independent adult.")}
                  </p>
                </div>

                <div style={{ padding: '28px', borderRadius: '16px', backgroundColor: charityTheme.bgSurface, border: `1px solid ${charityTheme.border}` }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: charityTheme.accentAmberLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <ShieldCheck size={22} color={charityTheme.accentAmber} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '8px', fontFamily: charityTheme.fontHeading }}>
                    {t("Full Accountability")}
                  </h3>
                  <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.6 }}>
                    {t("All donations are digitally tracked with official receipt issuance and government audit inspections.")}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ───────────────────────────────────────────────────────
            ABOUT US TAB CONTENT (Creative Authentic Showcase)
           ─────────────────────────────────────────────────────── */}
        {activeTab === 'about' && (
          <div style={{ animation: 'fadeIn 0.35s ease-out' }}>

            {/* Header Banner Showcase - Styled Authentic About Us Card */}
            <AboutHeroCard />

            {/* Redesigned Premium Historical Timeline & Gallery Showcase */}
            <HistoryTimelineCard />

            {/* Mission & Vision Creative Glowing Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
              {/* Mission */}
              <div style={{
                backgroundColor: charityTheme.bgCard,
                borderRadius: '24px',
                padding: '40px',
                border: `1px solid ${charityTheme.borderWarm}`,
                boxShadow: charityTheme.shadowCard
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  backgroundColor: charityTheme.primaryLight, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
                }}>
                  <Target size={28} color={charityTheme.primary} />
                </div>
                <h3 style={{ fontSize: '26px', fontWeight: 800, fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading, marginBottom: '14px' }}>
                  {t("Our Mission")}
                </h3>
                <p style={{ fontSize: '16px', color: charityTheme.textHeading, fontWeight: 600, lineHeight: 1.65, marginBottom: '16px' }}>
                  {t("“Our mission is to provide children with a safe, caring and supportive environment where they can grow, learn and develop with dignity.”")}
                </p>
                <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.7 }}>
                  {t("We aim to support education, health, skills, positive moral values, and work hand-in-hand with donors and well-wishers to support the children's needs.")}
                </p>
              </div>

              {/* Vision */}
              <div style={{
                backgroundColor: charityTheme.bgCard,
                borderRadius: '24px',
                padding: '40px',
                border: `1px solid rgba(16, 185, 129, 0.3)`,
                boxShadow: charityTheme.shadowCard
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  backgroundColor: charityTheme.accentGreenLight, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
                }}>
                  <Compass size={28} color={charityTheme.accentGreen} />
                </div>
                <h3 style={{ fontSize: '26px', fontWeight: 800, fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading, marginBottom: '14px' }}>
                  {t("Our Vision")}
                </h3>
                <p style={{ fontSize: '18px', color: charityTheme.accentGreen, fontWeight: 700, lineHeight: 1.65, marginBottom: '16px' }}>
                  {t("“To create a safe, caring and supportive environment where every child has the opportunity to learn, grow and build a better future.”")}
                </p>
                <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.7 }}>
                  {t("Creating an empowering environment where every child develops the confidence, knowledge, and life skills for their next stage of life.")}
                </p>
              </div>
            </div>

            {/* Our 6 Core Commitments Grid */}
            <div style={{
              backgroundColor: charityTheme.bgCard,
              borderRadius: '24px',
              padding: '48px',
              border: `1px solid ${charityTheme.borderWarm}`,
              boxShadow: charityTheme.shadowCard,
              marginBottom: '48px'
            }}>
              <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: charityTheme.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px'
                }}>
                  {t("Our Commitment to Children")}
                </div>
                <h2 style={{ fontSize: '36px', fontWeight: 800, fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading, marginBottom: '12px' }}>
                  {t("How We Support Each Child's Future")}
                </h2>
                <p style={{ color: charityTheme.textMuted, fontSize: '15px' }}>
                  {t("Children need more than basic care — they also need education, encouragement, emotional support, and talent development opportunities.")}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {[
                  { title: t('Safe & Supportive Living'), desc: t('Provide a safe and supportive living environment where children feel protected and valued.'), icon: ShieldCheck, color: charityTheme.primary, bg: charityTheme.primaryLight },
                  { title: t('Education & Personal Growth'), desc: t('Support formal schooling, books, tuition classes, and individual academic achievement.'), icon: BookOpen, color: charityTheme.accentGreen, bg: charityTheme.accentGreenLight },
                  { title: t('Health, Nutrition & Values'), desc: t('Promote good health, balanced nutrition, pediatric care, and positive moral values.'), icon: Apple, color: charityTheme.accentAmber, bg: charityTheme.accentAmberLight },
                  { title: t('Talent & Skill Development'), desc: t('Provide rich opportunities for children to discover and develop their unique talents.'), icon: Award, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
                  { title: t('Independent Adult Readiness'), desc: t('Encourage children to become responsible, confident, and independent members of society.'), icon: Trophy, color: charityTheme.accentRose, bg: charityTheme.accentRoseLight },
                  { title: t('Community & Donor Partnership'), desc: t('Work together with donors, volunteers, and well-wishers to support the children\'s everyday needs.'), icon: Users, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.12)' },
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '28px',
                        borderRadius: '16px',
                        backgroundColor: charityTheme.bgSurface,
                        border: `1px solid ${charityTheme.border}`,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = charityTheme.shadowHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        width: '46px', height: '46px', borderRadius: '12px',
                        backgroundColor: item.bg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', marginBottom: '16px'
                      }}>
                        <ItemIcon size={22} color={item.color} />
                      </div>
                      <h4 style={{ fontSize: '18px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '8px', fontFamily: charityTheme.fontHeading }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.6 }}>
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legal Empowerment & Statutory Authority Box */}
            <div style={{
              backgroundColor: charityTheme.sidebarNavy,
              color: '#ffffff',
              borderRadius: '24px',
              padding: '44px 48px',
              marginBottom: '48px',
              boxShadow: '0 15px 35px rgba(12, 50, 84, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '36px',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(241, 156, 56, 0.18)',
                  color: charityTheme.accentAmber,
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '16px'
                }}>
                  <Award size={15} />
                  <span>{t("Statutory Legal Authorization")}</span>
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: 800, fontFamily: charityTheme.fontHeading, marginBottom: '14px', color: '#ffffff' }}>
                  {t("Legal Empowerment under Act No. 30 of 2024")}
                </h3>
                <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#cbd5e1' }}>
                  {language === 'si' ? (
                    <><strong>කැළණිය බෞද්ධ කාන්තා පුණ්‍යායතනය</strong> වෙත <em>2024 අංක 30 දරන කැළණිය බෞද්ධ කාන්තා පුණ්‍යායතනය (සංස්ථාගත කිරීමේ) පනත</em> යටතේ සෙනෙහස දැරි සෙවණ වෙනුවෙන් බැංකු ගිණුම් පවත්වාගෙන යාමට සහ ළමුන් වෙනුවෙන් පරිත්‍යාග, ආධාර ලබා ගැනීමට ව්‍යවස්ථාපිත නීතිමය බලය හිමිව ඇත.</>
                  ) : (
                    <>The <strong>Kelaniya Buddhist Women's Charitable Society</strong> is statutory authorized under the <em>Kelaniya Buddhist Women's Charitable Society (Incorporation) Act, No. 30 of 2024</em> to maintain bank accounts on behalf of Senehasa Dari Sewana and accept monetary donations, gifts, and assistance for the children.</>
                  )}
                </p>
              </div>

              <button
                onClick={() => setShowCashModal(true)}
                style={{
                  backgroundColor: charityTheme.accentAmber,
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 6px 18px rgba(241, 156, 56, 0.35)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = charityTheme.accentAmber}
              >
                <HandCoins size={18} />
                <span>{t("Support the Centre")}</span>
              </button>
            </div>

            {/* Official Location & Hope for the Future Card */}
            <div style={{
              backgroundColor: charityTheme.bgCard,
              borderRadius: '24px',
              padding: '40px',
              border: `1px solid ${charityTheme.borderWarm}`,
              boxShadow: charityTheme.shadowCard
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '36px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: charityTheme.primary, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    {t("Institutional Directory Verification")}
                  </div>
                  <h3 style={{ fontSize: '26px', fontWeight: 800, fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading, marginBottom: '14px' }}>
                    {t("Where We Are")}
                  </h3>
                  <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.7, marginBottom: '20px' }}>
                    {language === 'si' ? (
                      <>ශ්‍රී ලංකා සෞඛ්‍ය අමාත්‍යාංශ නාමාවලියේ <strong>කිරිල්ලවල සෙනෙහස දැරි සෙවණ ළමා සංවර්ධන මධ්‍යස්ථානය (පුද්ගලික)</strong> ලෙස ලියාපදිංචි වී නේවාසික ළමා සුබසාධන සේවාවක් ලෙස වර්ගීකරණය කර ඇත.</>
                    ) : (
                      <>Listed in the Sri Lankan Ministry of Health directory as <strong>Kirillawala Senehasa Dari Sewana Child Development Centre (Private)</strong> and classified under residential child care services.</>
                    )}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: charityTheme.textHeading }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MapPin size={18} color={charityTheme.primary} />
                      <span><strong>{t("Address:")}</strong> {t("No. 307/16, Jaya Mawatha, Webada, Kirillawala, Sri Lanka")}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Phone size={18} color={charityTheme.accentGreen} />
                      <span><strong>{t("Telephone:")}</strong> 011 297 2129 (+94 11 297 2129)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Compass size={18} color={charityTheme.accentAmber} />
                      <span><strong>{t("Divisional Secretariat:")}</strong> {t("Mahara Divisional Secretariat Area")}</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '30px',
                  borderRadius: '18px',
                  backgroundColor: charityTheme.bgSurface,
                  border: `1px solid ${charityTheme.border}`,
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    backgroundColor: charityTheme.primaryLight, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                  }}>
                    <Heart size={28} color={charityTheme.primary} fill={charityTheme.primaryLight} />
                  </div>
                  <h4 style={{ fontSize: '20px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '10px', fontFamily: charityTheme.fontHeading }}>
                    {t("Our Hope for the Future")}
                  </h4>
                  <p style={{ fontSize: '13px', color: charityTheme.textBody, lineHeight: 1.65, margin: 0 }}>
                    {t("“We believe that every child deserves the opportunity to build a positive future. Through education, care, guidance and community support, Senehasa Dari Sewana strives to help children develop the confidence, knowledge and skills they need for the next stage of their lives.”")}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ───────────────────────────────────────────────────────
            FACILITIES TAB CONTENT
           ─────────────────────────────────────────────────────── */}
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
                {t('Holistic Child Care Environment')}
              </div>
              <h2 style={{ fontSize: '38px', fontWeight: 800, fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading, marginBottom: '12px' }}>
                {t('Six Pillars of Child Development')}
              </h2>
              <p style={{ color: charityTheme.textMuted, fontSize: '16px', lineHeight: 1.6 }}>
                {t('We structure child care across six developmental areas, offering safe spaces, modern study setups, and dedicated caregiver supervision.')}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {[
                { title: 'Education Support', icon: BookOpen, desc: 'Formal schooling enrollment, classroom setups, textbook distributions, and homework tutoring panels.', color: '#1d70b8', bg: charityTheme.primaryLight, image: '/education-support-facility.jpg' },
                { title: 'Tuition Classes', icon: FileText, desc: 'Supplemental academic coaching in Mathematics, Science, English, and IT skills to reinforce school performance.', color: '#10b981', bg: charityTheme.accentGreenLight, image: '/tuition-classes-facility.jpg' },
                { title: 'Extra-curricular Activities', icon: Award, desc: 'Debating societies, chess clubs, leadership circles, and scout groups to build life-readiness.', color: '#f19c38', bg: charityTheme.accentAmberLight, image: '/extracurricular-facility.jpg' },
                { title: 'Sport Activities', icon: Trophy, desc: 'Physical coordination, outdoor games, track sports, and matches to build teamwork and healthy habits.', color: '#e11d48', bg: charityTheme.accentRoseLight, image: '/sports-facility.jpg' },
                { title: 'Health & Nutrition', icon: Apple, desc: 'Balanced diet planning, fresh daily milk, pediatric checkups, and routine medicine distributions.', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.12)', image: '/health-nutrition-facility.jpg' },
                { title: 'Creative Arts & Music', icon: Palette, desc: 'Drama workshops, traditional dancing, watercolor painting, and musical instrument lessons.', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', image: '/creative-arts-facility.jpg' },
              ].map((fac, idx) => {
                const IconComponent = fac.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: charityTheme.bgCard,
                      borderRadius: '16px',
                      padding: '24px',
                      border: `1px solid ${charityTheme.borderWarm}`,
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column'
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
                    {fac.image && (
                      <div style={{
                        width: '100%',
                        height: '180px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginBottom: '20px',
                        border: `1px solid ${charityTheme.border}`,
                        position: 'relative'
                      }}>
                        <img
                          src={fac.image}
                          alt={t(fac.title)}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.92)',
                          backdropFilter: 'blur(6px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                          <IconComponent size={22} color={fac.color} />
                        </div>
                      </div>
                    )}

                    {!fac.image && (
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
                    )}

                    <h3 style={{ fontSize: '19px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '10px', fontFamily: charityTheme.fontHeading }}>
                      {t(fac.title)}
                    </h3>
                    <p style={{ fontSize: '14px', color: charityTheme.textBody, lineHeight: 1.65 }}>
                      {t(fac.desc)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div style={{
              marginTop: '48px',
              padding: '36px',
              borderRadius: '20px',
              backgroundColor: charityTheme.bgCard,
              border: `1px solid ${charityTheme.borderWarm}`,
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center',
              boxShadow: charityTheme.shadowCard
            }}>
              <div>
                <div style={{ fontSize: '40px', fontWeight: 800, color: charityTheme.primary, fontFamily: charityTheme.fontHeading }}>100%</div>
                <div style={{ fontSize: '13px', color: charityTheme.textMuted, marginTop: '4px', fontWeight: 600 }}>{t('School Enrollment')}</div>
              </div>
              <div style={{ width: '1px', backgroundColor: charityTheme.border }} />
              <div>
                <div style={{ fontSize: '40px', fontWeight: 800, color: charityTheme.accentGreen, fontFamily: charityTheme.fontHeading }}>{t('6 Pillars')}</div>
                <div style={{ fontSize: '13px', color: charityTheme.textMuted, marginTop: '4px', fontWeight: 600 }}>{t('Development Program')}</div>
              </div>
              <div style={{ width: '1px', backgroundColor: charityTheme.border }} />
              <div>
                <div style={{ fontSize: '40px', fontWeight: 800, color: charityTheme.accentAmber, fontFamily: charityTheme.fontHeading }}>{t('24 / 7')}</div>
                <div style={{ fontSize: '13px', color: charityTheme.textMuted, marginTop: '4px', fontWeight: 600 }}>{t('Continuous Care')}</div>
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────
            PROGRAMS TAB CONTENT
           ─────────────────────────────────────────────────────── */}
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
                {t('Community Initiatives')}
              </div>
              <h2 style={{ fontSize: '38px', fontWeight: 800, fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading }}>{t('Sponsorship Programs')}</h2>
              <p style={{ color: charityTheme.textMuted, marginTop: '6px', fontSize: '16px' }}>
                {t('Special initiatives that connect donors directly to child development outcomes.')}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {[
                {
                  title: 'Full Plates, Bright Futures Meal Program',
                  category: 'Nutrition & Development',
                  badge: '★ Featured Initiative',
                  badgeBg: 'rgba(241, 156, 56, 0.15)',
                  badgeColor: '#f19c38',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  borderColorHover: charityTheme.accentGreen,
                  shadowColor: 'rgba(16, 185, 129, 0.12)',
                  categoryBg: charityTheme.accentGreenLight,
                  categoryColor: charityTheme.accentGreen,
                  desc: 'Covers breakfast, lunch, and dinner bookings. Ensuring that children get high-protein nutritious meals every single day to support healthy development.',
                  image: '/full-plates-meal-program.jpg',
                  subpoints: [
                    {
                      title: 'Nutritious & Balanced Meals',
                      desc: 'High-protein, vitamin-rich balanced diet tailored for growing children.',
                      icon: Apple,
                      iconColor: charityTheme.accentGreen,
                      iconBg: charityTheme.accentGreenLight,
                    },
                    {
                      title: 'Better Health & Immunity',
                      desc: 'Boosts immune health, stamina, and overall physical wellness.',
                      icon: ShieldCheck,
                      iconColor: charityTheme.accentRose,
                      iconBg: charityTheme.accentRoseLight,
                    },
                    {
                      title: 'Focused Learning & Future',
                      desc: 'Sustained energy levels that improve classroom focus and study habits.',
                      icon: GraduationCap,
                      iconColor: charityTheme.accentAmber,
                      iconBg: charityTheme.accentAmberLight,
                    },
                    {
                      title: 'Full Daily Meal Coverage',
                      desc: 'Complete meal slots covering Breakfast, Lunch, and Dinner.',
                      icon: UtensilsCrossed,
                      iconColor: charityTheme.primary,
                      iconBg: charityTheme.primaryLight,
                    },
                  ]
                },
                {
                  title: 'Sinhala & Tamil New Year Celebration Program',
                  category: 'Cultural Heritage',
                  badge: 'Festive Annual Tradition',
                  badgeBg: 'rgba(241, 156, 56, 0.15)',
                  badgeColor: '#f19c38',
                  borderColor: 'rgba(241, 156, 56, 0.3)',
                  borderColorHover: charityTheme.accentAmber,
                  shadowColor: 'rgba(241, 156, 56, 0.12)',
                  categoryBg: charityTheme.accentAmberLight,
                  categoryColor: charityTheme.accentAmber,
                  desc: 'Organizes traditional games, sweetmeat distributions, cultural rituals, and new clothes gifting for all children during the national cultural festivity.',
                  image: '/new-year-celebration.jpg',
                  subpoints: [
                    {
                      title: 'New Clothes & Festive Wear',
                      desc: 'Gifting brand new traditional clothing to every child for the new year festival.',
                      icon: Heart,
                      iconColor: charityTheme.accentRose,
                      iconBg: charityTheme.accentRoseLight,
                    },
                    {
                      title: 'Traditional Games & Competitions',
                      desc: 'Avurudu games, sports competitions, and celebratory cultural activities.',
                      icon: Trophy,
                      iconColor: charityTheme.accentAmber,
                      iconBg: charityTheme.accentAmberLight,
                    },
                    {
                      title: 'Festive Sweetmeat Feast',
                      desc: 'Traditional Kevum, Kokis, Aluwa, and celebratory milk-rice feast.',
                      icon: Utensils,
                      iconColor: charityTheme.accentGreen,
                      iconBg: charityTheme.accentGreenLight,
                    },
                    {
                      title: 'Cultural Heritage & Unity',
                      desc: 'Fostering cultural values, harmony, and togetherness among all kids.',
                      icon: Users,
                      iconColor: charityTheme.primary,
                      iconBg: charityTheme.primaryLight,
                    },
                  ]
                },
                {
                  title: 'Children\'s Day Celebration Program',
                  category: 'Social & Youth Event',
                  badge: 'Annual Milestone Event',
                  badgeBg: 'rgba(139, 92, 246, 0.15)',
                  badgeColor: '#8b5cf6',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  borderColorHover: '#8b5cf6',
                  shadowColor: 'rgba(139, 92, 246, 0.12)',
                  categoryBg: 'rgba(139, 92, 246, 0.12)',
                  categoryColor: '#8b5cf6',
                  desc: 'A dedicated day of magic shows, talent displays, carnival food, interactive games, and personalized gifts to let every child feel loved and celebrated.',
                  image: '/childrens-day-celebration.jpg',
                  subpoints: [
                    {
                      title: 'Talent & Showcase Stage',
                      desc: 'Platform for children to dance, sing, draw, and share their unique talents.',
                      icon: Award,
                      iconColor: '#8b5cf6',
                      iconBg: 'rgba(139, 92, 246, 0.12)',
                    },
                    {
                      title: 'Interactive Games & Fun',
                      desc: 'Carnival games, magic performances, and outdoor entertainment.',
                      icon: Compass,
                      iconColor: charityTheme.accentAmber,
                      iconBg: charityTheme.accentAmberLight,
                    },
                    {
                      title: 'Special Treats & Refreshments',
                      desc: 'Celebratory party meals, ice cream, cakes, and festive snacks.',
                      icon: Apple,
                      iconColor: charityTheme.accentGreen,
                      iconBg: charityTheme.accentGreenLight,
                    },
                    {
                      title: 'Personalized Gift Packages',
                      desc: 'Toys, storybooks, and customized gift bags presented to each child.',
                      icon: HandCoins,
                      iconColor: charityTheme.primary,
                      iconBg: charityTheme.primaryLight,
                    },
                  ]
                },
                {
                  title: 'Scholarship & School Supplies Support Program',
                  category: 'Education Support',
                  badge: 'High-Impact Initiative',
                  badgeBg: charityTheme.primaryLight,
                  badgeColor: charityTheme.primary,
                  borderColor: 'rgba(29, 112, 184, 0.3)',
                  borderColorHover: charityTheme.primary,
                  shadowColor: 'rgba(29, 112, 184, 0.12)',
                  categoryBg: charityTheme.primaryLight,
                  categoryColor: charityTheme.primary,
                  desc: 'Provides comprehensive schooling support including textbooks, backpacks, stationery kits, school uniforms, and scholarship funding prior to academic terms.',
                  image: '/scholarship-school-supplies.jpg',
                  subpoints: [
                    {
                      title: 'Textbooks & Supply Kits',
                      desc: 'Essential exercise books, pens, drawing sets, and subject textbooks.',
                      icon: BookOpen,
                      iconColor: charityTheme.primary,
                      iconBg: charityTheme.primaryLight,
                    },
                    {
                      title: 'School Uniforms & Shoes',
                      desc: 'Tailored uniforms, school shoes, socks, and sports kits for all grades.',
                      icon: ShieldCheck,
                      iconColor: charityTheme.accentGreen,
                      iconBg: charityTheme.accentGreenLight,
                    },
                    {
                      title: 'Tuition & Exam Assistance',
                      desc: 'Financial sponsorship for higher grade tuition classes and exam fees.',
                      icon: GraduationCap,
                      iconColor: charityTheme.accentAmber,
                      iconBg: charityTheme.accentAmberLight,
                    },
                    {
                      title: 'Academic Mentorship',
                      desc: 'Regular progress tracking, tutoring panels, and educational guidance.',
                      icon: Target,
                      iconColor: charityTheme.accentRose,
                      iconBg: charityTheme.accentRoseLight,
                    },
                  ]
                },
                {
                  title: 'Child Health & Wellness Programme',
                  category: 'Medical Care',
                  badge: 'Essential Protection',
                  badgeBg: charityTheme.accentRoseLight,
                  badgeColor: charityTheme.accentRose,
                  borderColor: 'rgba(225, 29, 72, 0.3)',
                  borderColorHover: charityTheme.accentRose,
                  shadowColor: 'rgba(225, 29, 72, 0.12)',
                  categoryBg: charityTheme.accentRoseLight,
                  categoryColor: charityTheme.accentRose,
                  desc: 'Annual comprehensive pediatric and dental health screenings, eye tests, vitamin updates, routine vaccinations, and emergency medical protection.',
                  image: '/child-health-wellness.jpg',
                  subpoints: [
                    {
                      title: 'Pediatric & Dental Checkups',
                      desc: 'Comprehensive medical exams and dental care by specialist doctors.',
                      icon: ShieldCheck,
                      iconColor: charityTheme.accentRose,
                      iconBg: charityTheme.accentRoseLight,
                    },
                    {
                      title: 'Vitamins & Immunity Boosters',
                      desc: 'Daily multivitamin supplies, nutrition supplements, and milk nutrition.',
                      icon: Apple,
                      iconColor: charityTheme.accentGreen,
                      iconBg: charityTheme.accentGreenLight,
                    },
                    {
                      title: 'Vision & Eye Screening',
                      desc: 'Routine eye testing, prescription eyeglasses, and vision correction.',
                      icon: Compass,
                      iconColor: charityTheme.primary,
                      iconBg: charityTheme.primaryLight,
                    },
                    {
                      title: 'Emergency Medical Care',
                      desc: '24/7 emergency medical fund and immediate hospital care readiness.',
                      icon: Heart,
                      iconColor: charityTheme.accentAmber,
                      iconBg: charityTheme.accentAmberLight,
                    },
                  ]
                }
              ].map((prog, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: charityTheme.bgCard,
                    borderRadius: '24px',
                    padding: '36px',
                    border: `1px solid ${prog.borderColor}`,
                    display: 'grid',
                    gridTemplateColumns: '1fr 340px',
                    gap: '36px',
                    alignItems: 'center',
                    boxShadow: `0 12px 32px -8px ${prog.shadowColor}`,
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = prog.borderColorHover;
                    e.currentTarget.style.boxShadow = charityTheme.shadowHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = prog.borderColor;
                    e.currentTarget.style.boxShadow = `0 12px 32px -8px ${prog.shadowColor}`;
                  }}
                >
                  {/* Left Side: Detailed Perfectly Aligned Text */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <span style={{
                        padding: '5px 14px',
                        borderRadius: '30px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: prog.categoryBg,
                        color: prog.categoryColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em'
                      }}>
                        {t(prog.category)}
                      </span>
                      {prog.badge && (
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '30px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: prog.badgeBg,
                          color: prog.badgeColor,
                          letterSpacing: '0.04em'
                        }}>
                          {t(prog.badge)}
                        </span>
                      )}
                    </div>

                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: 800,
                      color: charityTheme.textHeading,
                      marginBottom: '12px',
                      fontFamily: charityTheme.fontHeading,
                      lineHeight: 1.25,
                      letterSpacing: '-0.01em'
                    }}>
                      {t(prog.title)}
                    </h3>

                    <p style={{
                      fontSize: '15px',
                      color: charityTheme.textBody,
                      lineHeight: 1.7,
                      marginBottom: '24px'
                    }}>
                      {t(prog.desc)}
                    </p>

                    {/* Detailed Feature Items Aligned in 2x2 Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px'
                    }}>
                      {prog.subpoints.map((sub, sIdx) => {
                        const SubIcon = sub.icon;
                        return (
                          <div
                            key={sIdx}
                            style={{
                              backgroundColor: charityTheme.bgSurface,
                              padding: '14px 16px',
                              borderRadius: '12px',
                              border: `1px solid ${charityTheme.border}`,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px'
                            }}
                          >
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '8px',
                              backgroundColor: sub.iconBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <SubIcon size={18} color={sub.iconColor} />
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: charityTheme.textHeading, marginBottom: '2px' }}>
                                {t(sub.title)}
                              </div>
                              <div style={{ fontSize: '12px', color: charityTheme.textMuted, lineHeight: 1.45 }}>
                                {t(sub.desc)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Side: Perfectly Aligned Photo Poster Box */}
                  <div style={{
                    width: '340px',
                    height: '440px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.1)',
                    border: `1px solid ${charityTheme.borderWarm}`,
                    backgroundColor: '#ffffff',
                    position: 'relative'
                  }}>
                    <img
                      src={prog.image}
                      alt={`${t(prog.title)} Poster`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────
            CONTACT TAB CONTENT
           ─────────────────────────────────────────────────────── */}
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
                  {t('Direct Assistance')}
                </div>
                <h2 style={{ fontSize: '38px', fontWeight: 800, fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading, marginBottom: '16px' }}>
                  {t('Contact Us')}
                </h2>
                <p style={{ color: charityTheme.textBody, fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
                  {t('Have questions about monetary donations, visiting procedures, or meal scheduling? Send us a message and our coordinator team will respond within 24 hours.')}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex', gap: '16px', alignItems: 'center', padding: '16px',
                    backgroundColor: charityTheme.bgCard, borderRadius: '14px', border: `1px solid ${charityTheme.borderWarm}`
                  }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: charityTheme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin size={20} color={charityTheme.primary} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: charityTheme.textMuted, fontWeight: 600 }}>{t('Sanctuary Address (Mahara DS Area)')}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: charityTheme.textHeading, marginTop: '2px' }}>No. 307/16, Jaya Mawatha, Webada, Kirillawala, Sri Lanka</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', gap: '16px', alignItems: 'center', padding: '16px',
                    backgroundColor: charityTheme.bgCard, borderRadius: '14px', border: `1px solid ${charityTheme.borderWarm}`
                  }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: charityTheme.accentGreenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Phone size={20} color={charityTheme.accentGreen} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: charityTheme.textMuted, fontWeight: 600 }}>{t('Telephone Contact')}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: charityTheme.textHeading, marginTop: '2px' }}>011 297 2129 (+94 11 297 2129)</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', gap: '16px', alignItems: 'center', padding: '16px',
                    backgroundColor: charityTheme.bgCard, borderRadius: '14px', border: `1px solid ${charityTheme.borderWarm}`
                  }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: charityTheme.accentAmberLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Mail size={20} color={charityTheme.accentAmber} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: charityTheme.textMuted, fontWeight: 600 }}>{t('Official Email')}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: charityTheme.textHeading, marginTop: '2px' }}>info@senehasadarisewana.org</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', gap: '16px', alignItems: 'center', padding: '16px',
                    backgroundColor: charityTheme.bgCard, borderRadius: '14px', border: `1px solid ${charityTheme.borderWarm}`
                  }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: charityTheme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Clock size={20} color={charityTheme.primary} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: charityTheme.textMuted, fontWeight: 600 }}>{t('Sponsor Visiting Hours')}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: charityTheme.textHeading, marginTop: '2px' }}>{t('09:00 AM - 05:00 PM (Prior Appointment)')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Card with Instant Real-Time Validation */}
              <div style={{
                backgroundColor: charityTheme.bgCard,
                borderRadius: '20px',
                padding: '36px',
                border: `1px solid ${charityTheme.borderWarm}`,
                boxShadow: charityTheme.shadowCard
              }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px', fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading }}>
                  {t('Send Us a Message')}
                </h3>
                <p style={{ fontSize: '13px', color: charityTheme.textMuted, marginBottom: '24px' }}>
                  {t('Fill in the details below and our coordinator team will be in touch shortly.')}
                </p>

                {contactSuccess ? (
                  <div style={{
                    padding: '28px',
                    textAlign: 'center',
                    backgroundColor: charityTheme.accentGreenLight,
                    border: `1px solid rgba(16, 185, 129, 0.3)`,
                    borderRadius: '14px',
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
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                    }}>
                      <Check size={26} color={charityTheme.accentGreen} />
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{t('Message Submitted!')}</h4>
                    <p style={{ fontSize: '13px', color: charityTheme.textBody }}>{t('Thank you for reaching out. Our coordinator will review your note and respond promptly.')}</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textBody, marginBottom: '6px' }}>{t('First Name *')}</label>
                        <input
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: '10px',
                            border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                            color: charityTheme.textHeading, fontSize: '14px', boxSizing: 'border-box'
                          }}
                          placeholder={t('First Name')}
                          value={contactForm.firstName}
                          onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textBody, marginBottom: '6px' }}>{t('Last Name *')}</label>
                        <input
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: '10px',
                            border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                            color: charityTheme.textHeading, fontSize: '14px', boxSizing: 'border-box'
                          }}
                          placeholder={t('Last Name')}
                          value={contactForm.lastName}
                          onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textBody, marginBottom: '6px' }}>{t('Email Address *')}</label>
                      <input
                        type="email"
                        style={{
                          width: '100%', padding: '11px 14px', borderRadius: '10px',
                          border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                          color: charityTheme.textHeading, fontSize: '14px', boxSizing: 'border-box'
                        }}
                        placeholder="your.email@example.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textBody, marginBottom: '6px' }}>{t('Phone Number (Optional)')}</label>
                      <input
                        style={{
                          width: '100%', padding: '11px 14px', borderRadius: '10px',
                          border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                          color: charityTheme.textHeading, fontSize: '14px', boxSizing: 'border-box'
                        }}
                        placeholder="+94 77 123 4567"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textBody, marginBottom: '6px' }}>{t('Message *')}</label>
                      <textarea
                        style={{
                          width: '100%', padding: '11px 14px', borderRadius: '10px',
                          border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                          color: charityTheme.textHeading, fontSize: '14px', minHeight: '110px',
                          resize: 'vertical', boxSizing: 'border-box'
                        }}
                        placeholder={t('How can we assist you?')}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={contactLoading}
                      style={{
                        width: '100%',
                        backgroundColor: charityTheme.primary,
                        color: '#ffffff',
                        border: 'none',
                        padding: '13px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '15px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        boxShadow: '0 4px 14px rgba(29, 112, 184, 0.25)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = charityTheme.primaryDark}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = charityTheme.primary}
                    >
                      {contactLoading ? t('Sending Message...') : t('Send Message')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────
            SUPPORT US / DONATE TAB CONTENT
           ─────────────────────────────────────────────────────── */}
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
                {t('Direct Support Pathways')}
              </div>
              <h2 style={{ fontSize: '38px', fontWeight: 800, fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading, marginBottom: '12px' }}>
                {t('Choose How You Wish to Support')}
              </h2>
              <p style={{ color: charityTheme.textMuted, fontSize: '16px', lineHeight: 1.6 }}>
                {t('Make a tangible difference through direct financial contributions or sponsoring warm, nutritious daily meals for our 50+ children.')}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto 48px' }}>
              {/* Option 1: Cash Donation */}
              <div style={{
                backgroundColor: charityTheme.bgCard,
                borderRadius: '20px',
                padding: '32px',
                border: `1px solid ${charityTheme.borderWarm}`,
                boxShadow: charityTheme.shadowCard,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  width: '100%',
                  height: '220px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  border: `1px solid ${charityTheme.border}`,
                  position: 'relative'
                }}>
                  <img
                    src="/financial-gift.jpg"
                    alt={t('Donate Funds')}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <HandCoins size={24} color={charityTheme.primary} />
                  </div>
                </div>

                <h3 style={{ fontSize: '24px', fontWeight: 700, fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading, marginBottom: '10px' }}>
                  {t('Donate Funds')}
                </h3>

                <p style={{ color: charityTheme.textBody, fontSize: '14px', lineHeight: 1.65, marginBottom: '24px', flex: 1 }}>
                  {t("Support general sanctuary operations, healthcare checkups, textbooks, uniform kits, caregiver stipends, and children's recreational activities. Instant online card checkout or bank deposit.")}
                </p>

                <div style={{ borderTop: `1px solid ${charityTheme.border}`, paddingTop: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: charityTheme.textBody }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color={charityTheme.accentGreen} />
                      <span>{t('Instant official digital receipt')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color={charityTheme.accentGreen} />
                      <span>{t('Secure card checkout via Stripe or bank transfer')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color={charityTheme.accentGreen} />
                      <span>{t('100% directly allocated to child welfare')}</span>
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
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(29, 112, 184, 0.25)',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = charityTheme.primaryDark}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = charityTheme.primary}
                >
                  <HandCoins size={18} />
                  <span>{t('Proceed to Cash Donation')}</span>
                </button>
              </div>

              {/* Option 2: Meal Booking */}
              <div style={{
                backgroundColor: charityTheme.bgCard,
                borderRadius: '20px',
                padding: '32px',
                border: `1px solid rgba(16, 185, 129, 0.25)`,
                boxShadow: charityTheme.shadowCard,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  width: '100%',
                  height: '220px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  border: `1px solid ${charityTheme.border}`,
                  position: 'relative'
                }}>
                  <img
                    src="/sponsor-meal.jpg"
                    alt={t('Sponsor a Meal')}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <UtensilsCrossed size={24} color={charityTheme.accentGreen} />
                  </div>
                </div>

                <h3 style={{ fontSize: '24px', fontWeight: 700, fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading, marginBottom: '10px' }}>
                  {t('Sponsor a Meal')}
                </h3>

                <p style={{ color: charityTheme.textBody, fontSize: '14px', lineHeight: 1.65, marginBottom: '24px', flex: 1 }}>
                  {t('Celebrate birthdays, family anniversaries, or memorial days by sponsoring a full warm nutritious meal (Breakfast, Lunch, or Dinner) for all 50+ children residing at the sanctuary.')}
                </p>

                <div style={{ borderTop: `1px solid ${charityTheme.border}`, paddingTop: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: charityTheme.textBody }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color={charityTheme.accentGreen} />
                      <span>{t('Live interactive booking calendar')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color={charityTheme.accentGreen} />
                      <span>{t('Fresh wholesome meals prepared for all resident children')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color={charityTheme.accentGreen} />
                      <span>{t('Guaranteed nutrition for all children & instant confirmation')}</span>
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
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = charityTheme.accentGreen}
                >
                  <UtensilsCrossed size={18} />
                  <span>{t('Open Meal Booking Calendar')}</span>
                </button>
              </div>
            </div>

            {/* Direct Bank Wire Transparency Card */}
            <div style={{
              backgroundColor: charityTheme.bgCard,
              borderRadius: '16px',
              padding: '28px 32px',
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
                  width: '46px', height: '46px', borderRadius: '12px',
                  backgroundColor: charityTheme.accentAmberLight, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Landmark size={22} color={charityTheme.accentAmber} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: charityTheme.textHeading }}>{t('Direct Bank Wire Account Details')}</div>
                  <div style={{ fontSize: '13px', color: charityTheme.textMuted }}>Commercial Bank of Ceylon &bull; A/C: <strong style={{ color: charityTheme.textHeading }}>800-459-2104</strong> &bull; Branch: Kollupitiya</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setCashForm(prev => ({ ...prev, paymentMethod: 'bank_transfer' }));
                  setShowCashModal(true);
                }}
                style={{
                  backgroundColor: charityTheme.bgSurface,
                  color: charityTheme.textHeading,
                  border: `1px solid ${charityTheme.border}`,
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {t('Upload Transfer Slip')}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ═══════════════════════════════════════════════════════
          4. FOOTER (Memorability & Trust)
         ═══════════════════════════════════════════════════════ */}
      <footer style={{
        backgroundColor: charityTheme.sidebarNavy,
        color: '#94a3b8',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '56px',
        paddingBottom: '32px',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr', gap: '40px', marginBottom: '48px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <img src="/logo-icon.png" alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: charityTheme.fontHeading, color: '#ffffff' }}>
                  Senehasa Dari Sewana
                </span>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#cbd5e1', marginBottom: '16px' }}>
                {t("Kirillawala Senehasa Dari Sewana Child Development Centre is a registered residential sanctuary managed by the Kelaniya Buddhist Women's Charitable Society.")}
              </p>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {t('Incorporation Act:')} <strong style={{ color: '#ffffff' }}>{t('Act No. 30 of 2024')}</strong>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>{t('Quick Links')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <span onClick={() => { setActiveTab('home'); window.scrollTo(0, 0); }} style={{ cursor: 'pointer', color: '#cbd5e1' }}>{t('About Our Sanctuary')}</span>
                <span onClick={() => { setActiveTab('facilities'); window.scrollTo(0, 0); }} style={{ cursor: 'pointer', color: '#cbd5e1' }}>{t('Six Developmental Pillars')}</span>
                <span onClick={() => { setActiveTab('programs'); window.scrollTo(0, 0); }} style={{ cursor: 'pointer', color: '#cbd5e1' }}>{t('Welfare Programs')}</span>
                <span onClick={() => { setActiveTab('donate'); window.scrollTo(0, 0); }} style={{ cursor: 'pointer', color: '#cbd5e1' }}>{t('Donate & Support')}</span>
                <span onClick={() => { setActiveTab('contact'); window.scrollTo(0, 0); }} style={{ cursor: 'pointer', color: '#cbd5e1' }}>{t('Contact Coordinators')}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>{t('Ways to Help')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <span onClick={() => setShowCashModal(true)} style={{ cursor: 'pointer', color: '#cbd5e1' }}>{t('Direct Monetary Gift')}</span>
                <span onClick={() => setShowMealModal(true)} style={{ cursor: 'pointer', color: '#cbd5e1' }}>{t('Sponsor a Daily Meal')}</span>
                <span onClick={() => { setActiveTab('programs'); window.scrollTo(0, 0); }} style={{ cursor: 'pointer', color: '#cbd5e1' }}>{t('Scholarship & Books Fund')}</span>
                <span onClick={() => { setActiveTab('programs'); window.scrollTo(0, 0); }} style={{ cursor: 'pointer', color: '#cbd5e1' }}>{t('Health & Pediatric Care')}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>{t('Sanctuary Address')}</div>
              <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>No. 307/16, Jaya Mawatha, Webada, Kirillawala, Sri Lanka</div>
                <div>Phone: 011 297 2129 (+94 11 297 2129)</div>
                <div>Email: info@senehasadarisewana.org</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: charityTheme.accentAmber }}>
                  {t('Divisional Secretariat: Mahara')}
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
              &copy; {new Date().getFullYear()} Senehasa Dari Sewana Child Sanctuary. {t('All rights reserved.')}
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>{t('Non-Profit Protection Center')}</span>
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
                <Lock size={12} />
                <span>{t('Authorized Staff Login')}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════
          5. CASH DONATION MODAL (Efficiency & Error Prevention)
         ═══════════════════════════════════════════════════════ */}
      {showCashModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
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
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading }}>
                  {t("Make a Financial Contribution")}
                </h2>
                <p style={{ fontSize: '13px', color: charityTheme.textMuted, margin: '4px 0 0' }}>
                  {t("Every rupee directly supports the daily nourishment, healthcare, education, and sanctuary for our 50+ resident children.")}
                </p>
              </div>
              <ModalCloseButton onClick={() => setShowCashModal(false)} />
            </div>

            {cashSuccess ? (
              <div style={{
                padding: '36px 24px',
                textAlign: 'center',
                backgroundColor: charityTheme.accentGreenLight,
                border: `1px solid rgba(16, 185, 129, 0.3)`,
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
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                }}>
                  <Check size={28} color={charityTheme.accentGreen} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px', color: charityTheme.textHeading }}>
                  {t("Thank You for Your Generosity!", "Thank You for Your Generous Heart!")}
                </h3>
                <p style={{ fontSize: '14px', color: charityTheme.textBody }}>
                  {language === 'si'
                    ? `ඔබගේ රු. ${Number(donatedAmount).toLocaleString()} ක පරිත්‍යාගය ළමුන්ගේ දෛනික පෝෂණය හා සංවර්ධනයට සෘජුවම උපකාරී වේ. ඩිජිටල් රිසිට්පත පද්ධතියේ සටහන් කර ඇත.`
                    : `Your contribution of LKR ${Number(donatedAmount).toLocaleString()} provides vital support to the children. An official digital receipt is recorded in the system.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleCashSubmit}>
                {/* Amount presets for Efficiency */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '8px' }}>
                    {t("Select Donation Amount", "Select Amount (LKR)")}
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
                    <span style={{ position: 'absolute', left: '14px', top: '11px', fontSize: '13px', fontWeight: 700, color: charityTheme.textMuted }}>
                      LKR
                    </span>
                    <input
                      type="text"
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 48px',
                        borderRadius: '10px',
                        border: `1px solid ${charityTheme.border}`,
                        backgroundColor: '#ffffff',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: charityTheme.textHeading,
                        boxSizing: 'border-box'
                      }}
                      placeholder={t("Or Enter Custom Amount (LKR)", "Custom amount (e.g. 10,000)")}
                      value={cashForm.amount}
                      onChange={(e) => setCashForm({ ...cashForm, amount: formatWithCommas(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '8px' }}>
                    {t("Payment Method", "Select Payment Method")}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { id: 'online', labelKey: 'Card / Online (Stripe)', defaultLabel: 'Card Payment (Stripe)', icon: CreditCard },
                      { id: 'bank_transfer', labelKey: 'Bank Transfer Deposit', defaultLabel: 'Bank Transfer Slip', icon: Landmark }
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
                          <span>{t(method.labelKey, method.defaultLabel)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stripe Secure Info Box */}
                {cashForm.paymentMethod === 'online' && (
                  <div style={{
                    padding: '14px 16px',
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
                      {t("You will be securely redirected to Stripe's 256-bit encrypted checkout page.")}
                    </div>
                  </div>
                )}

                {/* Bank Transfer Upload Box (Error Prevention Check) */}
                {cashForm.paymentMethod === 'bank_transfer' && (
                  <div style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: charityTheme.bgSurface,
                    border: `1px solid ${charityTheme.border}`,
                    marginBottom: '18px'
                  }}>
                    <div style={{ fontSize: '12px', color: charityTheme.textHeading, fontWeight: 700, marginBottom: '6px' }}>
                      {t("Bank Transfer Account Details:")}
                    </div>
                    <div style={{ fontSize: '12px', color: charityTheme.textMuted, lineHeight: 1.6, marginBottom: '12px' }}>
                      {t("Bank Name")}: <strong>{t("Commercial Bank of Ceylon")}</strong><br />
                      {t("Account Name")}: <strong>{t("Senehasa Dari Sewana Foundation")}</strong><br />
                      {t("Account Number")}: <strong>800-459-2104</strong> &bull; {t("Branch")}: {t("Kollupitiya")}
                    </div>

                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: charityTheme.textBody, marginBottom: '6px' }}>
                      {t("Upload Deposit Receipt (Image or PDF) *")}
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
                          {t("Remove Photo", "Remove")}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Donor Contact Details */}
                <div style={{ borderTop: `1px solid ${charityTheme.border}`, paddingTop: '16px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '4px' }}>
                      {t("Full Name *", "Your full name *")}
                    </label>
                    <input
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                        fontSize: '13px', color: charityTheme.textHeading, boxSizing: 'border-box'
                      }}
                      placeholder={t("e.g. Priyantha Silva")}
                      value={cashForm.name}
                      onChange={(e) => setCashForm({ ...cashForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '4px' }}>
                        {t("Email Address *", "Email address *")}
                      </label>
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
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '4px' }}>
                        {t("Contact Number", "Mobile phone number for SMS confirmation")}
                      </label>
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '4px' }}>
                      {t("Donor Type")}
                    </label>
                    <select
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                        fontSize: '13px', color: charityTheme.textHeading, boxSizing: 'border-box'
                      }}
                      value={cashForm.type}
                      onChange={(e) => setCashForm({ ...cashForm, type: e.target.value })}
                    >
                      <option value="individual">{t("Individual Donor")}</option>
                      <option value="organization">{t("Corporate / NGO Partner")}</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '4px' }}>
                      {t("Dedication or Notes (Optional)")}
                    </label>
                    <textarea
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: '8px',
                        border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                        fontSize: '13px', color: charityTheme.textHeading, minHeight: '60px',
                        resize: 'vertical', boxSizing: 'border-box'
                      }}
                      placeholder={t("e.g. In memory of family, birthday celebration")}
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
                    {t("Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={cashLoading}
                    style={{
                      padding: '10px 24px', borderRadius: '10px',
                      backgroundColor: charityTheme.primary, color: '#ffffff',
                      border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      boxShadow: '0 4px 12px rgba(29, 112, 184, 0.25)'
                    }}
                  >
                    {cashLoading ? t("Processing Contribution...") : t("Confirm Donation")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          6. MEAL BOOKING MODAL (Efficiency & Interactive Calendar)
         ═══════════════════════════════════════════════════════ */}
      {showMealModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
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
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, fontFamily: charityTheme.fontHeading, color: charityTheme.textHeading }}>
                  {t("Sponsor a Nutritious Meal")}
                </h2>
                <p style={{ fontSize: '13px', color: charityTheme.textMuted, margin: '4px 0 0' }}>
                  {t("Select an available date on the calendar to reserve Breakfast, Lunch, or Dinner for our 50+ children.")}
                </p>
              </div>
              <ModalCloseButton onClick={() => setShowMealModal(false)} />
            </div>

            {mealSuccess ? (
              <div style={{
                padding: '40px 24px',
                textAlign: 'center',
                backgroundColor: charityTheme.accentGreenLight,
                border: `1px solid rgba(16, 185, 129, 0.3)`,
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
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                }}>
                  <Check size={30} color={charityTheme.accentGreen} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px', color: charityTheme.textHeading }}>
                  {t("Meal Sponsorship Scheduled!")}
                </h3>
                <p style={{ fontSize: '14px', color: charityTheme.textBody, maxWidth: '600px', margin: '0 auto 12px', lineHeight: 1.6 }}>
                  {language === 'si'
                    ? `ඔබ ${mealForm.mealDate || 'තෝරාගත් දිනය'} දින ${t(mealForm.mealType)} ආහාර වේල වෙන්කරවා ගනිමින් රු. ${Number(bookedAdvanceAmount).toLocaleString()} ක ආපසු ගෙවනු ලබන තහවුරු තැන්පතුව සාර්ථකව ගෙවා ඇත. ඔබ මධ්‍යස්ථානය වෙත පැමිණ ආහාර පරිත්‍යාග කළ පසු මෙම තැන්පතු මුදල සම්පූර්ණයෙන්ම ඔබට ආපසු ගෙවනු ලැබේ. ක්ෂණික SMS තහවුරු කිරීමක් ඔබ වෙත යොමු කරන ලදී.`
                    : `Your ${mealForm.mealType} meal reservation on ${mealForm.mealDate || 'selected date'} is confirmed! A refundable confirmation deposit of LKR ${Number(bookedAdvanceAmount).toLocaleString()} was received. When you arrive at the orphanage and donate the meal, this deposit will be 100% refunded to you. An instant SMS confirmation has been dispatched.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleMealSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.15fr', gap: '28px', alignItems: 'start' }}>

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
                      <span style={{ fontWeight: 700, fontSize: '15px', color: charityTheme.textHeading, fontFamily: charityTheme.fontHeading }}>
                        {t(monthNames[currentMonth])} {currentYear}
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
                      {[
                        { en: 'Su', key: 'Sun' },
                        { en: 'Mo', key: 'Mon' },
                        { en: 'Tu', key: 'Tue' },
                        { en: 'We', key: 'Wed' },
                        { en: 'Th', key: 'Thu' },
                        { en: 'Fr', key: 'Fri' },
                        { en: 'Sa', key: 'Sat' }
                      ].map(d => (
                        <div key={d.en} style={{ fontSize: '11px', fontWeight: 700, color: charityTheme.textMuted, textTransform: 'uppercase' }}>
                          {language === 'si' ? t(d.key).substring(0, 3) : d.en}
                        </div>
                      ))}
                    </div>

                    {calendarLoading ? (
                      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: charityTheme.textMuted, fontSize: '13px' }}>
                        {t("Checking meal slot availability...")}
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
                                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: breakfastBooked ? '#ef4444' : '#10b981' }} title={t("Breakfast")} />
                                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: lunchBooked ? '#ef4444' : '#10b981' }} title={t("Lunch")} />
                                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: dinnerBooked ? '#ef4444' : '#10b981' }} title={t("Dinner")} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: charityTheme.textMuted }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }} /> {t("Available")}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> {t("Sponsored")}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '9px', height: '9px', borderRadius: '2px', backgroundColor: charityTheme.primary }} /> {t("Selected")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Slot Selection, Advance Payment & Details */}
                  <div>
                    {!mealForm.mealDate ? (
                      <div style={{ textAlign: 'center', padding: '48px 20px', color: charityTheme.textMuted }}>
                        <Calendar size={44} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <h4 style={{ margin: '0 0 6px', color: charityTheme.textHeading, fontFamily: charityTheme.fontHeading }}>
                          {t("No Date Selected")}
                        </h4>
                        <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
                          {t("Please click an open date on the calendar to select Breakfast, Lunch, or Dinner.")}
                        </p>
                      </div>
                    ) : (
                      <div>
                        {/* Selected Date Notice */}
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ fontSize: '11px', color: charityTheme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                            {t("Selected Date")}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: charityTheme.primary, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <Calendar size={15} />
                            {new Date(mealForm.mealDate).toLocaleDateString(language === 'si' ? 'si-LK' : undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>

                        {/* Choose Meal Slot */}
                        <div style={{ marginBottom: '14px' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '6px' }}>
                            {t("Choose Meal Slot")}
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
                                      padding: '10px 6px', borderRadius: '8px', border: `1px solid ${charityTheme.border}`,
                                      backgroundColor: charityTheme.bgSurface, textAlign: 'center', fontSize: '11px',
                                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', opacity: 0.8
                                    }}
                                  >
                                    <Lock size={12} color="#ef4444" />
                                    <span style={{ textTransform: 'capitalize', fontWeight: 600, color: charityTheme.textMuted }}>{t(slotType)}</span>
                                    <span style={{ fontSize: '10px', color: '#ef4444' }}>{t("Sponsored")}</span>
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
                                    padding: '10px 6px', borderRadius: '8px',
                                    border: `2px solid ${isSelectedSlot ? charityTheme.accentGreen : charityTheme.border}`,
                                    backgroundColor: isSelectedSlot ? charityTheme.accentGreenLight : '#ffffff',
                                    color: isSelectedSlot ? charityTheme.accentGreen : charityTheme.textHeading,
                                    cursor: 'pointer', textAlign: 'center', fontSize: '12px', fontWeight: 700,
                                    textTransform: 'capitalize', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px'
                                  }}
                                >
                                  {isSelectedSlot ? <Check size={12} /> : <Clock size={12} color={charityTheme.textMuted} />}
                                  <span>{t(slotType)}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Beneficiary Children: All Orphanage Children */}
                        <div style={{
                          marginBottom: '14px',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(16,185,129,0.06))',
                          border: `1.5px solid rgba(37,99,235,0.22)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #1d70b8, #10b981)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              flexShrink: 0
                            }}>
                              <Baby size={20} />
                            </div>
                            <div>
                              <div style={{ fontSize: '11px', color: charityTheme.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>
                                {t("Beneficiary Children")}
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: charityTheme.textHeading }}>
                                {t("All Orphanage Children")}
                              </div>
                              <div style={{ fontSize: '11px', color: charityTheme.textBody }}>
                                {t("Meals must cover all children currently residing in the orphanage.")}
                              </div>
                            </div>
                          </div>
                          <div style={{
                            textAlign: 'right',
                            padding: '6px 12px',
                            backgroundColor: '#ffffff',
                            border: `1.5px solid rgba(29,112,184,0.25)`,
                            borderRadius: '8px',
                            minWidth: '85px'
                          }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: charityTheme.textMuted, textTransform: 'uppercase' }}>
                              {t("Active Children")}
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: 900, color: charityTheme.primary, marginTop: '1px' }}>
                              {childCount || 50}
                            </div>
                          </div>
                        </div>

                        {/* ─── 100% REFUNDABLE CONFIRMATION DEPOSIT SECTION ─── */}
                        <div style={{
                          border: `1.5px solid rgba(16, 185, 129, 0.35)`,
                          backgroundColor: '#f0fdf4',
                          borderRadius: '12px',
                          padding: '14px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <ShieldCheck size={18} color="#059669" />
                              <span style={{ fontSize: '13px', fontWeight: 800, color: '#065f46' }}>
                                {t("100% Refundable Confirmation Deposit")}
                              </span>
                            </div>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              backgroundColor: '#d1fae5',
                              color: '#047857',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}>
                              {t("Refunded on Arrival")}
                            </span>
                          </div>

                          <p style={{ fontSize: '12px', color: '#166534', margin: '0 0 12px', lineHeight: 1.5 }}>
                            {language === 'si'
                              ? 'මෙම අත්තිකාරම් මුදල ලබාගන්නේ ඔබ වෙන්කරවා ගත් දිනයේදී ආහාර නිසැකවම රැගෙන එන බවට තහවුරු කරගැනීමට පමණි. ඔබ මධ්‍යස්ථානය වෙත පැමිණ දරුවන්ට ආහාර ලබාදුන් වහාම මෙම තැන්පතු මුදල සම්පූර්ණයෙන්ම ඔබට ආපසු ලබාදෙනු ලැබේ.'
                              : 'This deposit is collected strictly to confirm that you will surely bring the meal on the scheduled day, preventing no-shows. When you arrive at the orphanage and donate the meal, this advance deposit is 100% refunded to you.'}
                          </p>

                          {/* Deposit Option Selector */}
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#065f46', marginBottom: '6px', textTransform: 'uppercase' }}>
                            {t("Select Confirmation Deposit Amount")}
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                            {[
                              { id: '2500', label: 'LKR 2,500', sub: t('Standard') },
                              { id: '5000', label: 'LKR 5,000', sub: t('High Commitment') },
                              { id: 'custom', label: t('Custom'), sub: t('Min. LKR 1,000') }
                            ].map(opt => {
                              const isSelected = mealForm.advanceOption === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setMealForm(prev => ({ ...prev, advanceOption: opt.id }))}
                                  style={{
                                    padding: '8px 4px',
                                    borderRadius: '8px',
                                    border: `1.5px solid ${isSelected ? '#059669' : 'rgba(5, 150, 105, 0.2)'}`,
                                    backgroundColor: isSelected ? '#059669' : '#ffffff',
                                    color: isSelected ? '#ffffff' : '#065f46',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    textAlign: 'center'
                                  }}
                                >
                                  <div>{opt.label}</div>
                                  <div style={{ fontSize: '9px', opacity: isSelected ? 0.9 : 0.7, fontWeight: 500, marginTop: '1px' }}>
                                    {opt.sub}
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom Advance Input */}
                          {mealForm.advanceOption === 'custom' && (
                            <div style={{ marginBottom: '10px' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#065f46', marginBottom: '4px' }}>
                                {t("Custom Deposit Amount (LKR) *")}
                              </label>
                              <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '10px', top: '8px', fontSize: '12px', fontWeight: 700, color: charityTheme.textMuted }}>
                                  LKR
                                </span>
                                <input
                                  type="text"
                                  style={{
                                    width: '100%', padding: '7px 10px 7px 42px', borderRadius: '6px',
                                    border: `1px solid rgba(5, 150, 105, 0.3)`, backgroundColor: '#ffffff',
                                    fontSize: '12px', fontWeight: 700, color: '#065f46', boxSizing: 'border-box'
                                  }}
                                  placeholder="2,500"
                                  value={mealForm.customAdvance}
                                  onChange={(e) => setMealForm(prev => ({ ...prev, customAdvance: formatWithCommas(e.target.value) }))}
                                  required
                                />
                              </div>
                            </div>
                          )}

                          {/* Deposit Due Now Banner */}
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '8px',
                            border: `1px solid rgba(5, 150, 105, 0.25)`, marginBottom: '12px'
                          }}>
                            <div>
                              <div style={{ fontSize: '10px', color: '#047857', textTransform: 'uppercase', fontWeight: 800 }}>
                                {t("Refundable Deposit Due Now")}
                              </div>
                              <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '1px' }}>
                                ✓ {t("100% Refunded on Arrival")}
                              </div>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
                              LKR {calculateAdvanceAmount().toLocaleString()}
                            </div>
                          </div>

                          {/* Advance Payment Method Selector */}
                          <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: charityTheme.textHeading, marginBottom: '6px' }}>
                              {t("Advance Payment Method")}
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              {[
                                { id: 'bank_transfer', labelKey: 'Bank Transfer Deposit', defaultLabel: 'Bank Transfer Slip', icon: Landmark },
                                { id: 'online', labelKey: 'Online Payment (Instant Card / Stripe)', defaultLabel: 'Online Card (Stripe)', icon: CreditCard }
                              ].map(m => {
                                const isSelected = mealForm.paymentMethod === m.id;
                                const MIcon = m.icon;
                                return (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setMealForm(prev => ({ ...prev, paymentMethod: m.id }))}
                                    style={{
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      border: `1px solid ${isSelected ? charityTheme.primary : charityTheme.border}`,
                                      backgroundColor: isSelected ? charityTheme.primaryLight : '#ffffff',
                                      color: isSelected ? charityTheme.primary : charityTheme.textBody,
                                      fontWeight: 600,
                                      fontSize: '11px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    <MIcon size={14} />
                                    <span>{t(m.labelKey, m.defaultLabel)}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* If Online Stripe */}
                          {mealForm.paymentMethod === 'online' && (
                            <div style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#eff6ff',
                              border: `1px solid rgba(29, 112, 184, 0.2)`,
                              fontSize: '11px',
                              color: charityTheme.primaryDark,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <Lock size={14} style={{ flexShrink: 0 }} />
                              <span>{t("You will be securely redirected to Stripe's 256-bit encrypted checkout page.")}</span>
                            </div>
                          )}

                          {/* If Bank Transfer Slip */}
                          {mealForm.paymentMethod === 'bank_transfer' && (
                            <div style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#ffffff',
                              border: `1px solid ${charityTheme.border}`
                            }}>
                              <div style={{ fontSize: '11px', color: charityTheme.textHeading, fontWeight: 700, marginBottom: '4px' }}>
                                {t("Bank Transfer Account Details:")}
                              </div>
                              <div style={{ fontSize: '11px', color: charityTheme.textMuted, lineHeight: 1.5, marginBottom: '8px' }}>
                                {t("Bank Name")}: <strong>{t("Commercial Bank")}</strong> &bull; {t("Account Name")}: <strong>{t("Senehasa Dari Sewana Foundation")}</strong><br />
                                {t("Account Number")}: <strong>800-459-2104</strong> &bull; {t("Branch")}: {t("Kollupitiya")}
                              </div>

                              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: charityTheme.textBody, marginBottom: '4px' }}>
                                {t("Upload Deposit Receipt (Image or PDF) *")}
                              </label>
                              <input
                                type="file"
                                style={{
                                  width: '100%',
                                  padding: '6px',
                                  borderRadius: '6px',
                                  border: `1px solid ${charityTheme.border}`,
                                  backgroundColor: '#f8fafc',
                                  fontSize: '11px',
                                  boxSizing: 'border-box'
                                }}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setMealForm(prev => ({
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
                                required={mealForm.paymentMethod === 'bank_transfer'}
                              />
                              {mealForm.proof && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginTop: '6px', background: charityTheme.primaryLight, padding: '4px 8px', borderRadius: '4px' }}>
                                  <span>Slip: <strong>{mealForm.proof.fileName}</strong></span>
                                  <button
                                    type="button"
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                                    onClick={() => setMealForm(prev => ({ ...prev, proof: null }))}
                                  >
                                    {t("Remove Photo", "Remove")}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Contact Info Inputs */}
                        <div style={{ borderTop: `1px solid ${charityTheme.border}`, paddingTop: '10px', marginBottom: '10px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
                            <input
                              style={{
                                width: '100%', padding: '8px 10px', borderRadius: '8px',
                                border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                                fontSize: '12px', color: charityTheme.textHeading, boxSizing: 'border-box'
                              }}
                              placeholder={t("Your full name *")}
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
                              placeholder={t("Email address *")}
                              value={mealForm.email}
                              onChange={(e) => setMealForm(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
                            <input
                              style={{
                                width: '100%', padding: '8px 10px', borderRadius: '8px',
                                border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                                fontSize: '12px', color: charityTheme.textHeading, boxSizing: 'border-box'
                              }}
                              placeholder={t("Mobile phone number for SMS confirmation")}
                              value={mealForm.contactDetails}
                              onChange={(e) => setMealForm(prev => ({ ...prev, contactDetails: e.target.value }))}
                            />
                            <input
                              style={{
                                width: '100%', padding: '8px 10px', borderRadius: '8px',
                                border: `1px solid ${charityTheme.border}`, backgroundColor: '#ffffff',
                                fontSize: '12px', color: charityTheme.textHeading, boxSizing: 'border-box'
                              }}
                              placeholder={t("Dedication or Occasion (Optional)")}
                              value={mealForm.occasion}
                              onChange={(e) => setMealForm(prev => ({ ...prev, occasion: e.target.value }))}
                            />
                          </div>
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
                            {t("Cancel")}
                          </button>
                          <button
                            type="submit"
                            disabled={mealLoading}
                            style={{
                              padding: '8px 20px', borderRadius: '8px',
                              backgroundColor: charityTheme.accentGreen, color: '#ffffff',
                              border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '6px',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                            }}
                          >
                            {mealLoading
                              ? t("Confirming...")
                              : mealForm.paymentMethod === 'online'
                                ? t("Pay Refundable Deposit (Stripe)")
                                : t("Confirm Reservation with Deposit Slip")}
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
