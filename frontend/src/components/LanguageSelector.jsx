import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown, Check, Globe } from 'lucide-react';

export default function LanguageSelector({ variant = 'header', isDark = false }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇬🇧' },
    { code: 'si', label: 'සිංහල', shortLabel: 'සිංහල', flag: '🇱🇰' }
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div
      ref={dropdownRef}
      className={`lang-selector-root ${variant}`}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Select website language. Currently: ${currentLang.label}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: variant === 'compact' ? '5px 10px' : '7px 14px',
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(29, 112, 184, 0.06)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.16)'
            : '1px solid rgba(29, 112, 184, 0.18)',
          borderRadius: '20px',
          color: isDark ? '#ffffff' : '#1e293b',
          fontSize: variant === 'compact' ? '12px' : '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isOpen
            ? '0 0 0 2px rgba(29, 112, 184, 0.2)'
            : 'none',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark
            ? 'rgba(255, 255, 255, 0.14)'
            : 'rgba(29, 112, 184, 0.12)';
          e.currentTarget.style.borderColor = '#1d70b8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(29, 112, 184, 0.06)';
          e.currentTarget.style.borderColor = isDark
            ? 'rgba(255, 255, 255, 0.16)'
            : '1px solid rgba(29, 112, 184, 0.18)';
        }}
      >
        <span style={{ fontSize: '15px', lineHeight: 1 }}>{currentLang.flag}</span>
        <span style={{ letterSpacing: '0.01em' }}>{currentLang.label}</span>
        <ChevronDown
          size={14}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: isDark ? '#cbd5e1' : '#64748b'
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 9999,
            minWidth: '150px',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 12px 30px -6px rgba(15, 23, 42, 0.18), 0 4px 10px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            padding: '6px',
            animation: 'dropdownFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden'
          }}
        >
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <div
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  backgroundColor: isSelected
                    ? 'rgba(29, 112, 184, 0.08)'
                    : 'transparent',
                  color: isSelected ? '#1d70b8' : '#334155',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '13px',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {isSelected && (
                  <Check size={15} color="#1d70b8" strokeWidth={2.6} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
