import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/apiClient';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles';
import { Search, Baby, Heart, Calendar, Package, Users, Landmark, X, ChevronRight, Command } from 'lucide-react';

export default function GlobalPortalSearch() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'children' | 'donations' | 'meals' | 'inventory' | 'staff' | 'accounts'
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    children: [],
    donations: [],
    meals: [],
    inventory: [],
    staff: [],
    accounts: [],
  });

  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const fetchPortalData = async () => {
    if (hasLoadedData) return;
    setLoading(true);
    try {
      const promises = [
        api.get('/children?status=active').catch(() => ({ data: [] })),
        api.get('/donations').catch(() => ({ data: [] })),
        api.get('/donations?type=meal').catch(() => ({ data: [] })),
        api.get('/inventory').catch(() => ({ data: [] })),
      ];

      if (user?.role === 'admin') {
        promises.push(api.get('/staff').catch(() => ({ data: [] })));
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }

      if (user?.role === 'accountant' || user?.role === 'admin') {
        promises.push(api.get('/finances/bank-accounts').catch(() => ({ data: [] })));
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }

      const [childRes, donRes, mealRes, invRes, staffRes, bankRes] = await Promise.all(promises);

      setData({
        children: childRes.data || [],
        donations: donRes.data || [],
        meals: mealRes.data || [],
        inventory: invRes.data || [],
        staff: staffRes.data || [],
        accounts: bankRes.data || [],
      });
      setHasLoadedData(true);
    } catch (err) {
      console.error('Global search load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    fetchPortalData();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener (Ctrl + K or Cmd + K to focus, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
        fetchPortalData();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cleanQuery = query.trim().toLowerCase();

  // Filter matching items
  const matchedChildren = (activeCategory === 'all' || activeCategory === 'children') && cleanQuery ? data.children.filter(c => 
    c.name?.toLowerCase().includes(cleanQuery) || 
    c.childID?.toLowerCase().includes(cleanQuery) ||
    c.guardianInfo?.name?.toLowerCase().includes(cleanQuery)
  ).slice(0, 4) : [];

  const matchedDonations = (activeCategory === 'all' || activeCategory === 'donations') && cleanQuery ? data.donations.filter(d => 
    d.donorID?.name?.toLowerCase().includes(cleanQuery) ||
    d.donorID?.email?.toLowerCase().includes(cleanQuery) ||
    d._id?.toLowerCase().includes(cleanQuery) ||
    String(d.amount || '').includes(cleanQuery)
  ).slice(0, 4) : [];

  const matchedMeals = (activeCategory === 'all' || activeCategory === 'meals') && cleanQuery ? data.meals.filter(m => 
    m.donorID?.name?.toLowerCase().includes(cleanQuery) ||
    m.mealType?.toLowerCase().includes(cleanQuery) ||
    m.occasion?.toLowerCase().includes(cleanQuery)
  ).slice(0, 4) : [];

  const matchedInventory = (activeCategory === 'all' || activeCategory === 'inventory') && cleanQuery ? data.inventory.filter(i => 
    i.name?.toLowerCase().includes(cleanQuery) ||
    i.category?.toLowerCase().includes(cleanQuery)
  ).slice(0, 4) : [];

  const matchedStaff = (activeCategory === 'all' || activeCategory === 'staff') && cleanQuery ? data.staff.filter(s => 
    s.name?.toLowerCase().includes(cleanQuery) ||
    s.username?.toLowerCase().includes(cleanQuery) ||
    s.jobRole?.toLowerCase().includes(cleanQuery)
  ).slice(0, 4) : [];

  const matchedAccounts = (activeCategory === 'all' || activeCategory === 'accounts') && cleanQuery ? data.accounts.filter(a => 
    a.accountName?.toLowerCase().includes(cleanQuery) ||
    a.bankName?.toLowerCase().includes(cleanQuery) ||
    a.accountNumber?.toLowerCase().includes(cleanQuery)
  ).slice(0, 4) : [];

  const totalMatches = matchedChildren.length + matchedDonations.length + matchedMeals.length + matchedInventory.length + matchedStaff.length + matchedAccounts.length;

  const handleSelect = (targetPath) => {
    setIsOpen(false);
    setQuery('');
    navigate(targetPath);
  };

  return (
    <div ref={searchContainerRef} style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
      
      {/* Light Theme Matching Search Input Box */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '9px 16px',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: isOpen ? `2px solid ${colors.primary}` : '1px solid rgba(15, 23, 42, 0.14)',
        boxShadow: isOpen ? `0 0 0 3px rgba(29, 112, 184, 0.15), 0 4px 12px rgba(15, 23, 42, 0.05)` : '0 2px 6px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.2s ease',
      }}>
        <Search size={18} color={isOpen ? colors.primary : '#64748b'} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={handleFocus}
          placeholder={language === 'si' ? "ලියාපදිංචි ළමුන්, පරිත්‍යාගශීලීන්, තොග, හෝ ගිණුම් සෙවීම..." : "Search children, donors, meals, inventory, staff, bank accounts..."}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#1e293b',
            fontSize: '14px',
            fontWeight: 500,
            width: '100%',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        />

        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
          >
            <X size={14} />
          </button>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '3px 7px',
            borderRadius: '6px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            color: '#64748b',
            fontSize: '11px',
            fontWeight: 600,
            flexShrink: 0,
          }}>
            <Command size={11} /> K
          </div>
        )}
      </div>

      {/* Light Matching Dropdown Container */}
      {isOpen && (cleanQuery.length > 0 || loading) && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          border: '1px solid rgba(15, 23, 42, 0.12)',
          borderRadius: '14px',
          boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.04)',
          zIndex: 1000,
          maxHeight: '440px',
          overflowY: 'auto',
          padding: '14px',
        }}>
          
          {/* Light Category Filter Pills */}
          <div style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '10px',
            marginBottom: '10px',
            borderBottom: '1px solid #f1f5f9',
          }}>
            {[
              { id: 'all', label: language === 'si' ? 'සියල්ල' : 'All' },
              { id: 'children', label: t('Children') },
              { id: 'donations', label: t('Donations') },
              { id: 'meals', label: t('Meal Scheduling') },
              { id: 'inventory', label: t('View Inventory') },
              { id: 'staff', label: t('Staff Management') },
              { id: 'accounts', label: t('Bank Account') },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: activeCategory === tab.id ? colors.primary : '#e2e8f0',
                  fontSize: '12px',
                  fontWeight: activeCategory === tab.id ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  backgroundColor: activeCategory === tab.id ? colors.primary : '#f8fafc',
                  color: activeCategory === tab.id ? '#ffffff' : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              ⏳ {t("Loading...")}
            </div>
          ) : totalMatches === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>🔍</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                {language === 'si' ? 'පද්ධති වාර්තා හමු නොවීය' : 'No records matched your search'}
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px', color: '#94a3b8' }}>
                {language === 'si' ? 'වෙනත් නමක්, අංකයක්, හෝ කාණ්ඩයක් සෙවීමට උත්සාහ කරන්න' : 'Try searching by child name, donor ID, or category'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Children Results */}
              {matchedChildren.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Baby size={14} /> {t("Children")} ({matchedChildren.length})
                  </div>
                  {matchedChildren.map(c => (
                    <div
                      key={c._id}
                      onClick={() => handleSelect('/portal/children')}
                      style={{
                        padding: '9px 12px', borderRadius: '10px', backgroundColor: '#ffffff',
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '4px', border: '1px solid #f1f5f9', transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          ID: <span style={{ color: colors.primary, fontWeight: 600 }}>{c.childID}</span> | {t("Gender")}: {t(c.gender)}
                        </div>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              )}

              {/* Donations Results */}
              {matchedDonations.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: colors.warning, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Heart size={14} /> {t("Donations")} ({matchedDonations.length})
                  </div>
                  {matchedDonations.map(d => (
                    <div
                      key={d._id}
                      onClick={() => handleSelect('/portal/donations')}
                      style={{
                        padding: '9px 12px', borderRadius: '10px', backgroundColor: '#ffffff',
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '4px', border: '1px solid #f1f5f9', transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{d.donorID?.name || 'Donor Contribution'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {t("Type")}: {t(d.type)} | {d.amount ? `LKR ${d.amount.toLocaleString()}` : `${d.quantity} units`}
                        </div>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              )}

              {/* Meals Results */}
              {matchedMeals.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} /> {t("Meal Scheduling")} ({matchedMeals.length})
                  </div>
                  {matchedMeals.map(m => (
                    <div
                      key={m._id}
                      onClick={() => handleSelect('/portal/meals')}
                      style={{
                        padding: '9px 12px', borderRadius: '10px', backgroundColor: '#ffffff',
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '4px', border: '1px solid #f1f5f9', transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                          {m.donorID?.name || 'Meal Sponsorship'} ({t(m.mealType)})
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {m.occasion ? `🎉 ${m.occasion}` : `${m.quantity} ${t("portions")}`}
                        </div>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              )}

              {/* Inventory Results */}
              {matchedInventory.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: colors.success, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={14} /> {t("Inventory Management")} ({matchedInventory.length})
                  </div>
                  {matchedInventory.map(i => (
                    <div
                      key={i._id}
                      onClick={() => handleSelect('/portal/inventory')}
                      style={{
                        padding: '9px 12px', borderRadius: '10px', backgroundColor: '#ffffff',
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '4px', border: '1px solid #f1f5f9', transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{i.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {t("Category")}: {t(i.category)} | {t("Stock Quantity")}: {i.quantity} {i.unit}
                        </div>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              )}

              {/* Staff Results */}
              {matchedStaff.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#9333ea', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} /> {t("Staff Management")} ({matchedStaff.length})
                  </div>
                  {matchedStaff.map(s => (
                    <div
                      key={s._id}
                      onClick={() => handleSelect('/portal/staff')}
                      style={{
                        padding: '9px 12px', borderRadius: '10px', backgroundColor: '#ffffff',
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '4px', border: '1px solid #f1f5f9', transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{s.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {t("Role")}: {t(s.role)} | @{s.username}
                        </div>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              )}

              {/* Accounts Results */}
              {matchedAccounts.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: colors.success, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Landmark size={14} /> {t("Bank Accounts")} ({matchedAccounts.length})
                  </div>
                  {matchedAccounts.map(a => (
                    <div
                      key={a._id}
                      onClick={() => handleSelect('/portal/accounts')}
                      style={{
                        padding: '9px 12px', borderRadius: '10px', backgroundColor: '#ffffff',
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '4px', border: '1px solid #f1f5f9', transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{a.accountName} ({a.bankName})</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          Acc #: {a.accountNumber} | LKR {a.balance?.toLocaleString()}
                        </div>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
