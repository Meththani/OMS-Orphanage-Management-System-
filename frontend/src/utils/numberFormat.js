/**
 * Number & currency formatting utilities
 * Breaks numbers into standard 3-by-3 comma separated format (e.g. 1,000, 10,000, 1,000,000)
 */

export function formatWithCommas(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (!str.trim()) return '';

  const isNegative = str.trim().startsWith('-');
  const unsigned = isNegative ? str.trim().slice(1) : str.trim();

  // Split into integer part and decimal part
  const parts = unsigned.split('.');
  const cleanInteger = parts[0].replace(/\D/g, '');

  if (!cleanInteger && parts.length === 1) {
    return '';
  }

  // Format integer part with commas every 3 digits
  const formattedInteger = cleanInteger ? cleanInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';

  let result = formattedInteger;
  if (parts.length > 1) {
    // Keep up to 2 decimal places
    const cleanDecimal = parts[1].replace(/\D/g, '').slice(0, 2);
    result = `${formattedInteger}.${cleanDecimal}`;
  } else if (str.endsWith('.')) {
    result = `${formattedInteger}.`;
  }

  return isNegative ? `-${result}` : result;
}

export function stripCommas(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/,/g, '');
}

export function parseFormattedNumber(value) {
  const clean = stripCommas(value);
  if (!clean || isNaN(Number(clean))) return 0;
  return Number(clean);
}
