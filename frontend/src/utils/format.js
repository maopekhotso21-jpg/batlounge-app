// Formats values as South African rand currency.
export const currency = (v) =>
  'M ' + Number(v || 0).toLocaleString('en-LS', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });

// Formats a date into a short readable date string.
export const dateShort = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: '2-digit'
  }) : '—';

// Formats a date and time for detailed records.
export const dateTime = (d) =>
  d ? new Date(d).toLocaleString('en-GB') : '—';

// Formats numeric values using locale grouping separators.
export const formatNumber = (n) => Number(n || 0).toLocaleString();
