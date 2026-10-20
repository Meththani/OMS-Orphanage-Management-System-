import * as XLSX from 'xlsx';

/**
 * Utility to calculate column widths dynamically based on content length
 */
function fitColumns(ws, dataArray) {
  if (!dataArray || dataArray.length === 0) return;
  const colWidths = {};
  
  // Header lengths
  const keys = Object.keys(dataArray[0]);
  keys.forEach((key, idx) => {
    colWidths[idx] = Math.max(String(key).length, 12);
  });

  // Data row lengths
  dataArray.forEach(row => {
    keys.forEach((key, idx) => {
      const val = row[key];
      const len = val !== null && val !== undefined ? String(val).length : 0;
      if (len > colWidths[idx]) {
        colWidths[idx] = Math.min(len + 3, 50); // cap max width at 50 for readability
      }
    });
  });

  ws['!cols'] = Object.keys(colWidths).map(idx => ({ wch: colWidths[idx] }));
}

/**
 * Download a single-sheet Excel file
 */
export function exportToExcel(data, fileName, sheetName = 'Sheet1') {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  fitColumns(ws, data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31)); // Excel limit is 31 chars

  const sanitizedFileName = (fileName || 'export').endsWith('.xlsx')
    ? fileName
    : `${fileName || 'export'}.xlsx`;

  XLSX.writeFile(wb, sanitizedFileName);
}

/**
 * Download a multi-sheet Excel file
 * @param {Array<{ sheetName: string, data: Array<object> }>} sheets
 * @param {string} fileName
 */
export function exportMultipleSheetsToExcel(sheets, fileName) {
  if (!sheets || sheets.length === 0) {
    alert('No sheets data available to export.');
    return;
  }

  const wb = XLSX.utils.book_new();

  sheets.forEach(({ sheetName, data }) => {
    const safeSheetName = (sheetName || 'Sheet').substring(0, 31);
    const safeData = data && data.length > 0 ? data : [{ 'Notice': 'No records found' }];
    const ws = XLSX.utils.json_to_sheet(safeData);
    fitColumns(ws, safeData);
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  });

  const sanitizedFileName = (fileName || 'master_export').endsWith('.xlsx')
    ? fileName
    : `${fileName || 'master_export'}.xlsx`;

  XLSX.writeFile(wb, sanitizedFileName);
}

const formatDate = (val) => {
  if (!val) return 'N/A';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toISOString().split('T')[0];
  } catch {
    return String(val);
  }
};

const formatCurrency = (val) => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

// ─── 1. CHILDREN DIRECTORY EXPORT ───
export function exportChildrenToExcel(children) {
  const rows = (children || []).map((c, idx) => {
    const birthDate = c.DOB ? new Date(c.DOB) : null;
    let age = 'N/A';
    if (birthDate && !isNaN(birthDate.getTime())) {
      const diff = Date.now() - birthDate.getTime();
      age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }

    return {
      '#': idx + 1,
      'Child ID': c.childID || 'N/A',
      'Full Name': c.name || 'N/A',
      'Gender': (c.gender || '').toUpperCase(),
      'Date of Birth': formatDate(c.DOB),
      'Age (Years)': age,
      'Admission Date': formatDate(c.admissionDate),
      'Status': (c.status || 'active').toUpperCase(),
      'Blood Group': c.bloodType || 'Unknown',
      'Allergies / Special Needs': c.allergies || 'None',
      'Guardian Name': c.guardianInfo?.name || 'N/A',
      'Guardian Relation': c.guardianInfo?.relation || 'N/A',
      'Guardian Contact': c.guardianInfo?.contact || 'N/A',
      'Registered At': formatDate(c.createdAt),
    };
  });

  const today = new Date().toISOString().split('T')[0];
  exportToExcel(rows, `OMS_Children_Directory_${today}.xlsx`, 'Children');
}

// ─── 2. STAFF ROSTER EXPORT ───
export function exportStaffToExcel(staffList) {
  const rows = (staffList || []).map((s, idx) => ({
    '#': idx + 1,
    'Full Name': s.name || 'N/A',
    'Username': s.username || 'N/A',
    'System Role': (s.role || '').toUpperCase(),
    'Job Role / Title': s.jobRole || 'Staff Member',
    'Department': s.department || 'Operations',
    'Contact Number': s.contactDetails || 'N/A',
    'NIC Number': s.nic || 'N/A',
    'Date of Birth': formatDate(s.DOB),
    'Account Status': s.isActive ? 'ACTIVE' : 'DEACTIVATED',
    'Account Created': formatDate(s.createdAt),
  }));

  const today = new Date().toISOString().split('T')[0];
  exportToExcel(rows, `OMS_Staff_Roster_${today}.xlsx`, 'Staff');
}

// ─── 3. EXPENSES LEDGER EXPORT ───
export function exportExpensesToExcel(expenses, bankAccounts = []) {
  const bankMap = {};
  bankAccounts.forEach(acc => {
    bankMap[acc._id] = `${acc.bankName} (${acc.accountName})`;
  });

  const rows = (expenses || []).map((exp, idx) => ({
    '#': idx + 1,
    'Expense Date': formatDate(exp.date),
    'Category': exp.category || 'Other',
    'Amount (LKR)': formatCurrency(exp.amount),
    'Claimed / Recorded By': exp.staffName || 'Staff',
    'Description': exp.description || 'N/A',
    'Bank Account': bankMap[exp.bankAccount] || 'Cash / Default Float',
    'Receipt / Invoice Ref': exp.referenceReceipt || 'N/A',
    'Has Proof Slip': exp.proofOfReceipt?.fileData ? 'YES' : 'NO',
  }));

  const today = new Date().toISOString().split('T')[0];
  exportToExcel(rows, `OMS_Expenses_Ledger_${today}.xlsx`, 'Expenses');
}

// ─── 4. INCOME LEDGER EXPORT ───
export function exportIncomeToExcel(incomes, bankAccounts = []) {
  const bankMap = {};
  bankAccounts.forEach(acc => {
    bankMap[acc._id] = `${acc.bankName} (${acc.accountName})`;
  });

  const rows = (incomes || []).map((inc, idx) => ({
    '#': idx + 1,
    'Income Date': formatDate(inc.date),
    'Category': inc.category || 'General Inflow',
    'Amount (LKR)': formatCurrency(inc.amount),
    'Payment Method': (inc.paymentMethod || 'cash').toUpperCase(),
    'Donor / Payer Source': inc.donor || 'Anonymous',
    'Bank Account Credited': bankMap[inc.bankAccount] || 'Default Bank Account',
    'Receipt Reference': inc.refReceipt || 'N/A',
    'Has Bank Slip': inc.proofOfReceipt?.fileData ? 'YES' : 'NO',
  }));

  const today = new Date().toISOString().split('T')[0];
  exportToExcel(rows, `OMS_Income_Ledger_${today}.xlsx`, 'Income');
}

// ─── 5. DONATIONS REGISTRY EXPORT ───
export function exportDonationsToExcel(donations) {
  const rows = (donations || []).map((d, idx) => {
    let contributionDetails = 'N/A';
    if (d.type === 'cash') contributionDetails = `LKR ${d.amount?.toLocaleString() || 0}`;
    else if (d.type === 'goods') contributionDetails = `${d.quantity || 1} x ${d.itemType || 'Goods'}`;
    else if (d.type === 'meal') contributionDetails = `${d.quantity || 1} x ${d.mealType || 'Meal'}${d.occasion ? ` (${d.occasion})` : ''}`;

    return {
      '#': idx + 1,
      'Donation ID': d.donationID || 'N/A',
      'Date': formatDate(d.date || d.createdAt),
      'Donor Name': d.donorID?.name || 'Anonymous Donor',
      'Donor Email': d.donorID?.email || 'N/A',
      'Donor Type': (d.donorID?.type || 'individual').toUpperCase(),
      'Donation Category': (d.type || 'cash').toUpperCase(),
      'Contribution Value / Items': contributionDetails,
      'Amount (LKR)': d.type === 'cash' ? formatCurrency(d.amount) : (d.estimatedCost ? formatCurrency(d.estimatedCost) : 0),
      'Payment Method': (d.paymentMethod || d.advancePaymentMethod || 'N/A').toUpperCase(),
      'Status': (d.status || 'pending').toUpperCase(),
      'Receipt Reference': d.receiptRef || 'N/A',
      'Meal Slot': d.mealType ? d.mealType.toUpperCase() : 'N/A',
      'Meal Date': d.mealDate ? formatDate(d.mealDate) : 'N/A',
      'Preparation': d.mealDonationType === 'bringyourown' ? 'Self-Catered' : 'Centre-Prepared',
      'Internal Notes': d.notes || d.dietaryNotes || 'N/A',
    };
  });

  const today = new Date().toISOString().split('T')[0];
  exportToExcel(rows, `OMS_Donations_Registry_${today}.xlsx`, 'Donations');
}

// ─── 6. MEAL BOOKINGS EXPORT ───
export function exportMealBookingsToExcel(meals) {
  const rows = (meals || []).map((m, idx) => ({
    '#': idx + 1,
    'Meal Date': formatDate(m.mealDate),
    'Meal Slot': (m.mealType || 'breakfast').toUpperCase(),
    'Donor Name': m.donorID?.name || 'Valued Donor',
    'Donor Phone': m.donorID?.contactDetails || 'N/A',
    'Beneficiary Children (All)': m.quantity || 50,
    'Preparation': m.mealDonationType === 'bringyourown' ? 'Self-Catered' : 'Centre-Prepared',
    'Estimated Cost (LKR)': formatCurrency(m.estimatedCost),
    'Booking Status': (m.status || 'pending').toUpperCase(),
    'Occasion / Reason': m.occasion || 'General Blessing',
    'Dietary / Special Prep Notes': m.dietaryNotes || 'None',
    'SMS Confirmation Sent': m.smsSent ? 'YES' : 'NO',
  }));

  const today = new Date().toISOString().split('T')[0];
  exportToExcel(rows, `OMS_Meal_Schedules_${today}.xlsx`, 'Meal Bookings');
}

// ─── 7. INVENTORY STOCK EXPORT ───
export function exportInventoryToExcel(items) {
  const rows = (items || []).map((it, idx) => ({
    '#': idx + 1,
    'Item No.': it.itemNumber || 'N/A',
    'Item Name': it.name || 'N/A',
    'Category': it.category || 'Other',
    'Current Stock': it.quantity || 0,
    'Unit of Measure': it.unit || 'units',
    'Stock Status': (it.status || 'in-stock').toUpperCase(),
    'Last Updated': formatDate(it.updatedAt),
  }));

  const today = new Date().toISOString().split('T')[0];
  exportToExcel(rows, `OMS_Inventory_Stock_${today}.xlsx`, 'Inventory');
}

// ─── 8. BANK ACCOUNTS EXPORT ───
export function exportBankAccountsToExcel(accounts) {
  const rows = (accounts || []).map((acc, idx) => ({
    '#': idx + 1,
    'Bank Name': acc.bankName || 'N/A',
    'Account Name': acc.accountName || 'N/A',
    'Account Number': acc.accountNumber || 'N/A',
    'Current Balance (LKR)': formatCurrency(acc.balance),
    'Created At': formatDate(acc.createdAt),
  }));

  const today = new Date().toISOString().split('T')[0];
  exportToExcel(rows, `OMS_Bank_Accounts_${today}.xlsx`, 'Bank Accounts');
}

// ─── 9. FINANCIAL STATEMENTS REPORT EXPORT ───
export function exportFinancialStatementToExcel(reportType, data) {
  const today = new Date().toISOString().split('T')[0];
  const { incomes = [], expenses = [], bankAccounts = [], childrenList = [], startDate, endDate } = data;

  if (reportType === 'income_expenditure') {
    const totalIn = incomes.reduce((s, i) => s + (i.amount || 0), 0);
    const totalOut = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const net = totalIn - totalOut;

    const rows = [
      { 'Section': 'REPORT HEADER', 'Category / Item': 'Statement of Income & Expenditure', 'Subtotal (LKR)': '', 'Total (LKR)': '' },
      { 'Section': 'PERIOD', 'Category / Item': `From ${startDate || 'Start'} to ${endDate || 'End'}`, 'Subtotal (LKR)': '', 'Total (LKR)': '' },
      { 'Section': '', 'Category / Item': '', 'Subtotal (LKR)': '', 'Total (LKR)': '' },
      { 'Section': 'REVENUE INFLOWS', 'Category / Item': 'Operating Revenue Streams', 'Subtotal (LKR)': '', 'Total (LKR)': '' },
    ];

    const incMap = {};
    incomes.forEach(i => {
      const cat = i.category || 'Other';
      incMap[cat] = (incMap[cat] || 0) + (i.amount || 0);
    });
    Object.entries(incMap).forEach(([cat, val]) => {
      rows.push({ 'Section': 'INFLOW', 'Category / Item': cat, 'Subtotal (LKR)': formatCurrency(val), 'Total (LKR)': '' });
    });
    rows.push({ 'Section': 'TOTAL INFLOWS', 'Category / Item': 'Total Operating Inflows', 'Subtotal (LKR)': '', 'Total (LKR)': formatCurrency(totalIn) });

    rows.push({ 'Section': '', 'Category / Item': '', 'Subtotal (LKR)': '', 'Total (LKR)': '' });
    rows.push({ 'Section': 'OPERATING OUTFLOWS', 'Category / Item': 'Disbursements & Center Costs', 'Subtotal (LKR)': '', 'Total (LKR)': '' });

    const expMap = {};
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      expMap[cat] = (expMap[cat] || 0) + (e.amount || 0);
    });
    Object.entries(expMap).forEach(([cat, val]) => {
      rows.push({ 'Section': 'OUTFLOW', 'Category / Item': cat, 'Subtotal (LKR)': formatCurrency(val), 'Total (LKR)': '' });
    });
    rows.push({ 'Section': 'TOTAL OUTFLOWS', 'Category / Item': 'Total Operating Outflows', 'Subtotal (LKR)': '', 'Total (LKR)': formatCurrency(totalOut) });

    rows.push({ 'Section': '', 'Category / Item': '', 'Subtotal (LKR)': '', 'Total (LKR)': '' });
    rows.push({ 'Section': 'NET RESULT', 'Category / Item': net >= 0 ? 'NET SURPLUS FOR THE PERIOD' : 'NET DEFICIT FOR THE PERIOD', 'Subtotal (LKR)': '', 'Total (LKR)': formatCurrency(net) });

    exportToExcel(rows, `OMS_Income_Expenditure_Statement_${today}.xlsx`, 'Income & Expenditure');
  } else if (reportType === 'balance_sheet') {
    const totalBank = bankAccounts.reduce((s, a) => s + (a.balance || 0), 0);
    const rows = [
      { 'Section': 'BALANCE SHEET', 'Item / Account': 'Statement of Financial Position', 'Amount (LKR)': '' },
      { 'Section': 'NON-CURRENT ASSETS', 'Item / Account': 'Land & Center Buildings', 'Amount (LKR)': 15000000 },
      { 'Section': 'NON-CURRENT ASSETS', 'Item / Account': 'Center Delivery Transport Van', 'Amount (LKR)': 3825000 },
      { 'Section': 'NON-CURRENT ASSETS', 'Item / Account': 'Administrative Computers & Equipment', 'Amount (LKR)': 520000 },
      { 'Section': 'NON-CURRENT ASSETS', 'Item / Account': 'Dormitory Furniture & Fixtures', 'Amount (LKR)': 360000 },
      { 'Section': 'SUBTOTAL FIXED ASSETS', 'Item / Account': 'Net Fixed Assets Book Value', 'Amount (LKR)': 19705000 },
      { 'Section': 'CURRENT ASSETS', 'Item / Account': 'Inventory Stores Stock Valuation (Est.)', 'Amount (LKR)': 35000 },
      { 'Section': 'CURRENT ASSETS', 'Item / Account': 'Warden Float Petty Cash in Hand', 'Amount (LKR)': 10000 },
    ];
    bankAccounts.forEach(acc => {
      rows.push({ 'Section': 'CURRENT ASSETS', 'Item / Account': `${acc.bankName} - ${acc.accountName}`, 'Amount (LKR)': formatCurrency(acc.balance) });
    });
    const totalAssets = 19705000 + 45000 + totalBank;
    rows.push({ 'Section': 'TOTAL ASSETS', 'Item / Account': 'TOTAL CENTER ASSETS', 'Amount (LKR)': totalAssets });
    rows.push({ 'Section': 'CURRENT LIABILITIES', 'Item / Account': 'Accrued Utility Bills & Payables', 'Amount (LKR)': 12500 });
    rows.push({ 'Section': 'CAPITAL & TRUST', 'Item / Account': 'Accumulated Capital Reserve Trust Fund', 'Amount (LKR)': totalAssets - 12500 });
    rows.push({ 'Section': 'TOTAL LIABILITIES & EQUITY', 'Item / Account': 'TOTAL EQUITY & LIABILITIES', 'Amount (LKR)': totalAssets });

    exportToExcel(rows, `OMS_Balance_Sheet_${today}.xlsx`, 'Balance Sheet');
  } else if (reportType === 'cash_flow') {
    const totalIn = incomes.reduce((s, i) => s + (i.amount || 0), 0);
    const totalOut = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const net = totalIn - totalOut;
    const totalBank = bankAccounts.reduce((s, a) => s + (a.balance || 0), 0);
    const openingCash = totalBank - net + 10000;
    const closingCash = openingCash + net;

    const rows = [
      { 'Activity': 'OPERATING CASH FLOWS', 'Line Item': 'Receipts from Donors, Sponsors & Grants', 'Amount (LKR)': totalIn },
      { 'Activity': 'OPERATING CASH FLOWS', 'Line Item': 'Payments for Food, Utilities, Salaries & Operations', 'Amount (LKR)': -totalOut },
      { 'Activity': 'OPERATING CASH FLOWS', 'Line Item': 'Net Cash Flow from Operating Activities', 'Amount (LKR)': net },
      { 'Activity': 'RECONCILIATION', 'Line Item': 'Cash & Equivalents at Period Start', 'Amount (LKR)': openingCash },
      { 'Activity': 'RECONCILIATION', 'Line Item': 'Net Increase / (Decrease) in Cash', 'Amount (LKR)': net },
      { 'Activity': 'RECONCILIATION', 'Line Item': 'Cash & Equivalents at Period End', 'Amount (LKR)': closingCash },
    ];

    exportToExcel(rows, `OMS_Cash_Flow_Statement_${today}.xlsx`, 'Cash Flow');
  } else if (reportType === 'special_funds') {
    const pettyCashExp = expenses.filter(e => (e.category || '').toLowerCase().includes('petty') || (e.description || '').toLowerCase().includes('petty'));
    const rows = [
      { 'Section': 'A. PETTY CASH FLOAT', 'Detail': 'Warden Petty Cash Monthly Opening Float', 'Staff / Beneficiary': 'System Admin', 'Amount (LKR)': 10000 }
    ];
    pettyCashExp.forEach(e => {
      rows.push({ 'Section': 'A. PETTY CASH FLOAT', 'Detail': e.description, 'Staff / Beneficiary': e.staffName, 'Amount (LKR)': -e.amount });
    });
    rows.push({ 'Section': 'B. TRUST SAVINGS', 'Detail': '--- Children Trust Accounts (Maturing at Age 18) ---', 'Staff / Beneficiary': '', 'Amount (LKR)': '' });
    childrenList.forEach(c => {
      const yearsAdmitted = new Date().getFullYear() - new Date(c.admissionDate).getFullYear();
      const trustBal = 15000 + (yearsAdmitted * 5000);
      const maturityYear = new Date(c.DOB).getFullYear() + 18;
      rows.push({
        'Section': 'B. TRUST SAVINGS',
        'Detail': `${c.childID} - ${c.name} (CNB Trust Account)`,
        'Staff / Beneficiary': `Matures in ${maturityYear}`,
        'Amount (LKR)': trustBal
      });
    });

    exportToExcel(rows, `OMS_Special_Funds_Report_${today}.xlsx`, 'Special Funds');
  } else {
    // Default / Complete Financial Package
    exportMultipleSheetsToExcel([
      { sheetName: 'Income Ledger', data: (incomes || []).map(i => ({ 'Date': formatDate(i.date), 'Category': i.category, 'Amount (LKR)': i.amount, 'Donor': i.donor, 'Method': i.paymentMethod, 'Ref': i.refReceipt })) },
      { sheetName: 'Expense Ledger', data: (expenses || []).map(e => ({ 'Date': formatDate(e.date), 'Category': e.category, 'Amount (LKR)': e.amount, 'Claimed By': e.staffName, 'Description': e.description, 'Ref': e.referenceReceipt })) },
      { sheetName: 'Bank Accounts', data: (bankAccounts || []).map(a => ({ 'Bank': a.bankName, 'Account': a.accountName, 'Number': a.accountNumber, 'Balance (LKR)': a.balance })) },
    ], `OMS_Financial_Package_${today}.xlsx`);
  }
}

// ─── 10. MASTER SYSTEM BACKUP ("EVERYTHING") EXPORT ───
export function exportMasterSystemBackupToExcel({
  children = [],
  staff = [],
  incomes = [],
  expenses = [],
  donations = [],
  meals = [],
  inventory = [],
  bankAccounts = [],
}) {
  const today = new Date().toISOString().split('T')[0];

  const sheets = [
    {
      sheetName: 'System Overview',
      data: [
        { 'Metric': 'Export Date', 'Value': today },
        { 'Metric': 'Registered Children', 'Value': children.length },
        { 'Metric': 'Staff Members', 'Value': staff.length },
        { 'Metric': 'Income Records Logged', 'Value': incomes.length },
        { 'Metric': 'Total Income (LKR)', 'Value': incomes.reduce((s, i) => s + (i.amount || 0), 0) },
        { 'Metric': 'Expense Records Logged', 'Value': expenses.length },
        { 'Metric': 'Total Expenses (LKR)', 'Value': expenses.reduce((s, e) => s + (e.amount || 0), 0) },
        { 'Metric': 'Donation Records', 'Value': donations.length },
        { 'Metric': 'Meal Bookings Logged', 'Value': meals.length },
        { 'Metric': 'Inventory Stock Items', 'Value': inventory.length },
        { 'Metric': 'Active Bank Accounts', 'Value': bankAccounts.length },
        { 'Metric': 'Total Bank Reserves (LKR)', 'Value': bankAccounts.reduce((s, a) => s + (a.balance || 0), 0) },
      ]
    },
    {
      sheetName: 'Children Records',
      data: children.map((c, i) => ({
        '#': i + 1,
        'Child ID': c.childID,
        'Name': c.name,
        'Gender': c.gender,
        'DOB': formatDate(c.DOB),
        'Admission Date': formatDate(c.admissionDate),
        'Status': c.status,
        'Blood Type': c.bloodType || 'N/A',
        'Allergies': c.allergies || 'None',
        'Guardian Name': c.guardianInfo?.name || 'N/A',
        'Guardian Contact': c.guardianInfo?.contact || 'N/A',
      }))
    },
    {
      sheetName: 'Staff Directory',
      data: staff.map((s, i) => ({
        '#': i + 1,
        'Name': s.name,
        'Username': s.username,
        'Role': s.role,
        'Job Role': s.jobRole || 'Staff',
        'Contact': s.contactDetails || 'N/A',
        'NIC': s.nic || 'N/A',
        'Active': s.isActive ? 'YES' : 'NO',
      }))
    },
    {
      sheetName: 'Income Ledger',
      data: incomes.map((inc, i) => ({
        '#': i + 1,
        'Date': formatDate(inc.date),
        'Category': inc.category,
        'Amount (LKR)': inc.amount,
        'Method': inc.paymentMethod,
        'Donor': inc.donor,
        'Receipt Ref': inc.refReceipt || 'N/A',
      }))
    },
    {
      sheetName: 'Expenses Ledger',
      data: expenses.map((exp, i) => ({
        '#': i + 1,
        'Date': formatDate(exp.date),
        'Category': exp.category,
        'Amount (LKR)': exp.amount,
        'Staff': exp.staffName,
        'Description': exp.description,
        'Invoice Ref': exp.referenceReceipt || 'N/A',
      }))
    },
    {
      sheetName: 'Donations',
      data: donations.map((d, i) => ({
        '#': i + 1,
        'Donation ID': d.donationID,
        'Date': formatDate(d.date || d.createdAt),
        'Donor': d.donorID?.name || 'Anonymous',
        'Type': d.type,
        'Amount / Details': d.type === 'cash' ? `LKR ${d.amount}` : (d.type === 'goods' ? `${d.quantity}x ${d.itemType}` : `${d.quantity}x ${d.mealType}`),
        'Status': d.status,
        'Receipt Ref': d.receiptRef || 'N/A',
      }))
    },
    {
      sheetName: 'Meal Bookings',
      data: meals.map((m, i) => ({
        '#': i + 1,
        'Meal Date': formatDate(m.mealDate),
        'Slot': m.mealType,
        'Donor': m.donorID?.name || 'Valued Donor',
        'Beneficiaries': m.quantity || 50,
        'Preparation': m.mealDonationType === 'bringyourown' ? 'Self-Catered' : 'Centre-Prepared',
        'Cost (LKR)': m.estimatedCost || 0,
        'Status': m.status,
      }))
    },
    {
      sheetName: 'Inventory Stores',
      data: inventory.map((it, i) => ({
        '#': i + 1,
        'Item No.': it.itemNumber || 'N/A',
        'Item Name': it.name,
        'Category': it.category,
        'Quantity': it.quantity,
        'Unit': it.unit,
        'Status': it.status,
      }))
    },
    {
      sheetName: 'Bank Accounts',
      data: bankAccounts.map((b, i) => ({
        '#': i + 1,
        'Bank Name': b.bankName,
        'Account Name': b.accountName,
        'Account Number': b.accountNumber,
        'Balance (LKR)': b.balance,
      }))
    }
  ];

  exportMultipleSheetsToExcel(sheets, `OMS_Complete_System_Master_Backup_${today}.xlsx`);
}
