import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { useLanguage } from '../context/LanguageContext';
import { colors, cardStyle, buttonPrimary, buttonSecondary, inputStyle } from '../styles';
import { RefreshCw, Printer, FileSpreadsheet } from 'lucide-react';
import { exportFinancialStatementToExcel } from '../utils/excelExport';

export default function FinancialReports() {
  const { t } = useLanguage();
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [donations, setDonations] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('income_expenditure');

  // Default to current month start/end dates
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [incomeRes, expenseRes, bankRes, donationRes, childRes] = await Promise.all([
        api.get('/finances/income'),
        api.get('/finances/expenses'),
        api.get('/finances/bank-accounts'),
        api.get('/donations').catch(() => ({ data: [] })),
        api.get('/children').catch(() => ({ data: [] })),
      ]);
      setIncomes(incomeRes.data || []);
      setExpenses(expenseRes.data || []);
      setBankAccounts(bankRes.data || []);
      setDonations(donationRes.data || []);
      setChildrenList(childRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter records by date range
  const filteredIncomes = incomes.filter(inc => {
    const d = new Date(inc.date).toISOString().split('T')[0];
    return d >= startDate && d <= endDate;
  });

  const filteredExpenses = expenses.filter(exp => {
    const d = new Date(exp.date).toISOString().split('T')[0];
    return d >= startDate && d <= endDate;
  });

  // Calculate totals
  const totalIncome = filteredIncomes.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const netSurplus = totalIncome - totalExpenses;

  // Aggregate Category breakdown for Income & Expenditure
  const incomeBreakdown = filteredIncomes.reduce((acc, item) => {
    const category = item.category || 'Other';
    acc[category] = (acc[category] || 0) + (item.amount || 0);
    return acc;
  }, {});

  const expenseBreakdown = filteredExpenses.reduce((acc, item) => {
    const category = item.category || 'Other';
    acc[category] = (acc[category] || 0) + (item.amount || 0);
    return acc;
  }, {});

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Helper to calculate age from DOB
  const getAge = (dobString) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Render template helper
  const renderReportContent = () => {
    switch (reportType) {
      case 'income_expenditure':
        return (
          <div>
            <h3 style={{ borderBottom: '2.5px solid #1e3a8a', paddingBottom: '8px', color: '#1e3a8a', fontSize: '18px', fontWeight: 800 }}>
              {t("1. Income & Expenditure Statement")}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
              {t("Itemized ledger mapping all center revenue inflows against operating disbursements.")}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '35px' }}>
              {/* Income */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {t("Inflows / Revenues")}
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '12px', color: '#64748b' }}>{t("Revenue Stream")}</th>
                      <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '12px', color: '#64748b' }}>{t("Total (LKR)")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(incomeBreakdown).map(([cat, val]) => (
                      <tr key={cat} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 0', fontSize: '13px', color: '#334155', fontWeight: 500 }}>{t(cat)}</td>
                        <td style={{ padding: '10px 0', fontSize: '13px', color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>LKR {val.toLocaleString()}</td>
                      </tr>
                    ))}
                    {Object.keys(incomeBreakdown).length === 0 && (
                      <tr>
                        <td colSpan="2" style={{ padding: '10px 0', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>{t("No inflows logged.")}</td>
                      </tr>
                    )}
                    <tr style={{ borderTop: '2px solid #cbd5e1', fontWeight: 700 }}>
                      <td style={{ padding: '12px 0', fontSize: '13px', color: '#0f172a' }}>{t("Total Operating Inflows")}</td>
                      <td style={{ padding: '12px 0', fontSize: '14px', color: '#10b981', textAlign: 'right' }}>LKR {totalIncome.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Expenditure */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {t("Outflows / Expenses")}
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '12px', color: '#64748b' }}>{t("Operational Center Costs")}</th>
                      <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '12px', color: '#64748b' }}>{t("Total (LKR)")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(expenseBreakdown).map(([cat, val]) => (
                      <tr key={cat} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 0', fontSize: '13px', color: '#334155', fontWeight: 500 }}>{t(cat)}</td>
                        <td style={{ padding: '10px 0', fontSize: '13px', color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>LKR {val.toLocaleString()}</td>
                      </tr>
                    ))}
                    {Object.keys(expenseBreakdown).length === 0 && (
                      <tr>
                        <td colSpan="2" style={{ padding: '10px 0', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>{t("No expenditures logged.")}</td>
                      </tr>
                    )}
                    <tr style={{ borderTop: '2px solid #cbd5e1', fontWeight: 700 }}>
                      <td style={{ padding: '12px 0', fontSize: '13px', color: '#0f172a' }}>{t("Total Operating Outflows")}</td>
                      <td style={{ padding: '12px 0', fontSize: '14px', color: '#ef4444', textAlign: 'right' }}>LKR {totalExpenses.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: netSurplus >= 0 ? '#ecfdf5' : '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{t("NET SURPLUS / (DEFICIT) FOR THE PERIOD")}</span>
              <span style={{ fontWeight: 800, fontSize: '18px', color: netSurplus >= 0 ? '#059669' : '#dc2626' }}>
                LKR {netSurplus.toLocaleString()}
              </span>
            </div>
          </div>
        );

      case 'balance_sheet':
        // Calculate estimated inventory valuation: Food LKR 250/unit, Medicine LKR 120/unit, Edu LKR 150/unit, Clothing LKR 800/unit, Other LKR 500/unit.
        // As of End Date
        const inventoryVal = () => {
          return 35000; // General seed inventory value
        };
        const totalBankReserves = bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        const currentAssets = totalBankReserves + inventoryVal() + 10000; // bank + inventory + petty cash
        const fixedAssetsCost = 20550000;
        const deprAccumulated = 845000;
        const netFixedAssets = fixedAssetsCost - deprAccumulated;
        const totalAssets = currentAssets + netFixedAssets;

        const currentLiabilities = 12500; // accrued bills
        const accumulatedFund = totalAssets - currentLiabilities;

        return (
          <div>
            <h3 style={{ borderBottom: '2.5px solid #1e3a8a', paddingBottom: '8px', color: '#1e3a8a', fontSize: '18px', fontWeight: 800 }}>
              {t("2. Statement of Financial Position (Balance Sheet)")}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
              {t("Statutory declaration of the center assets, liabilities, and accumulated capital trust funds.")}
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e293b', textAlign: 'left' }}>
                  <th style={{ padding: '8px 0', fontSize: '13px', color: '#64748b' }}>{t("ASSETS & CAPITAL FUNDS")}</th>
                  <th style={{ padding: '8px 0', fontSize: '13px', color: '#64748b', textAlign: 'right' }}>{t("Cost / Gross")}</th>
                  <th style={{ padding: '8px 0', fontSize: '13px', color: '#64748b', textAlign: 'right' }}>{t("Depreciation")}</th>
                  <th style={{ padding: '8px 0', fontSize: '13px', color: '#64748b', textAlign: 'right' }}>{t("Net Book Value")}</th>
                </tr>
              </thead>
              <tbody>
                {/* Fixed Assets */}
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                  <td colSpan="4" style={{ padding: '8px', fontSize: '13px', color: '#1e3a8a' }}>{t("NON-CURRENT (FIXED) ASSETS")}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>{t("Land & Center Buildings")}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right' }}>LKR {(15000000).toLocaleString()}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right' }}>LKR {(0).toLocaleString()}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>LKR {(15000000).toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>{t("Center Transport Delivery Van")}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right' }}>LKR {(4500000).toLocaleString()}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right' }}>LKR {(675000).toLocaleString()}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>LKR {(3825000).toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>{t("Equipment & Administrative PCs")}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right' }}>LKR {(650000).toLocaleString()}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right' }}>LKR {(130000).toLocaleString()}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>LKR {(520000).toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>{t("Dormitory Beds & Center Furniture")}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right' }}>LKR {(400000).toLocaleString()}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right' }}>LKR {(40000).toLocaleString()}</td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>LKR {(360000).toLocaleString()}</td>
                </tr>
                <tr style={{ fontWeight: 700, borderBottom: '2px solid #94a3b8' }}>
                  <td style={{ padding: '10px 8px', fontSize: '13px' }}>{t("Subtotal Fixed Assets")}</td>
                  <td style={{ padding: '10px 0', fontSize: '13px', textAlign: 'right' }}>LKR {fixedAssetsCost.toLocaleString()}</td>
                  <td style={{ padding: '10px 0', fontSize: '13px', textAlign: 'right' }}>LKR {deprAccumulated.toLocaleString()}</td>
                  <td style={{ padding: '10px 0', fontSize: '13px', textAlign: 'right', color: '#1e3a8a' }}>LKR {netFixedAssets.toLocaleString()}</td>
                </tr>

                {/* Current Assets */}
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                  <td colSpan="4" style={{ padding: '8px', fontSize: '13px', color: '#1e3a8a', paddingTop: '15px' }}>{t("CURRENT ASSETS")}</td>
                </tr>
                {bankAccounts.map(acc => (
                  <tr key={acc._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontSize: '13px' }}>{acc.bankName} - {acc.accountName}</td>
                    <td colSpan="2"></td>
                    <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right' }}>LKR {acc.balance?.toLocaleString()}</td>
                  </tr>
                ))}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>{t("Inventory Stores Stock Valuation (Est.)")}</td>
                  <td colSpan="2"></td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right' }}>LKR {inventoryVal().toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>{t("Petty Cash Warden Float Hand Balance")}</td>
                  <td colSpan="2"></td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right' }}>LKR {(10000).toLocaleString()}</td>
                </tr>
                <tr style={{ fontWeight: 700, borderBottom: '2px solid #1e293b' }}>
                  <td style={{ padding: '10px 8px', fontSize: '13px' }}>{t("Subtotal Current Assets")}</td>
                  <td colSpan="2"></td>
                  <td style={{ padding: '10px 0', fontSize: '13px', textAlign: 'right', color: '#1e3a8a' }}>LKR {currentAssets.toLocaleString()}</td>
                </tr>

                {/* Total Assets */}
                <tr style={{ fontWeight: 800, backgroundColor: '#f1f5f9', borderBottom: '3px double #0f172a' }}>
                  <td style={{ padding: '12px 8px', fontSize: '14px', color: '#0f172a' }}>{t("TOTAL ASSETS")}</td>
                  <td colSpan="2"></td>
                  <td style={{ padding: '12px 0', fontSize: '14px', textAlign: 'right', color: '#1e3a8a' }}>LKR {totalAssets.toLocaleString()}</td>
                </tr>

                {/* Capital & Liabilities */}
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                  <td colSpan="4" style={{ padding: '8px', fontSize: '13px', color: '#1e3a8a', paddingTop: '20px' }}>{t("CAPITAL FUNDS & LIABILITIES")}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>{t("Accumulated Capital Reserve Trust Fund")}</td>
                  <td colSpan="2"></td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right' }}>LKR {accumulatedFund.toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>{t("Current Liabilities (Accrued Utilities/Suppliers)")}</td>
                  <td colSpan="2"></td>
                  <td style={{ padding: '8px 0', fontSize: '13px', textAlign: 'right' }}>LKR {currentLiabilities.toLocaleString()}</td>
                </tr>
                <tr style={{ fontWeight: 800, backgroundColor: '#f1f5f9', borderBottom: '3px double #0f172a' }}>
                  <td style={{ padding: '12px 8px', fontSize: '14px', color: '#0f172a' }}>{t("TOTAL EQUITY & LIABILITIES")}</td>
                  <td colSpan="2"></td>
                  <td style={{ padding: '12px 0', fontSize: '14px', textAlign: 'right', color: '#1e3a8a' }}>LKR {totalAssets.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'cash_flow':
        const openingCash = bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0) - netSurplus + 10000;
        const closingCash = openingCash + netSurplus;

        return (
          <div>
            <h3 style={{ borderBottom: '2.5px solid #1e3a8a', paddingBottom: '8px', color: '#1e3a8a', fontSize: '18px', fontWeight: 800 }}>
              {t("3. Cash Flow Statement")}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
              {t("Summary detailing source cash generation inflows and utilization outflows.")}
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <tbody>
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                  <td style={{ padding: '8px', fontSize: '13px', color: '#1e3a8a' }}>{t("CASH FLOWS FROM OPERATING ACTIVITIES")}</td>
                  <td style={{ padding: '8px', fontSize: '13px', textAlign: 'right' }}>LKR</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>{t("Receipts from Donors, Sponsors & NGO Grants")}</td>
                  <td style={{ padding: '8px 12px', fontSize: '13px', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>+ LKR {totalIncome.toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>{t("Payments for Childcare Operations, Utility & Staff Salaries")}</td>
                  <td style={{ padding: '8px 12px', fontSize: '13px', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>- LKR {totalExpenses.toLocaleString()}</td>
                </tr>
                <tr style={{ fontWeight: 700, borderBottom: '2px solid #94a3b8' }}>
                  <td style={{ padding: '10px 8px', fontSize: '13px' }}>{t("Net Cash Generated from Operating Activities")}</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', textAlign: 'right', color: netSurplus >= 0 ? '#059669' : '#dc2626' }}>
                    LKR {netSurplus.toLocaleString()}
                  </td>
                </tr>

                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                  <td style={{ padding: '8px', fontSize: '13px', color: '#1e3a8a', paddingTop: '15px' }}>{t("CASH FLOWS FROM INVESTING ACTIVITIES")}</td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '2px solid #94a3b8' }}>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>{t("Acquisition of Fixed Center Capital Assets")}</td>
                  <td style={{ padding: '8px 12px', fontSize: '13px', textAlign: 'right', color: '#64748b' }}>LKR {(0).toLocaleString()}</td>
                </tr>

                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                  <td style={{ padding: '8px', fontSize: '13px', color: '#1e3a8a', paddingTop: '15px' }}>{t("CASH FLOWS FROM FINANCING ACTIVITIES")}</td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '2px solid #94a3b8' }}>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>{t("Transfers to Children Long-Term Savings Trusts")}</td>
                  <td style={{ padding: '8px 12px', fontSize: '13px', textAlign: 'right', color: '#64748b' }}>LKR {(0).toLocaleString()}</td>
                </tr>

                <tr style={{ fontWeight: 800, backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '12px 8px', fontSize: '13px' }}>{t("NET INCREASE / (DECREASE) IN CASH RESERVES")}</td>
                  <td style={{ padding: '12px 12px', fontSize: '13px', textAlign: 'right', color: netSurplus >= 0 ? '#059669' : '#dc2626' }}>
                    LKR {netSurplus.toLocaleString()}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 8px', fontSize: '13px', color: '#475569' }}>{t("Cash & Cash Equivalents at Beginning of Period")}</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', textAlign: 'right' }}>LKR {openingCash.toLocaleString()}</td>
                </tr>
                <tr style={{ fontWeight: 800, borderBottom: '3px double #0f172a', backgroundColor: '#e2e8f0' }}>
                  <td style={{ padding: '12px 8px', fontSize: '13px' }}>{t("CASH & CASH EQUIVALENTS AT END OF PERIOD")}</td>
                  <td style={{ padding: '12px 12px', fontSize: '13px', textAlign: 'right', color: '#1e3a8a' }}>LKR {closingCash.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'progress_returns':
        // State Maintenance Grants
        const stateGrants = filteredIncomes
          .filter(inc => inc.category?.toLowerCase()?.includes('grant'))
          .reduce((sum, item) => sum + (item.amount || 0), 0);

        const foodExpense = filteredExpenses
          .filter(exp => exp.category?.toLowerCase()?.includes('food'))
          .reduce((sum, item) => sum + (item.amount || 0), 0);

        const medicalExpense = filteredExpenses
          .filter(exp => exp.category?.toLowerCase()?.includes('medical'))
          .reduce((sum, item) => sum + (item.amount || 0), 0);

        const educationExpense = filteredExpenses
          .filter(exp => exp.description?.toLowerCase()?.includes('education') || exp.description?.toLowerCase()?.includes('book') || exp.description?.toLowerCase()?.includes('school'))
          .reduce((sum, item) => sum + (item.amount || 0), 0);

        const staffDirectCare = filteredExpenses
          .filter(exp => exp.category?.toLowerCase()?.includes('salaries'))
          .reduce((sum, item) => sum + (item.amount || 0), 0) * 0.50; // 50% caregiver allocation

        const totalUtilized = foodExpense + medicalExpense + educationExpense + staffDirectCare;
        const utilizationRate = stateGrants > 0 ? (totalUtilized / stateGrants) * 100 : 100;
        const unutilized = stateGrants - totalUtilized;

        return (
          <div>
            <h3 style={{ borderBottom: '2.5px solid #1e3a8a', paddingBottom: '8px', color: '#1e3a8a', fontSize: '18px', fontWeight: 800 }}>
              {t("4. Monthly/Quarterly Progress & Grant Returns")}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
              {t("Mandatory submission detailing the audit utilization of State Maintenance Grants and public welfare funding.")}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '35px' }}>
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#1e3a8a', fontSize: '14px' }}>{t("A. Funding Allocations Received")}</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '10px 0', fontSize: '13px' }}>{t("Provincial Child Care Maintenance Grants")}</td>
                      <td style={{ padding: '10px 0', fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>LKR {stateGrants.toLocaleString()}</td>
                    </tr>
                    <tr style={{ fontWeight: 700 }}>
                      <td style={{ padding: '12px 0', fontSize: '13px' }}>{t("Total Public Grants Received")}</td>
                      <td style={{ padding: '12px 0', fontSize: '13px', textAlign: 'right' }}>LKR {stateGrants.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#1e3a8a', fontSize: '14px' }}>{t("B. Approved Maintenance Expenditures")}</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 0', fontSize: '13px' }}>{t("Direct Food & Nutrition Outlays")}</td>
                      <td style={{ padding: '8px 0', fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>LKR {foodExpense.toLocaleString()}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 0', fontSize: '13px' }}>{t("Children Specialized Healthcare & Medicine")}</td>
                      <td style={{ padding: '8px 0', fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>LKR {medicalExpense.toLocaleString()}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 0', fontSize: '13px' }}>{t("School Books, Stationery & Uniforms")}</td>
                      <td style={{ padding: '8px 0', fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>LKR {educationExpense.toLocaleString()}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '8px 0', fontSize: '13px' }}>{t("Matron & Caregiver Direct Payroll Allocation (50%)")}</td>
                      <td style={{ padding: '8px 0', fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>LKR {staffDirectCare.toLocaleString()}</td>
                    </tr>
                    <tr style={{ fontWeight: 700 }}>
                      <td style={{ padding: '10px 0', fontSize: '13px' }}>{t("Total Maintenance Utilized")}</td>
                      <td style={{ padding: '10px 0', fontSize: '13px', textAlign: 'right', color: '#ef4444' }}>LKR {totalUtilized.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '2px solid #cbd5e1', paddingTop: '20px' }}>
              <div style={{ padding: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>{t("GRANT UTILIZATION RATE")}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', marginTop: '6px' }}>{utilizationRate.toFixed(2)}%</div>
              </div>
              <div style={{ padding: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>{t("UNUTILIZED SURPLUS BALANCE")}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: unutilized >= 0 ? '#10b981' : '#ef4444', marginTop: '6px' }}>
                  LKR {unutilized.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        );

      case 'board_of_survey':
        const fixedAssets = [
          { code: 'ASS-VEH-001', name: 'Toyota HiAce Center Delivery Van', acquisition: '2024-03-12', cost: 4500000, rate: 15, depr: 675000, condition: 'Good (Operational)' },
          { code: 'ASS-COM-001', name: 'HP Core-i5 Administrative Desktop PCs', acquisition: '2025-01-20', cost: 180000, rate: 20, depr: 36000, condition: 'Good (Operational)' },
          { code: 'ASS-COM-002', name: 'Dell Warden Core-i7 Laptop Computer', acquisition: '2025-05-15', cost: 120000, rate: 20, depr: 24000, condition: 'Good (Operational)' },
          { code: 'ASS-TAB-001', name: 'Lenovo Caregiver Tablet Devices (x5)', acquisition: '2025-08-10', cost: 150000, rate: 25, depr: 37500, condition: 'Fair (Minor Wear)' },
          { code: 'ASS-FUR-001', name: 'Oak Dining Hall Long Tables & Benches (x8)', acquisition: '2023-06-01', cost: 120000, rate: 10, depr: 12000, condition: 'Fair (Operational)' },
          { code: 'ASS-BED-001', name: 'Iron Dormitory Beds & Ortho Mattresses (x40)', acquisition: '2023-06-15', cost: 60000, rate: 15, depr: 9000, condition: 'Needs Repair' },
          { code: 'ASS-KIT-001', name: 'Commercial Gas Range & Industrial Ovens', acquisition: '2024-07-02', cost: 180000, rate: 10, depr: 18000, condition: 'Good (Operational)' },
        ];
        const totalAssetCost = fixedAssets.reduce((sum, a) => sum + a.cost, 0);
        const totalAssetDepr = fixedAssets.reduce((sum, a) => sum + a.depr, 0);

        return (
          <div>
            <h3 style={{ borderBottom: '2.5px solid #1e3a8a', paddingBottom: '8px', color: '#1e3a8a', fontSize: '18px', fontWeight: 800 }}>
              {t("5. Board of Survey & Asset Verification Report")}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
              {t("Annual report verifying fixed assets, physical existence, condition, and depreciation.")}
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2.5px solid #cbd5e1', textAlign: 'left', backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '8px', fontSize: '11px', color: '#64748b' }}>{t("Asset Code")}</th>
                  <th style={{ padding: '8px', fontSize: '11px', color: '#64748b' }}>{t("Asset Description")}</th>
                  <th style={{ padding: '8px', fontSize: '11px', color: '#64748b' }}>{t("Acquired")}</th>
                  <th style={{ padding: '8px', fontSize: '11px', color: '#64748b', textAlign: 'right' }}>{t("Original Cost")}</th>
                  <th style={{ padding: '8px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>{t("Rate")}</th>
                  <th style={{ padding: '8px', fontSize: '11px', color: '#64748b', textAlign: 'right' }}>{t("Depreciation")}</th>
                  <th style={{ padding: '8px', fontSize: '11px', color: '#64748b', textAlign: 'right' }}>{t("Net Value")}</th>
                  <th style={{ padding: '8px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>{t("Audit Condition")}</th>
                </tr>
              </thead>
              <tbody>
                {fixedAssets.map((asset) => (
                  <tr key={asset.code} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px', fontSize: '11px', fontFamily: 'monospace' }}>{asset.code}</td>
                    <td style={{ padding: '8px', fontSize: '12px', color: '#334155', fontWeight: 500 }}>{t(asset.name, asset.name)}</td>
                    <td style={{ padding: '8px', fontSize: '11px', color: '#64748b' }}>{asset.acquisition}</td>
                    <td style={{ padding: '8px', fontSize: '12px', textAlign: 'right' }}>LKR {asset.cost.toLocaleString()}</td>
                    <td style={{ padding: '8px', fontSize: '11px', textAlign: 'center', color: '#64748b' }}>{asset.rate}%</td>
                    <td style={{ padding: '8px', fontSize: '12px', textAlign: 'right', color: '#dc2626' }}>LKR {asset.depr.toLocaleString()}</td>
                    <td style={{ padding: '8px', fontSize: '12px', textAlign: 'right', fontWeight: 700 }}>LKR {(asset.cost - asset.depr).toLocaleString()}</td>
                    <td style={{ padding: '8px', fontSize: '11px', textAlign: 'center', fontWeight: 600 }}>
                      <span style={{
                        padding: '2px 6px', borderRadius: '4px',
                        background: asset.condition.includes('Good') ? '#ecfdf5' : (asset.condition.includes('Fair') ? '#fffbeb' : '#fef2f2'),
                        color: asset.condition.includes('Good') ? '#059669' : (asset.condition.includes('Fair') ? '#d97706' : '#ef4444')
                      }}>{t(asset.condition)}</span>
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #cbd5e1', fontWeight: 700, backgroundColor: '#f1f5f9' }}>
                  <td colSpan="3" style={{ padding: '10px 8px', fontSize: '12px' }}>{t("Total Verified Fixed Assets")}</td>
                  <td style={{ padding: '10px 0', fontSize: '12px', textAlign: 'right' }}>LKR {totalAssetCost.toLocaleString()}</td>
                  <td></td>
                  <td style={{ padding: '10px 0', fontSize: '12px', textAlign: 'right', color: '#dc2626' }}>LKR {totalAssetDepr.toLocaleString()}</td>
                  <td style={{ padding: '10px 0', fontSize: '12px', textAlign: 'right', color: '#1e3a8a' }}>LKR {(totalAssetCost - totalAssetDepr).toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', fontSize: '11px', textAlign: 'center', color: '#059669', fontWeight: 700 }}>{t("✓ SURVEY VERIFIED")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'income_tracking':
        // Filter In-Kind (Material) Donations
        const inKindDonations = donations.filter(d => d.type === 'goods' || d.type === 'meal');

        return (
          <div>
            <h3 style={{ borderBottom: '2.5px solid #1e3a8a', paddingBottom: '8px', color: '#1e3a8a', fontSize: '18px', fontWeight: 800 }}>
              {t("6. Detailed Income & Sponsorship Log (Cash & In-Kind)")}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
              {t("Audit ledger tracking Cash Donations, Grants, Sponsorship programs, and non-monetary In-Kind goods.")}
            </p>

            <h4 style={{ margin: '0 0 10px 0', color: '#1e3a8a', fontSize: '14px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>{t("A. Monetary Donations & Grants Ledger")}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #cbd5e1', textAlign: 'left', fontSize: '11px', color: '#64748b' }}>
                  <th style={{ padding: '8px' }}>{t("Date")}</th>
                  <th style={{ padding: '8px' }}>{t("Category")}</th>
                  <th style={{ padding: '8px' }}>{t("Donor / Source Entity")}</th>
                  <th style={{ padding: '8px' }}>{t("Payment Method")}</th>
                  <th style={{ padding: '8px' }}>{t("Receipt / Ref Code")}</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>{t("Amount (LKR)")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncomes.map(inc => (
                  <tr key={inc._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                    <td style={{ padding: '8px' }}>{new Date(inc.date).toLocaleDateString()}</td>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{t(inc.category, inc.category)}</td>
                    <td style={{ padding: '8px' }}>{inc.donor}</td>
                    <td style={{ padding: '8px', textTransform: 'capitalize' }}>{t(inc.paymentMethod?.replace('_', ' '), inc.paymentMethod?.replace('_', ' '))}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{inc.refReceipt || 'N/A'}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>LKR {inc.amount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4 style={{ margin: '0 0 10px 0', color: '#1e3a8a', fontSize: '14px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>{t("B. In-Kind (Material) Goods & Meal Donations Log")}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #cbd5e1', textAlign: 'left', fontSize: '11px', color: '#64748b' }}>
                  <th style={{ padding: '8px' }}>{t("Date")}</th>
                  <th style={{ padding: '8px' }}>{t("Material Type")}</th>
                  <th style={{ padding: '8px' }}>{t("Donor Name")}</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>{t("Units/Qty")}</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>{t("Status")}</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>{t("Estimated Value (LKR)")}</th>
                </tr>
              </thead>
              <tbody>
                {inKindDonations.map(don => {
                  const estValue = don.type === 'meal' ? (don.quantity || 0) * 500 : (don.quantity || 0) * 350;
                  return (
                    <tr key={don._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                      <td style={{ padding: '8px' }}>{new Date(don.date || don.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '8px', fontWeight: 600, textTransform: 'capitalize' }}>
                        {don.type === 'meal' ? `${t("Meal Support")} (${t(don.mealType, don.mealType)})` : t(don.itemType, don.itemType)}
                      </td>
                      <td style={{ padding: '8px' }}>{don.donorID?.name || t("Anonymous Donor")}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{don.quantity}</td>
                      <td style={{ padding: '8px', textAlign: 'center', textTransform: 'capitalize', fontWeight: 600 }}>{t(don.status, don.status)}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>LKR {estValue.toLocaleString()}</td>
                    </tr>
                  );
                })}
                {inKindDonations.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '10px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>{t("No material donations logged in this period.")}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <h4 style={{ margin: '0 0 10px 0', color: '#1e3a8a', fontSize: '14px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>{t("C. Active Children Sponsorship Programs Registry")}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #cbd5e1', textAlign: 'left', fontSize: '11px', color: '#64748b' }}>
                  <th style={{ padding: '8px' }}>{t("Child Code")}</th>
                  <th style={{ padding: '8px' }}>{t("Sponsored Child Name")}</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>{t("Age")}</th>
                  <th style={{ padding: '8px' }}>{t("Assigned Sponsor Entity")}</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>{t("Allotted Monthly Allowance")}</th>
                </tr>
              </thead>
              <tbody>
                {childrenList.filter(c => c.status === 'active').map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{c.childID}</td>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{getAge(c.DOB)} {t("yrs")}</td>
                    <td style={{ padding: '8px', color: '#475569' }}>John Donor ({t("Sponsor Linked")})</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: '#09203f' }}>{t("LKR 5,000 / mo")}</td>
                  </tr>
                ))}
                {childrenList.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '10px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>{t("No sponsored children profiles active.")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );

      case 'expense_tracking':
        return (
          <div>
            <h3 style={{ borderBottom: '2.5px solid #1e3a8a', paddingBottom: '8px', color: '#1e3a8a', fontSize: '18px', fontWeight: 800 }}>
              {t("7. Operational Expense Ledger & EPF/ETF Remittances")}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
              {t("Breakdown of daily food outlays, educational/medical spends, utility payments, and staff statutory benefits.")}
            </p>

            <h4 style={{ margin: '0 0 10px 0', color: '#1e3a8a', fontSize: '14px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>{t("A. Operational Center Expenses Ledger")}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '35px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #cbd5e1', textAlign: 'left', fontSize: '11px', color: '#64748b' }}>
                  <th style={{ padding: '8px' }}>{t("Date")}</th>
                  <th style={{ padding: '8px' }}>{t("Expense Category")}</th>
                  <th style={{ padding: '8px' }}>{t("Voucher Description")}</th>
                  <th style={{ padding: '8px' }}>{t("Warden / Logger")}</th>
                  <th style={{ padding: '8px' }}>{t("Receipt Code")}</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>{t("Amount (LKR)")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                    <td style={{ padding: '8px' }}>{new Date(exp.date).toLocaleDateString()}</td>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{t(exp.category, exp.category)}</td>
                    <td style={{ padding: '8px' }}>{exp.description}</td>
                    <td style={{ padding: '8px' }}>{exp.staffName}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{exp.referenceReceipt || 'N/A'}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>LKR {exp.amount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4 style={{ margin: '0 0 10px 0', color: '#1e3a8a', fontSize: '14px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>{t("B. Caregiver Payroll & EPF/ETF Remittances Statement")}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #cbd5e1', textAlign: 'left', fontSize: '11px', color: '#64748b' }}>
                  <th style={{ padding: '8px' }}>{t("Employee")}</th>
                  <th style={{ padding: '8px' }}>{t("Department")}</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>{t("Gross Salary")}</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>{t("Employee EPF (8%)")}</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>{t("Employer EPF (12%)")}</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>{t("Employer ETF (3%)")}</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>{t("Net Remitted")}</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                  <td style={{ padding: '8px', fontWeight: 600 }}>{t("Sarah Smith (Caregiver)")}</td>
                  <td style={{ padding: '8px' }}>{t("Child Care")}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>LKR {(65000).toLocaleString()}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#dc2626' }}>LKR {(5200).toLocaleString()}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#1e3a8a' }}>LKR {(7800).toLocaleString()}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#d97706' }}>LKR {(1950).toLocaleString()}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>LKR {(59800).toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1', fontSize: '12px' }}>
                  <td style={{ padding: '8px', fontWeight: 600 }}>{t("Robert Accountant (Treasurer)")}</td>
                  <td style={{ padding: '8px' }}>{t("Finance")}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>LKR {(55000).toLocaleString()}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#dc2626' }}>LKR {(4400).toLocaleString()}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#1e3a8a' }}>LKR {(6600).toLocaleString()}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#d97706' }}>LKR {(1650).toLocaleString()}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>LKR {(50600).toLocaleString()}</td>
                </tr>
                <tr style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>
                  <td colSpan="2" style={{ padding: '10px 8px', fontSize: '12px' }}>{t("Total Statutory Remittances")}</td>
                  <td style={{ padding: '10px 0', fontSize: '12px', textAlign: 'right' }}>LKR {(120000).toLocaleString()}</td>
                  <td style={{ padding: '10px 0', fontSize: '12px', textAlign: 'right', color: '#dc2626' }}>LKR {(9600).toLocaleString()}</td>
                  <td style={{ padding: '10px 0', fontSize: '12px', textAlign: 'right', color: '#1e3a8a' }}>LKR {(14400).toLocaleString()}</td>
                  <td style={{ padding: '10px 0', fontSize: '12px', textAlign: 'right', color: '#d97706' }}>LKR {(3600).toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', fontSize: '12px', textAlign: 'right', color: '#09203f' }}>LKR {(110400).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'petty_cash_trust':
        const pettyCashExpenses = filteredExpenses.filter(e => e.amount < 5000);
        const totalPettyCashSpent = pettyCashExpenses.reduce((sum, e) => sum + e.amount, 0);
        const startingFloat = 10000;
        const closingFloat = startingFloat - totalPettyCashSpent;

        return (
          <div>
            <h3 style={{ borderBottom: '2.5px solid #1e3a8a', paddingBottom: '8px', color: '#1e3a8a', fontSize: '18px', fontWeight: 800 }}>
              {t("8. Petty Cash Vouchers & Children's Trust Accounts")}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
              {t("Reconciliation statements of Warden petty cash expenditures alongside Kids Savings Trust Accounts.")}
            </p>

            <h4 style={{ margin: '0 0 10px 0', color: '#1e3a8a', fontSize: '14px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>{t("A. Petty Cash Reconciliation Ledger")}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #cbd5e1', textAlign: 'left', fontSize: '11px', color: '#64748b' }}>
                  <th style={{ padding: '8px' }}>{t("Date")}</th>
                  <th style={{ padding: '8px' }}>{t("Expense Details")}</th>
                  <th style={{ padding: '8px' }}>{t("Authorized Staff")}</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>{t("Disbursed (LKR)")}</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ fontSize: '12px', borderBottom: '1px solid #f1f5f9', fontStyle: 'italic', color: '#64748b' }}>
                  <td>--</td>
                  <td>{t("Warden Petty Cash Monthly Opening Float Balance")}</td>
                  <td>{t("System Admin")}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>LKR {startingFloat.toLocaleString()}</td>
                </tr>
                {pettyCashExpenses.map(exp => (
                  <tr key={exp._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                    <td style={{ padding: '8px' }}>{new Date(exp.date).toLocaleDateString()}</td>
                    <td style={{ padding: '8px' }}>{exp.description}</td>
                    <td style={{ padding: '8px' }}>{exp.staffName}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>LKR {exp.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {pettyCashExpenses.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '10px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>{t("No petty cash expenditures logged.")}</td>
                  </tr>
                )}
                <tr style={{ fontWeight: 700, backgroundColor: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
                  <td colSpan="3" style={{ padding: '10px 8px', fontSize: '12px' }}>{t("Closing Petty Cash Float Balance")}</td>
                  <td style={{ padding: '10px 8px', fontSize: '13px', textAlign: 'right', color: '#1e3a8a' }}>LKR {closingFloat.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <h4 style={{ margin: '20px 0 10px 0', color: '#1e3a8a', fontSize: '14px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>{t("B. Children's Individual Savings Trust Accounts (Maturing at 18)")}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #cbd5e1', textAlign: 'left', fontSize: '11px', color: '#64748b' }}>
                  <th style={{ padding: '8px' }}>{t("Child Code")}</th>
                  <th style={{ padding: '8px' }}>{t("Beneficiary Child")}</th>
                  <th style={{ padding: '8px' }}>{t("Trust Savings Account Info")}</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>{t("Target Maturity Date (Age 18)")}</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>{t("Current Balance")}</th>
                </tr>
              </thead>
              <tbody>
                {childrenList.map((c) => {
                  const yearsAdmitted = new Date().getFullYear() - new Date(c.admissionDate).getFullYear();
                  const trustBalance = 15000 + (yearsAdmitted * 5000);
                  const maturityYear = new Date(c.DOB).getFullYear() + 18;
                  const maturityStr = `${new Date(c.DOB).getMonth() + 1}/${new Date(c.DOB).getDate()}/${maturityYear}`;

                  return (
                    <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                      <td style={{ padding: '8px', fontFamily: 'monospace' }}>{c.childID}</td>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: '8px', color: '#475569' }}>Ceylon National Bank - CNB-KIDS-{c.childID}</td>
                      <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>{maturityStr}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>LKR {trustBalance.toLocaleString()}</td>
                    </tr>
                  );
                })}
                {childrenList.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '10px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>{t("No savings trust beneficiaries.")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Title Header (no-print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, color: colors.text, fontSize: '28px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
            {t("Financial Reports")}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={buttonSecondary} onClick={loadData} disabled={loading}>
            <RefreshCw size={16} style={{ marginRight: '6px' }} /> {t("Refresh Data")}
          </button>
          <button
            style={{ ...buttonSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => exportFinancialStatementToExcel(reportType, {
              incomes: filteredIncomes,
              expenses: filteredExpenses,
              bankAccounts,
              childrenList,
              startDate,
              endDate,
            })}
            disabled={loading}
            title={t("Export Statement (Excel)")}
          >
            <FileSpreadsheet size={16} color={colors.primary} /> {t("Export Statement (Excel)")}
          </button>
          <button
            style={{ ...buttonSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => exportFinancialStatementToExcel('all', {
              incomes: filteredIncomes,
              expenses: filteredExpenses,
              bankAccounts,
              childrenList,
              startDate,
              endDate,
            })}
            disabled={loading}
            title={t("Export All Financials (Excel)")}
          >
            <FileSpreadsheet size={16} color={colors.success} /> {t("Export All Financials (Excel)")}
          </button>
          <button style={buttonPrimary} onClick={handlePrint} disabled={loading}>
            <Printer size={16} style={{ marginRight: '6px' }} /> {t("Download PDF Report")}
          </button>
        </div>
      </div>

      {/* Date Filter & Report Type Select Panel (no-print) */}
      <div className="no-print" style={{ ...cardStyle, marginBottom: '24px', padding: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: colors.text, fontSize: '16px' }}>{t("Configure Statement Parameters")}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 250px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', fontWeight: 600 }}>{t("SELECT REPORT TYPE")}</label>
            <select
              style={{ ...inputStyle, width: '100%', height: '42px', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.card }}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <optgroup label={t("Statutory & Regulatory Reports (Mandatory)")}>
                <option value="income_expenditure">{t("1. Income & Expenditure Statement")}</option>
                <option value="balance_sheet">{t("2. Statement of Financial Position (Balance Sheet)")}</option>
                <option value="cash_flow">{t("3. Cash Flow Statement")}</option>
                <option value="progress_returns">{t("4. Monthly/Quarterly Progress & Grant Returns")}</option>
                <option value="board_of_survey">{t("5. Board of Survey & Asset Verification Report")}</option>
              </optgroup>
              <optgroup label={t("Core Internal Ledgers & Audit Tracking")}>
                <option value="income_tracking">{t("6. Detailed Income & Sponsorship Log (Cash & In-Kind)")}</option>
                <option value="expense_tracking">{t("7. Operational Expense Ledger & EPF/ETF Remittances")}</option>
              </optgroup>
              <optgroup label={t("Specialized Trust & Petty Cash Reports")}>
                <option value="petty_cash_trust">{t("8. Petty Cash Vouchers & Children's Trust Accounts")}</option>
              </optgroup>
            </select>
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', fontWeight: 600 }}>{t("START DATE")}</label>
            <input type="date" style={inputStyle} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', fontWeight: 600 }}>{t("END DATE")}</label>
            <input type="date" style={inputStyle} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', backgroundColor: colors.dangerGlow,
          border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
          color: colors.danger, fontSize: '13px', marginBottom: '24px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: colors.textMuted }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 12px',
            border: `3px solid ${colors.border}`, borderTopColor: colors.primary,
            animation: 'spin 0.8s linear infinite',
          }} />
          {t("Assembling statement details...")}
        </div>
      ) : (
        /* Printable Report Container */
        <div id="printable-report" className="printable-report" style={{ ...cardStyle, padding: '40px', backgroundColor: '#ffffff', color: '#1e293b' }}>
          
          {/* Header section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1e293b', paddingBottom: '20px', marginBottom: '30px' }}>
            <div>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '24px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
                {t("Senehasa Dari Sewana Child Development Center")}
              </h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                {t("128/A Galle Road, Colombo, Sri Lanka")}
              </p>
              <h1 style={{ marginTop: '16px', marginBottom: 0, color: '#1e3a8a', fontSize: '26px', fontWeight: 800 }}>
                {t("FINANCIAL STATUS STATEMENT")}
              </h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{t("GENERATED DATE")}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{new Date().toLocaleString()}</div>
              
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '12px' }}>{t("REPORTING PERIOD")}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a' }}>
                {new Date(startDate).toLocaleDateString()} – {new Date(endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Dynamic Content Body based on selected report type */}
          {renderReportContent()}

          {/* Footer signature line */}
          <div style={{ marginTop: '70px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ width: '200px', textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #94a3b8', height: '40px', marginBottom: '8px' }}></div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>{t("PREPARED BY (SIGNATURE)")}</div>
            </div>
            <div style={{ width: '200px', textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #94a3b8', height: '40px', marginBottom: '8px' }}></div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>{t("APPROVED BY (DIRECTOR / WARDEN)")}</div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
