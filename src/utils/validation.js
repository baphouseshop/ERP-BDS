/**
 * Utility for input validation and sanitization
 */

export const validatePhone = (phone) => {
  if (!phone) return false;
  // Matches Vietnam phone formats: 0[3|5|7|8|9]... or +84...
  const regex = /^(0|84|\+84)(3|5|7|8|9)([0-9]{8})$/;
  return regex.test(phone.replace(/\s/g, ''));
};

export const validateEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const sanitizeString = (str) => {
  if (!str) return '';
  // Basic sanitization to prevent common XSS characters if injected into innerHTML
  // React's JSX already escapes values inserted as children, but this is good practice
  return str.toString()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
};

export const validateRequired = (val) => {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  return true;
};

export const formatCurrency = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};
