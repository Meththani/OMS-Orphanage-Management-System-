import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  // Sidebar & Navigation
  "Dashboard": "පාලන පුවරුව",
  "Children": "ළමුන්",
  "Staff Management": "කාර්ය මණ්ඩලය",
  "Financial Reports": "මුදල් වාර්තා",
  "Meal Scheduling": "ආහාර උපලේඛන",
  "View Inventory": "තොග පරීක්ෂාව",
  "View Donation": "පරිත්‍යාග පරීක්ෂාව",
  "Donations": "පරිත්‍යාග",
  "Income": "ආදායම්",
  "Expenses": "වියදම්",
  "Bank Account": "බැංකු ගිණුම්",
  "Settings": "සැකසුම්",
  "Sign Out": "පිටවීම",
  "Main Menu": "ප්‍රධාන මෙනුව",
  "OMS Portal": "OMS ද්වාරය",
  "admin workspace": "පරිපාලක වැඩතල",
  "staff workspace": "කාර්ය මණ්ඩල වැඩතල",
  "accountant workspace": "ගණකාධිකාරී වැඩතල",

  // Common UI Actions
  "Save": "සුරකින්න",
  "Cancel": "අවලංගු කරන්න",
  "Edit": "සංස්කරණය",
  "Delete": "මකන්න",
  "Add": "එකතු කරන්න",
  "Search": "සෙවීම",
  "Filter": "පෙරහන්",
  "Status": "තත්ත්වය",
  "Action": "ක්‍රියාව",
  "Close": "වසා දමන්න",
  "Loading...": "පූරණය වෙමින්...",

  // Dashboard Page texts
  "Overview": "දළ විශ්ලේෂණය",
  "Total Children": "මුළු ළමුන් ගණන",
  "Active Staff": "ක්‍රියාකාරී කාර්ය මණ්ඩලය",
  "Total Donations": "මුළු පරිත්‍යාග",
  "Inventory Items": "තොග අයිතම",
  "Recent Activity": "මෑත කාලීන ක්‍රියාකාරකම්",
  "Quick Actions": "ඉක්මන් ක්‍රියාමාර්ග",
  "Register Child": "ළමයෙකු ලියාපදිංචි කරන්න",
  "Record Donation": "පරිත්‍යාගයක් වාර්තා කරන්න",
  "Update Inventory": "තොග යාවත්කාලීන කරන්න",
  "Book Meal": "ආහාරයක් වෙන්කරන්න",
  "Financial Summary": "මූල්‍ය සාරාංශය",
  "Available Balance": "තිබෙන ශේෂය",
  "Monthly Expenses": "මාසික වියදම්",
  "Monthly Income": "මාසික ආදායම",

  // Children Management
  "Child Registration": "ළමා ලියාපදිංචිය",
  "Name": "නම",
  "Age": "වයස",
  "Gender": "ස්ත්‍රී/පුරුෂ භාවය",
  "Admission Date": "ඇතුළත් කළ දිනය",
  "Blood Group": "ලේ වර්ගය",
  "Medical History": "වෛද්‍ය ඉතිහාසය",
  "Education": "අධ්‍යාපනය",
  "Add Child": "ළමයෙකු එක් කරන්න",
  "Edit Child Details": "ළමා තොරතුරු සංස්කරණය",
  "Male": "පිරිමි",
  "Female": "ගැහැණු",
  "Active": "ක්‍රියාකාරී",
  "Inactive": "අක්‍රීය",

  // Donations Management
  "Donor": "පරිත්‍යාගශීලියා",
  "Amount": "මුදල",
  "Date": "දිනය",
  "Type": "වර්ගය",
  "Cash": "මුදල්",
  "Goods": "භාණ්ඩ",
  "Meal": "ආහාර",
  "Pending": "පොරොත්තු",
  "Received": "ලැබී ඇත",
  "Cancelled": "අවලංගු කරන ලදී",
  "Accept": "පිළිගන්න",
  "Reject": "ප්‍රතික්ෂේප කරන්න",
  "View Details": "තොරතුරු බලන්න",
  "Proof of Payment": "ගෙවීම් සාක්ෂි",
  "Receipt Reference": "ලැබීම් අංකය",

  // Meal Scheduling
  "Meal Calendar": "ආහාර දින දර්ශනය",
  "Breakfast": "උදේ ආහාරය",
  "Lunch": "දවල් ආහාරය",
  "Dinner": "රාත්‍රී ආහාරය",
  "Sponsor": "අනුග්‍රාහකයා",
  "Quantity": "ප්‍රමාණය",
  "Occasion": "අවස්ථාව",
  "Menu Package": "මෙනු පැකේජය",

  // Staff Management
  "Staff List": "කාර්ය මණ්ඩල ලැයිස්තුව",
  "Role": "තනතුර",
  "Username": "පරිශීලක නාමය",
  "Department": "දෙපාර්තමේන්තුව",
  "NIC": "ජාතික හැඳුනුම්පත් අංකය",
  "DOB": "උපන් දිනය",

  // Bank Accounts & Finance
  "Bank Accounts": "බැංකු ගිණුම්",
  "Account Name": "ගිණුමේ නම",
  "Bank Name": "බැංකුවේ නම",
  "Account Number": "ගිණුම් අංකය",
  "Balance": "ශේෂය",
  "Add Account": "ගිණුමක් එක් කරන්න",
  "Record Income": "ආදායම වාර්තා කරන්න",
  "Record Expense": "වියදම වාර්තා කරන්න",
  "Category": "ප්‍රවර්ගය",
  "Ledger": "ලෙජරය",

  // Dashboard & Inquiries
  "Active Children": "සක්‍රීය ළමුන්",
  "Meals Scheduled Today": "අද දින ආහාර වෙන්කිරීම්",
  "Pending Donations": "පොරොත්තු පරිත්‍යාග",
  "Public Website Inquiries": "වෙබ් අඩවි විමසීම්",
  "No messages in inbox.": "පණිවිඩ නොමැත.",
  "Mark Read": "කියවූ බව ලකුණු කරන්න",
  "Recent Donations Log": "මෑත පරිත්‍යාග ලේඛනය",
  "No donations registered.": "පරිත්‍යාග ලියාපදිංචි කර නොමැත.",
  "Total Bank Balance": "මුළු බැංකු ශේෂය",
  "Total Income": "මුළු ආදායම",
  "Total Expenses": "මුළු වියදම්",
  "Recent Transactions Ledger": "මෑත ගනුදෙනු ලෙජරය",
  "No transaction records found.": "ගනුදෙනු වාර්තා හමු නොවීය.",
  "Active Accounts": "ක්‍රියාකාරී ගිණුම්",
  "No active bank accounts.": "ක්‍රියාකාරී බැංකු ගිණුම් නොමැත.",
  "Available": "තිබේ",
  "Good Morning": "සුභ උදෑසනක්",
  "Good Afternoon": "සුභ දහවලක්",
  "Good Evening": "සුභ සැන්දෑවක්",
  "admin": "පරිපාලක",
  "staff": "කාර්ය මණ්ඩලය",
  "accountant": "ගණකාධිකාරී",

  // Donations management UI
  "All Donations": "සියලුම පරිත්‍යාග",
  "Manage and confirm contributions": "පරිත්‍යාග කළමනාකරණය සහ තහවුරු කිරීම",
  "All": "සියල්ල",
  "Donors": "පරිත්‍යාගශීලීන්",
  "Donation ID": "පරිත්‍යාග අංකය",
  "Donor ID": "පරිත්‍යාගශීලියාගේ අංකය",
  "Contact Details": "සම්බන්ධතා විස්තර",
  "Preference": "කැමැත්ත",
  "Total Contributed": "මුළු දායකත්වය",
  "Date Logged": "වාර්තා කළ දිනය",
  "Receipt Ref": "ලැබීම් අංකය",
  "Proof": "සාක්ෂි",
  "Notes": "සටහන්",
  "Action": "ක්‍රියාව",
  "No donors found.": "පරිත්‍යාගශීලීන් කිසිවෙකු හමු නොවීය.",
  "No donations found.": "පරිත්‍යාග කිසිවක් හමු නොවීය.",
  "Amount / Item": "මුදල / අයිතමය",

  // Donation Details Modal
  "Donation Details": "පරිත්‍යාග විස්තර",
  "Donor Profile": "පරිත්‍යාගශීලියාගේ පැතිකඩ",
  "Donor Type": "පරිත්‍යාගශීලී වර්ගය",
  "Contribution Details": "දායකත්ව විස්තර",
  "Payment Method": "ගෙවීම් ක්‍රමය",
  "Meal Slot": "ආහාර වේල",
  "Portions": "ප්‍රමාණය (බෙදීම්)",
  "Dietary & Prep Notes": "ආහාර සහ සූදානම් කිරීම් සටහන්",
  "Internal Notes": "අභ්‍යන්තර සටහන්",
  "Bank Slip / Proof of Payment": "බැංකු රිසිට්පත / ගෙවීම් සාක්ෂි",
  "Download Slip": "පත්‍රිකාව බාගන්න",
  "Approve & Receive": "අනුමත කර ලබාගන්න",
  "Reject & Cancel": "ප්‍රතික්ෂේප කර අවලංගු කරන්න",
  "received": "ලැබී ඇත",
  "pending": "පොරොත්තු",
  "cancelled": "අවලංගු කරන ලදී",
  "cash": "මුදල්",
  "goods": "භාණ්ඩ",
  "meal": "ආහාර වේල්",

  // Meal Scheduling Details Modal
  "Meal Scheduling Details": "ආහාර උපලේඛන තොරතුරු",
  "Sponsor Profile": "අනුග්‍රාහකයාගේ පැතිකඩ",
  "Meal Reservation": "ආහාර වෙන්කිරීම",
  "Sponsor package": "අනුග්‍රාහක පැකේජය",
  "Menu Plan / Description": "මෙනු සැලැස්ම / විස්තරය",
  "Occasion / Purpose": "අවස්ථාව / අරමුණ",
  "Dietary Instructions": "ආහාර උපදෙස්",
  "Sponsor Notes": "අනුග්‍රාහක සටහන්",
  "Mark Served": "පිළිගැන්වූ බව ලකුණු කරන්න",
  "Self-Catered": "ස්වයං සපයන ලද",
  "Menu": "මෙනුව",
  "portions": "බෙදීම්",

  // Extended Children Management
  "Children Management": "ළමා කළමනාකරණය",
  "Manage profiles, medical records, and education": "ළමුන්ගේ පැතිකඩ, වෛද්‍ය වාර්තා සහ අධ්‍යාපනික තොරතුරු කළමනාකරණය",
  "Register New Child": "නව ළමයෙකු ලියාපදිංචි කරන්න",
  "Search children...": "ළමුන් සෙවීම...",
  "Child ID": "ළමා අංකය",
  "Age / DOB": "වයස / උපන් දිනය",
  "Guardian": "භාරකරු",
  "Actions": "ක්‍රියාමාර්ග",
  "View Profile": "පැතිකඩ බලන්න",
  "Deactivate": "අක්‍රීය කරන්න",
  "No children registered.": "ලියාපදිංචි කළ ළමුන් නොමැත.",
  "Child Profile Details": "ළමා පැතිකඩ විස්තර",
  "Personal Information": "පෞද්ගලික තොරතුරු",
  "Medical Records": "වෛද්‍ය වාර්තා",
  "Education & Progress": "අධ්‍යාපනය සහ ප්‍රගතිය",
  "Add Medical Record": "වෛද්‍ය වාර්තාවක් එක් කරන්න",
  "Add Education Record": "අධ්‍යාපන වාර්තාවක් එක් කරන්න",
  "Diagnosis": "රෝග විනිශ්චය",
  "Treatment": "ප්‍රතිකාරය",
  "Severity": "බරපතලකම",
  "School": "පාසල",
  "Grade": "ශ්‍රේණිය",
  "Enrolled": "ලියාපදිංචි වී ඇත",
  "Graduated": "අධ්‍යාපනය නිමකර ඇත",
  "Dropped": "ඉවත් වී ඇත",
  "Mild": "සාමාන්‍ය",
  "Moderate": "මධ්‍යස්ථ",
  "Severe": "බරපතල",
  "Critical": "අතිශය බරපතල",
  "Guardianship & Contact Details": "භාරකාරත්වය සහ සම්බන්ධතා විස්තර",
  "Medical History & Records": "වෛද්‍ය ඉතිහාසය සහ වාර්තා",
  "Academic Progress & Education": "අධ්‍යාපනික ප්‍රගතිය",

  // Extended Staff Management
  "Staff & User Accounts": "කාර්ය මණ්ඩලය සහ පරිශීලක ගිණුම්",
  "Manage staff accounts, credentials, and roles": "කාර්ය මණ්ඩල ගිණුම් සහ තනතුරු කළමනාකරණය",
  "Register Staff Member": "නව කාර්ය මණ්ඩල සාමාජිකයෙකු එක් කරන්න",
  "Search staff...": "කාර්ය මණ්ඩලය සෙවීම...",
  "Staff ID": "කාර්ය මණ්ඩල අංකය",
  "Email": "විද්‍යුත් තැපෑල",
  "Phone": "දුරකථන අංකය",
  "Role / Status": "තනතුර / තත්ත්වය",
  "Reset Password": "මුරපදය නැවත සකසන්න",
  "No staff accounts found.": "කාර්ය මණ්ඩල ගිණුම් හමු නොවීය.",
  "Staff Profile": "කාර්ය මණ්ඩල පැතිකඩ",
  "System Role": "පද්ධති තනතුර",
  "Joined Date": "එක්වූ දිනය",

  // Extended Meal Scheduling
  "Meal Scheduling & Sponsorships": "ආහාර උපලේඛන සහ අනුග්‍රාහකත්ව",
  "Manage daily sponsored breakfasts, lunches, and dinners": "දෛනික උදේ, දවල් සහ රාත්‍රී ආහාර අනුග්‍රාහකත්ව කළමනාකරණය",
  "Schedule Meal Donation": "ආහාර පරිත්‍යාගයක් වෙන්කරන්න",
  "Send SMS Reminder": "SMS මතක් කිරීමක් යවන්න",
  "SMS Sent": "SMS යවන ලදී",
  "SMS Status": "SMS තත්ත්වය",
  "Calendar View": "දින දර්ශන දසුන",
  "List View": "ලැයිස්තු දසුන",
  "Portions": "ප්‍රමාණය",
  "Kitchen Notes": "මුළුතැන්ගෙයි සටහන්",
  "Estimated Cost": "ඇස්තමේන්තුගත පිරිවැය",

  // Inventory Management
  "Inventory Management": "තොග කළමනාකරණය",
  "Track kitchen supplies, clothing, medicines, and stationery": "ආහාර ද්‍රව්‍ය, ඇඳුම් පැළඳුම්, ඖෂධ සහ අභ්‍යාස පොත් තොග පාලනය",
  "Add Inventory Item": "නව තොග අයිතමයක් එක් කරන්න",
  "Search inventory...": "තොග සෙවීම...",
  "Item Name": "අයිතමයේ නම",
  "Stock Quantity": "තොග ප්‍රමාණය",
  "Unit": "ඒකකය",
  "Reorder Level": "නැවත ඇණවුම් මට්ටම",
  "Low Stock": "අඩු තොග",
  "In Stock": "තොග තිබේ",
  "Out of Stock": "තොග අවසන්",
  "Food & Kitchen": "ආහාර සහ මුළුතැන්ගෙය",
  "Clothing & Linen": "ඇඳුම් පැළඳුම්",
  "Medicine & Hygiene": "ඖෂධ සහ සෞඛ්‍ය",
  "Stationery & Education": "අධ්‍යාපන ද්‍රව්‍ය",

  // Financial Pages (Income, Expense, Bank Accounts)
  "Income Records": "ආදායම් වාර්තා",
  "Expense Records": "වියදම් වාර්තා",
  "Manage and track organizational income": "සංවිධානාත්මක ආදායම් කළමනාකරණය සහ නිරීක්ෂණය",
  "Manage operational expenses and ledger": "මෙහෙයුම් වියදම් සහ ලෙජරය කළමනාකරණය",
  "Manage bank accounts, deposits, and balances": "බැංකු ගිණුම් සහ ශේෂයන් කළමනාකරණය",
  "Record Income": "ආදායමක් වාර්තා කරන්න",
  "Record Expense": "වියදමක් වාර්තා කරන්න",
  "Add Bank Account": "බැංකු ගිණුමක් එක් කරන්න",
  "Description": "විස්තරය",
  "Voucher / Ref": "වවුචර් / යොමු අංකය",
  "Account Details": "ගිණුම් විස්තර",
  // Dynamic Data & Entered Details Translations
  "male": "පිරිමි",
  "female": "ගැහැණු",
  "active": "ක්‍රියාකාරී",
  "inactive": "අක්‍රීය",
  "enrolled": "ලියාපදිංචි වී ඇත",
  "graduated": "අධ්‍යාපනය නිමකර ඇත",
  "dropped": "ඉවත් වී ඇත",
  "breakfast": "උදේ ආහාරය",
  "lunch": "දවල් ආහාරය",
  "dinner": "රාත්‍රී ආහාරය",
  "sponsor": "අනුග්‍රහය",
  "bringyourown": "ස්වයං සපයන ලද",
  "standard": "සම්මත මෙනුව",
  "deluxe": "විශේෂ මෙනුව",
  "custom": "අභිරුචි මෙනුව",
  "bank_transfer": "බැංකු තැන්පතුව",
  "card": "කාඩ්පත් ගෙවීම",
  "stripe": "ස්ට්‍රයිප් (Stripe)",
  "online": "සබැඳි ගෙවීම්",
  "Food": "ආහාර ද්‍රව්‍ය",
  "Clothing": "ඇඳුම් පැළඳුම්",
  "Medicine": "ඖෂධ සහ සෞඛ්‍ය",
  "Stationery": "අධ්‍යාපන ද්‍රව්‍ය",
  "Other": "වෙනත්",
  "Donation": "පරිත්‍යාග",
  "Grant": "ප්‍රදාන",
  "Fundraising": "අරමුදල් රැස්කිරීම්",
  "Food & Nutrition": "ආහාර සහ පෝෂණය",
  "Utilities": "සේවා ගාස්තු (විදුලිය/ජලය)",
  "Salaries": "වේතන සහ දීමනා",
  "Maintenance": "නඩත්තු කටයුතු",
  "Medical": "වෛද්‍ය වියදම්",
  "Supplies": "සැපයුම්",
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    if (!key) return '';
    if (language === 'si') {
      const strKey = String(key).trim();
      const lowerKey = strKey.toLowerCase();
      const capKey = strKey.charAt(0).toUpperCase() + strKey.slice(1);
      
      return translations[strKey] || 
             translations[lowerKey] || 
             translations[capKey] || 
             strKey;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
