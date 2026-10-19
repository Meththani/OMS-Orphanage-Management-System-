import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * AboutHeroCard Component
 * Faithfully matches the provided About Us showcase card design:
 * - Soft sky-blue card with 36px border radius
 * - Parliament Act verification pill badge
 * - Bold two-line headline with Outfit font
 * - Left content with authentic text
 * - Organic sweeping wave cutout framing the building photo
 * - Decorative top-left soft wave blob, bottom-left hand-drawn heart, and bottom-right stylized blue leaf motif
 */
export default function AboutHeroCard({
  badgeText = 'Incorporated under Parliament Act No. 30 of 2024 • Webada, Kirillawala',
  title = (
    <>
      <span className="about-title-line">Who We Are: A Legacy of</span>{' '}
      <span className="about-title-line">Refuge, Care, &amp; Dignity.</span>
    </>
  ),
  firstParagraph = (
    <>
      <strong>Kirillawala Senehasa Dari Sewana Child Development Centre</strong> (Senehasa Dari Sewana) is an institution located in Webada, Kirillawala, Sri Lanka. The centre is dedicated to providing a safe, caring, and supportive environment for children while actively supporting their education, wellbeing, and personal development.
    </>
  ),
  secondParagraph = (
    <>
      The centre operates under the stewardship of the <strong>Kelaniya Buddhist Women's Charitable Society</strong>, a charitable organization established to carry out social, educational, and welfare activities across Sri Lanka.
    </>
  ),
  imageSrc = '/about-building-trimmed.png',
  imageAlt = 'Kirillawala Senehasa Dari Sewana Child Development Centre'
}) {
  return (
    <div className="about-hero-card-container">
      {/* Main Card */}
      <div className="about-hero-card">
        {/* Decorative Top-Left Soft Organic Blob */}
        <svg
          className="about-decor-blob"
          width="200"
          height="180"
          viewBox="0 0 200 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M 0 0 L 150 0 C 135 48, 78 72, 58 112 C 40 148, 20 168, 0 180 Z"
            fill="#dbeafe"
            opacity="0.8"
          />
        </svg>

        {/* Decorative Bottom-Left Heart Outline */}
        <div className="about-decor-heart" aria-hidden="true">
          <svg
            width="62"
            height="62"
            viewBox="0 0 48 48"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 24 39 C 21.5 36.5, 8.5 26.5, 8.5 16.5 C 8.5 11.2, 12.8 7, 18 7 C 21 7, 23.2 8.4, 24 10.2 C 24.8 8.4, 27 7, 30 7 C 35.2 7, 39.5 11.2, 39.5 16.5 C 39.5 26.5, 26.5 36.5, 24 39 Z" />
          </svg>
        </div>

        {/* Content Column (Left) */}
        <div className="about-hero-content">
          {/* Parliament Act Pill Badge */}
          <div className="about-parliament-badge">
            <ShieldCheck size={16} strokeWidth={2.4} className="about-badge-icon" />
            <span>{badgeText}</span>
          </div>

          {/* Heading */}
          <h1 className="about-hero-title">
            {title}
          </h1>

          {/* Descriptive Body Text */}
          <div className="about-hero-text">
            <p className="about-hero-p1">
              {firstParagraph}
            </p>
            <p className="about-hero-p2">
              {secondParagraph}
            </p>
          </div>
        </div>

        {/* Media Column (Right - Organic Wave Cutout Photo) */}
        <div className="about-hero-media-wrapper">
          <div className="about-hero-photo-container">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="about-hero-img"
              loading="eager"
            />
          </div>

          {/* Decorative Bottom-Right Leaves Accent */}
          <div className="about-decor-leaves" aria-hidden="true">
            <svg
              width="60"
              height="60"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left petal (light sky blue) */}
              <path
                d="M 29 48 C 29 48, 18 36, 12 33 C 4 30, 6 43, 12 48 C 18 53, 26 51, 29 48 Z"
                fill="#38bdf8"
              />
              {/* Right petal (vibrant ocean blue) */}
              <path
                d="M 30 49 C 30 49, 39 25, 55 17 C 59 29, 50 43, 41 49 C 36 52, 32 50.5, 30 49 Z"
                fill="#0284c7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Embedded Scoped Styles for Guaranteed Pixel Perfection & Responsiveness */}
      <style>{`
        .about-hero-card-container {
          width: 100%;
          margin-bottom: 48px;
        }

        .about-hero-card {
          position: relative;
          background: linear-gradient(135deg, #eef7fe 0%, #f5faff 45%, #eaf4fc 100%);
          border-radius: 36px;
          border: 1px solid rgba(191, 219, 254, 0.7);
          box-shadow: 0 16px 44px -16px rgba(29, 112, 184, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          display: flex;
          align-items: stretch;
          min-height: 440px;
        }

        .about-decor-blob {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 1;
        }

        .about-decor-heart {
          position: absolute;
          bottom: 24px;
          left: 32px;
          pointer-events: none;
          z-index: 2;
          transform: rotate(-12deg);
          opacity: 0.9;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .about-hero-card:hover .about-decor-heart {
          transform: rotate(-4deg) scale(1.08);
        }

        .about-hero-content {
          position: relative;
          z-index: 2;
          flex: 1 1 45%;
          padding: 44px 24px 44px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }

        .about-parliament-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          align-self: flex-start;
          padding: 7px 18px;
          border-radius: 9999px;
          background-color: rgba(219, 234, 254, 0.9);
          border: 1px solid rgba(147, 197, 253, 0.75);
          color: #0284c7;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.01em;
          margin-bottom: 22px;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(2, 132, 199, 0.06);
        }

        .about-badge-icon {
          color: #0284c7;
          flex-shrink: 0;
        }

        .about-hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(26px, 2.6vw, 39px);
          font-weight: 800;
          line-height: 1.18;
          letter-spacing: -0.025em;
          color: #111827;
          margin: 0 0 20px 0;
        }

        .about-title-line {
          display: inline-block;
        }

        .about-hero-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #475569;
          font-size: 15px;
          line-height: 1.72;
          max-width: 580px;
        }

        .about-hero-p1 {
          margin: 0 0 18px 0;
        }

        .about-hero-p1 strong {
          color: #1e293b;
          font-weight: 700;
        }

        .about-hero-p2 {
          margin: 0;
        }

        .about-hero-p2 strong {
          color: #1e293b;
          font-weight: 700;
        }

        .about-hero-media-wrapper {
          position: relative;
          flex: 1 1 55%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          min-height: 440px;
          min-width: 0;
          padding: 16px 20px 16px 0;
        }

        .about-hero-photo-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .about-hero-img {
          width: auto;
          max-width: 100%;
          height: 100%;
          max-height: 410px;
          object-fit: contain;
          object-position: right center;
          display: block;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .about-hero-card:hover .about-hero-img {
          transform: scale(1.02);
        }

        .about-decor-leaves {
          position: absolute;
          bottom: 22px;
          right: 22px;
          pointer-events: none;
          z-index: 3;
          filter: drop-shadow(0 2px 8px rgba(2, 132, 199, 0.2));
          transition: transform 0.3s ease;
        }

        .about-hero-card:hover .about-decor-leaves {
          transform: rotate(6deg) scale(1.08);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1040px) {
          .about-parliament-badge {
            font-size: 12px;
            padding: 6px 14px;
            white-space: normal;
          }
        }

        @media (max-width: 920px) {
          .about-hero-card {
            flex-direction: column;
            border-radius: 28px;
            min-height: auto;
          }

          .about-hero-content {
            max-width: 100%;
            padding: 40px 32px 32px 32px;
          }

          .about-hero-media-wrapper {
            min-height: 360px;
            width: 100%;
          }

          .about-hero-photo-container {
            clip-path: none;
            -webkit-clip-path: none;
            border-radius: 0 0 28px 28px;
          }

          .about-hero-img {
            object-position: center 40%;
          }

          .about-decor-heart {
            bottom: auto;
            top: 24px;
            right: 28px;
            left: auto;
          }

          .about-title-break {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .about-hero-content {
            padding: 32px 20px 24px 20px;
          }

          .about-parliament-badge {
            font-size: 11.5px;
            padding: 6px 14px;
          }

          .about-hero-title {
            font-size: 26px;
          }

          .about-hero-text {
            font-size: 14px;
          }

          .about-hero-media-wrapper {
            min-height: 250px;
          }
        }
      `}</style>
    </div>
  );
}
