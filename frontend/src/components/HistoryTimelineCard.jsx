import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Landmark, ShieldCheck, Heart, ChevronLeft, ChevronRight,
  Calendar, Clock, Sparkles, Building2, Award
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HistoryTimelineCard() {
  const { language, t } = useLanguage();
  const isSi = language === 'si';

  const HISTORICAL_PHOTOS = [
    {
      id: 'outdoor-pavilion',
      srcWebp: '/history/outdoor-pavilion-hd.webp',
      srcJpg: '/history/outdoor-pavilion-hd.jpg',
      alt: isSi ? 'සෙනෙහස දැරි සෙවණ එළිමහන් බෞද්ධ වන්දනා මණ්ඩපය' : 'High resolution architectural photograph of the outdoor Buddhist shrine pavilion at Senehasa Dari Sewana',
      title: isSi ? 'අභයභූමි පරිශ්‍රය සහ ශාන්ත පරිසරය' : 'Sanctuary Pavilion & Peaceful Grounds',
      tag: isSi ? 'අභයභූමි පරිශ්‍රය • වැබඩ' : 'Sanctuary Grounds • Webada',
      year: 'Sanctuary Grounds'
    },
    {
      id: 'indoor-centre',
      srcWebp: '/history/indoor-centre-hd.webp',
      srcJpg: '/history/indoor-centre-hd.jpg',
      alt: isSi ? 'ළමා මඟපෙන්වීම් සහ අධ්‍යයන අංශය' : 'High resolution interior photograph of the child guidance study center and reception wing',
      title: isSi ? 'මඟපෙන්වීම් මධ්‍යස්ථානය සහ අධ්‍යයන අංශය' : 'Guidance Center & Study Wing',
      tag: isSi ? 'පරිපාලන අංශය • කිරිල්ලවල' : 'Administrative Wing • Kirillawala',
      year: 'Child Development Center'
    },
    {
      id: 'historical-1962',
      srcWebp: '/history/historical-charity-1962-hd.webp',
      srcJpg: '/history/historical-charity-1962-hd.jpg',
      alt: isSi ? '1962 පිහිටුවන ලද කැළණිය බෞද්ධ කාන්තා පුණ්‍යායතනය' : 'High resolution archival photograph of Kelaniya Buddhist Women\'s Charitable Society founded in 1962',
      title: isSi ? 'කැළණිය බෞද්ධ කාන්තා පුණ්‍යායතන ලේඛනාගාරය' : 'Kelaniya Buddhist Women\'s Society Archive',
      tag: isSi ? 'ඓතිහාසික පදනම • 1962 පිහිටුවන ලදී' : 'Historical Foundation • Established 1962',
      year: 'Origins Since 1962'
    },
    {
      id: 'sanctuary-building',
      srcWebp: '/history/sanctuary-building-hd.webp',
      srcJpg: '/history/sanctuary-building-hd.jpg',
      alt: isSi ? 'සෙනෙහස දැරි සෙවණ දෙමහල් ප්‍රධාන නේවාසික ගොඩනැගිල්ල' : 'Two-story main sanctuary building of Senehasa Dari Sewana with residential quarters',
      title: isSi ? 'සෙනෙහස දැරි සෙවණ නේවාසික අභයභූමිය' : 'Senehasa Dari Sewana Residential Sanctuary',
      tag: isSi ? 'නේවාසික අභයභූමිය • වර්තමානය' : 'Residential Sanctuary • Present Day',
      year: 'Modern Facility'
    }
  ];

  const MILESTONES = [
    {
      id: 'milestone-2018',
      dateBadge: isSi ? '2018 — ගැසට් යෝජනාව' : '2018 — Gazette Proposal',
      theme: 'blue',
      icon: Landmark,
      title: isSi ? 'අභයභූමිය පිහිටුවීම' : 'Sanctuary Establishment',
      content: isSi ? (
        <>
          2018 වසරේදී, කිරිල්ලවල, වැබඩ, ජය මාවත, අංක 307/16 ලිපිනයේ පිහිටි{' '}
          <strong>සෙනෙහස ළමා සංවර්ධන මධ්‍යස්ථානය</strong> (හෝ{' '}
          <em>“සෙනෙහස දැරි සෙවණ ළමා නිවාසය”</em>) පිහිටුවීම සහ පවත්වාගෙන යාම සඳහා පාර්ලිමේන්තු ගැසට් පත්‍රයක් මඟින් විධිමත්ව යෝජනා කරන ලදී.
        </>
      ) : (
        <>
          In 2018, a Parliamentary Gazette formally proposed the establishment and maintenance of the{' '}
          <strong>Senehasa Child Development Center</strong> (also referred to as{' '}
          <em>“Senehasa Dari Sevana Children&apos;s Home”</em>) at No. 307/16, Jaya Mawatha, Webada, Kirillawala.
        </>
      )
    },
    {
      id: 'milestone-2024',
      dateBadge: isSi ? '2024 ජූනි 12 සහ 14 — සංස්ථාපනය' : 'June 12 & 14, 2024 — Incorporation',
      theme: 'teal',
      icon: ShieldCheck,
      title: isSi ? '2024 අංක 30 දරන පාර්ලිමේන්තු පනත' : 'Parliament Act No. 30 of 2024',
      content: isSi ? (
        <>
          ශ්‍රී ලංකා පාර්ලිමේන්තුව විසින්{' '}
          <strong>2024 අංක 30 දරන කැළණිය බෞද්ධ කාන්තා පුණ්‍යායතනය (සංස්ථාගත කිරීමේ) පනත</strong>{' '}
          (2024 ජූනි 12 සහතික කර ජූනි 14 දින සිට බලාත්මක) සම්මත කරමින් අභයභූමිය පවත්වාගෙන යාම සඳහා ව්‍යවස්ථාපිත බලය ලබා දෙන ලදී.
        </>
      ) : (
        <>
          The Sri Lankan Parliament enacted the{' '}
          <strong>Kelaniya Buddhist Women&apos;s Charitable Society (Incorporation) Act, No. 30 of 2024</strong>{' '}
          (certified June 12, effective June 14, 2024), establishing statutory authority to run the sanctuary.
        </>
      )
    },
    {
      id: 'milestone-present',
      dateBadge: isSi ? 'වර්තමානය — නේවාසික රැකවරණය' : 'Present Day — Residential Care',
      theme: 'gold',
      icon: Heart,
      title: isSi ? 'නේවාසික ළමා සංවර්ධනය' : 'Residential Child Development',
      content: isSi ? (
        <>
          අද වන විට, සෙනෙහස දැරි සෙවණ ආයතනය දරුවන්ට විශ්වාසවන්ත, ස්වාධීන අනාගතයක් ගොඩනැගීම සඳහා පැය 24 පුරාම රැකවරණය, නවාතැන්, අධ්‍යාපනය, සෞඛ්‍ය සේවා සහ මඟපෙන්වීම් සලසයි.
        </>
      ) : (
        <>
          Today, Senehasa Dari Sewana provides children with round-the-clock care, shelter, education, healthcare, and guidance to build confident, independent futures.
        </>
      )
    }
  ];
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
  const slideTimerRef = useRef(null);
  const galleryRef = useRef(null);

  // Check user prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Preload next image to avoid layout glitches
  useEffect(() => {
    const nextIndex = (activeSlide + 1) % HISTORICAL_PHOTOS.length;
    const img = new Image();
    img.src = HISTORICAL_PHOTOS[nextIndex].srcWebp;
  }, [activeSlide]);

  const handleNextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % HISTORICAL_PHOTOS.length);
  }, []);

  const handlePrevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + HISTORICAL_PHOTOS.length) % HISTORICAL_PHOTOS.length);
  }, []);

  // Automatic slideshow cycle (5.5s), pausing on hover or focus
  useEffect(() => {
    if (isPaused || isReducedMotion) {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
      return;
    }

    slideTimerRef.current = setInterval(() => {
      handleNextSlide();
    }, 5500);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [isPaused, isReducedMotion, handleNextSlide]);

  // Keyboard navigation for gallery
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNextSlide();
    }
  };

  return (
    <section
      className="history-showcase-section"
      aria-labelledby="history-heading"
    >
      {/* Decorative Botanical Ambient Shapes */}
      <div className="history-ambient-blob history-ambient-blob-tl" aria-hidden="true" />
      <div className="history-ambient-blob history-ambient-blob-br" aria-hidden="true" />

      {/* Main Glass/Translucent Content Container */}
      <div className="history-card-container">
        {/* Header Block with Eyebrow, Heading, and Subtitle */}
        <div className="history-header">
          <div className="history-eyebrow-badge">
            <span className="history-eyebrow-dot" aria-hidden="true" />
            <span>{t("OFFICIAL HISTORY & MILESTONES")}</span>
          </div>

          <h2 id="history-heading" className="history-main-heading">
            {t("Our History & Parliamentary Incorporation")}
          </h2>

          <p className="history-subtitle">
            {t("From early welfare initiatives to formal Parliamentary Act certification in 2024.")}
          </p>
        </div>

        {/* Two-Part Composition: Left Timeline + Right Photo Gallery */}
        <div className="history-split-layout">
          {/* ────────────── LEFT: Historical Timeline ────────────── */}
          <div className="history-timeline-col">
            <div className="history-timeline-track">
              {/* Vertical connecting line */}
              <div className="history-connecting-line" aria-hidden="true" />

              {MILESTONES.map((milestone, index) => {
                const IconComponent = milestone.icon;
                const isActive = activeMilestoneIndex === index;

                return (
                  <div
                    key={milestone.id}
                    className={`history-milestone-item milestone-theme-${milestone.theme} ${isActive ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveMilestoneIndex(index)}
                    onClick={() => setActiveMilestoneIndex(index)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Milestone: ${milestone.dateBadge}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setActiveMilestoneIndex(index);
                      }
                    }}
                  >
                    {/* Node marker with connected dot */}
                    <div className="history-node-marker" aria-hidden="true">
                      <div className="history-marker-ring">
                        <div className="history-marker-dot" />
                      </div>
                    </div>

                    {/* Milestone Card Body */}
                    <div className="history-milestone-card">
                      <div className="history-milestone-card-header">
                        {/* Date Badge */}
                        <span className="history-milestone-date-badge">
                          <Clock size={12} strokeWidth={2.4} className="history-date-icon" />
                          <span>{milestone.dateBadge}</span>
                        </span>

                        {/* Subtle Milestone Icon */}
                        <div className="history-milestone-theme-icon" aria-hidden="true">
                          <IconComponent size={16} strokeWidth={2.2} />
                        </div>
                      </div>

                      <h3 className="history-milestone-title">
                        {milestone.title}
                      </h3>

                      <p className="history-milestone-desc">
                        {milestone.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ────────────── RIGHT: Photo Slideshow Gallery ────────────── */}
          <div className="history-gallery-col">
            <div
              ref={galleryRef}
              className="history-gallery-panel"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="region"
              aria-roledescription="carousel"
              aria-label="Historical Photographs of Senehasa Dari Sewana"
            >
              {/* Photo Display Window with Smooth Crossfade */}
              <div className="history-slides-viewport">
                {HISTORICAL_PHOTOS.map((photo, index) => {
                  const isCurrent = index === activeSlide;

                  return (
                    <div
                      key={photo.id}
                      className={`history-slide-item ${isCurrent ? 'is-active' : 'is-hidden'}`}
                      aria-hidden={!isCurrent}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${index + 1} of ${HISTORICAL_PHOTOS.length}: ${photo.title}`}
                    >
                      <picture>
                        <source srcSet={photo.srcWebp} type="image/webp" />
                        <img
                          src={photo.srcJpg}
                          alt={photo.alt}
                          className="history-slide-img"
                          loading={index === 0 ? 'eager' : 'lazy'}
                        />
                      </picture>

                      {/* Gentle bottom gradient scrim for caption contrast */}
                      <div className="history-slide-scrim" aria-hidden="true" />
                    </div>
                  );
                })}

                {/* Top Badge: Photo Counter & Archive Label */}
                <div className="history-gallery-top-bar">
                  <div className="history-gallery-pill">
                    <Sparkles size={13} className="history-sparkle-icon" />
                    <span>{isSi ? 'ඓතිහාසික ලේඛනාගාරය' : 'Historical Archive'}</span>
                  </div>
                  <div className="history-counter-pill">
                    <span>{String(activeSlide + 1).padStart(2, '0')}</span>
                    <span className="history-counter-sep">/</span>
                    <span>{String(HISTORICAL_PHOTOS.length).padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Bottom Caption Pill (Preserves Authentic Context) */}
                <div className="history-caption-container">
                  <span className="history-caption-tag">
                    {HISTORICAL_PHOTOS[activeSlide].tag}
                  </span>
                  <h4 className="history-caption-title">
                    {HISTORICAL_PHOTOS[activeSlide].title}
                  </h4>
                </div>

                {/* Accessible Prev/Next Glass Controls */}
                <div className="history-nav-controls">
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="history-nav-btn history-nav-prev"
                    aria-label="Previous historical photograph"
                  >
                    <ChevronLeft size={18} strokeWidth={2.4} />
                  </button>

                  {/* Pagination Dots */}
                  <div className="history-dots-container" role="tablist" aria-label="Slideshow pagination">
                    {HISTORICAL_PHOTOS.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        role="tab"
                        aria-selected={i === activeSlide}
                        aria-label={`Go to photograph ${i + 1}`}
                        onClick={() => setActiveSlide(i)}
                        className={`history-dot ${i === activeSlide ? 'is-active' : ''}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="history-nav-btn history-nav-next"
                    aria-label="Next historical photograph"
                  >
                    <ChevronRight size={18} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Scoped Styles for Guaranteed Visual Polish, Zero CLS & Seamless Responsiveness */}
      <style>{`
        .history-showcase-section {
          position: relative;
          width: 100%;
          margin-bottom: 52px;
          border-radius: 36px;
          background: linear-gradient(135deg, #edf6fd 0%, #f7fbff 45%, #eaf4fc 100%);
          border: 1px solid rgba(191, 219, 254, 0.75);
          box-shadow: 0 20px 48px -18px rgba(29, 112, 184, 0.09), 0 2px 6px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          padding: 48px 44px;
        }

        /* Subtle Ambient Botanical Shapes */
        .history-ambient-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.55;
        }
        .history-ambient-blob-tl {
          top: -80px;
          left: -80px;
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(186, 230, 253, 0.8) 0%, rgba(219, 234, 254, 0) 70%);
        }
        .history-ambient-blob-br {
          bottom: -80px;
          right: -80px;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(204, 251, 241, 0.7) 0%, rgba(224, 242, 254, 0) 70%);
        }

        .history-card-container {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        /* Header block */
        .history-header {
          text-align: center;
          max-width: 780px;
          margin: 0 auto 40px auto;
        }

        .history-eyebrow-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 9999px;
          background-color: rgba(219, 234, 254, 0.9);
          border: 1px solid rgba(147, 197, 253, 0.8);
          color: #0284c7;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 14px;
          box-shadow: 0 2px 6px rgba(2, 132, 199, 0.06);
        }

        .history-eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #0284c7;
          display: inline-block;
          box-shadow: 0 0 8px #0284c7;
        }

        .history-main-heading {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(28px, 2.7vw, 38px);
          font-weight: 800;
          color: #0f172a;
          line-height: 1.22;
          letter-spacing: -0.025em;
          margin: 0 0 12px 0;
        }

        .history-subtitle {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        /* Two-part composition */
        .history-split-layout {
          display: flex;
          align-items: stretch;
          gap: 36px;
          width: 100%;
        }

        /* ────── LEFT COLUMN: Timeline Track ────── */
        .history-timeline-col {
          flex: 1 1 56%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .history-timeline-track {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-left: 28px;
        }

        /* Vertical connected line */
        .history-connecting-line {
          position: absolute;
          left: 11px;
          top: 24px;
          bottom: 24px;
          width: 2px;
          background: linear-gradient(180deg, #93c5fd 0%, #5eead4 50%, #fcd34d 100%);
          border-radius: 2px;
          z-index: 1;
        }

        .history-milestone-item {
          position: relative;
          z-index: 2;
          cursor: pointer;
          outline: none;
          transition: transform 0.25s ease;
        }

        .history-milestone-item:hover,
        .history-milestone-item:focus-visible {
          transform: translateX(4px);
        }

        /* Connected Node Marker */
        .history-node-marker {
          position: absolute;
          left: -28px;
          top: 24px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
        }

        .history-marker-ring {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #ffffff;
          border: 2px solid #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .history-marker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #94a3b8;
          transition: all 0.25s ease;
        }

        /* Node themes */
        .milestone-theme-blue .history-marker-ring { border-color: #2563eb; }
        .milestone-theme-blue .history-marker-dot { background-color: #2563eb; }
        .milestone-theme-teal .history-marker-ring { border-color: #0d9488; }
        .milestone-theme-teal .history-marker-dot { background-color: #0d9488; }
        .milestone-theme-gold .history-marker-ring { border-color: #d97706; }
        .milestone-theme-gold .history-marker-dot { background-color: #d97706; }

        .history-milestone-item.is-active .history-marker-ring {
          transform: scale(1.2);
          box-shadow: 0 0 12px rgba(37, 99, 235, 0.35);
        }

        /* Milestone Card Box */
        .history-milestone-card {
          border-radius: 20px;
          padding: 22px 24px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(226, 232, 240, 0.85);
          box-shadow: 0 6px 18px -6px rgba(15, 23, 42, 0.05);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .history-milestone-item:hover .history-milestone-card,
        .history-milestone-item:focus-visible .history-milestone-card {
          box-shadow: 0 12px 28px -10px rgba(15, 23, 42, 0.1);
        }

        .milestone-theme-blue .history-milestone-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 247, 255, 0.8) 100%);
          border-color: rgba(191, 219, 254, 0.85);
        }
        .milestone-theme-teal .history-milestone-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 253, 250, 0.8) 100%);
          border-color: rgba(153, 246, 228, 0.85);
        }
        .milestone-theme-gold .history-milestone-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 251, 235, 0.8) 100%);
          border-color: rgba(253, 230, 138, 0.85);
        }

        .history-milestone-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .history-milestone-date-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .history-date-icon {
          flex-shrink: 0;
        }

        .milestone-theme-blue .history-milestone-date-badge {
          background-color: rgba(219, 234, 254, 0.8);
          color: #1d70b8;
          border: 1px solid rgba(147, 197, 253, 0.7);
        }
        .milestone-theme-teal .history-milestone-date-badge {
          background-color: rgba(204, 251, 241, 0.85);
          color: #0f766e;
          border: 1px solid rgba(153, 246, 228, 0.8);
        }
        .milestone-theme-gold .history-milestone-date-badge {
          background-color: rgba(254, 243, 199, 0.85);
          color: #b45309;
          border: 1px solid rgba(253, 230, 138, 0.85);
        }

        .history-milestone-theme-icon {
          width: 30px;
          height: 30px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .milestone-theme-blue .history-milestone-theme-icon {
          background-color: rgba(219, 234, 254, 0.5);
          color: #1d70b8;
        }
        .milestone-theme-teal .history-milestone-theme-icon {
          background-color: rgba(204, 251, 241, 0.5);
          color: #0f766e;
        }
        .milestone-theme-gold .history-milestone-theme-icon {
          background-color: rgba(254, 243, 199, 0.5);
          color: #b45309;
        }

        .history-milestone-title {
          font-family: 'Outfit', sans-serif;
          font-size: 18.5px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.3;
          margin: 0 0 8px 0;
        }

        .history-milestone-desc {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          color: #475569;
          line-height: 1.68;
          margin: 0;
        }

        .history-milestone-desc strong {
          color: #1e293b;
          font-weight: 700;
        }

        /* ────── RIGHT COLUMN: Photo Slideshow Gallery ────── */
        .history-gallery-col {
          flex: 1 1 44%;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .history-gallery-panel {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 480px;
          border-radius: 28px;
          overflow: hidden;
          background-color: #0f172a;
          box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.22);
          border: 1px solid rgba(255, 255, 255, 0.6);
          outline: none;
        }

        .history-gallery-panel:focus-visible {
          box-shadow: 0 0 0 3px #0284c7, 0 20px 40px -15px rgba(15, 23, 42, 0.25);
        }

        .history-slides-viewport {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 480px;
        }

        /* Individual Crossfading Slide */
        .history-slide-item {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transform: scale(1.02);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
          z-index: 1;
        }

        .history-slide-item.is-active {
          opacity: 1;
          transform: scale(1);
          pointer-events: auto;
          z-index: 2;
        }

        .history-slide-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        /* Scrim at bottom to make caption pop with clean contrast */
        .history-slide-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0) 35%, rgba(15, 23, 42, 0.8) 100%);
          pointer-events: none;
        }

        /* Top Bar with Archive Badge and Counter */
        .history-gallery-top-bar {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 4;
        }

        .history-gallery-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 9999px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #f8fafc;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.03em;
        }

        .history-sparkle-icon {
          color: #38bdf8;
        }

        .history-counter-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 12px;
          border-radius: 9999px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #f8fafc;
          font-size: 12px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }

        .history-counter-sep {
          color: rgba(255, 255, 255, 0.45);
        }

        /* Caption Container */
        .history-caption-container {
          position: absolute;
          bottom: 74px;
          left: 24px;
          right: 24px;
          z-index: 4;
        }

        .history-caption-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #7dd3fc;
          margin-bottom: 4px;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
        }

        .history-caption-title {
          font-family: 'Outfit', sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.3;
          margin: 0;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        }

        /* Navigation controls: Prev/Next + Dots */
        .history-nav-controls {
          position: absolute;
          bottom: 20px;
          left: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 5;
        }

        .history-nav-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .history-nav-btn:hover {
          background: #ffffff;
          transform: scale(1.08);
          color: #0284c7;
        }

        .history-nav-btn:active {
          transform: scale(0.95);
        }

        .history-dots-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .history-dot {
          width: 9px;
          height: 9px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.45);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.25s ease;
        }

        .history-dot.is-active {
          width: 26px;
          background: #38bdf8;
          box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
        }

        /* ────── Responsive Breakpoints ────── */
        @media (max-width: 1024px) {
          .history-showcase-section {
            padding: 38px 28px;
            border-radius: 28px;
          }

          .history-split-layout {
            gap: 28px;
          }

          .history-timeline-col {
            flex: 1 1 54%;
          }

          .history-gallery-col {
            flex: 1 1 46%;
          }

          .history-gallery-panel,
          .history-slides-viewport {
            min-height: 440px;
          }
        }

        @media (max-width: 860px) {
          .history-split-layout {
            flex-direction: column;
            gap: 36px;
          }

          .history-timeline-col,
          .history-gallery-col {
            flex: 1 1 100%;
            width: 100%;
          }

          .history-gallery-panel,
          .history-slides-viewport {
            min-height: 380px;
          }

          .history-caption-title {
            font-size: 17px;
          }
        }

        @media (max-width: 580px) {
          .history-showcase-section {
            padding: 28px 16px;
            border-radius: 24px;
          }

          .history-main-heading {
            font-size: 24px;
          }

          .history-timeline-track {
            padding-left: 22px;
          }

          .history-connecting-line {
            left: 8px;
          }

          .history-node-marker {
            left: -22px;
            width: 18px;
            height: 18px;
          }

          .history-marker-ring {
            width: 16px;
            height: 16px;
          }

          .history-marker-dot {
            width: 6px;
            height: 6px;
          }

          .history-milestone-card {
            padding: 18px 16px;
            border-radius: 16px;
          }

          .history-milestone-title {
            font-size: 16.5px;
          }

          .history-milestone-desc {
            font-size: 13.5px;
          }

          .history-gallery-panel,
          .history-slides-viewport {
            min-height: 320px;
          }
        }

        /* Reduced motion accessibility */
        @media (prefers-reduced-motion: reduce) {
          .history-slide-item {
            transition: opacity 0.3s ease !important;
            transform: none !important;
          }
          .history-milestone-item,
          .history-nav-btn {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
