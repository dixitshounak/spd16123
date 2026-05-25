/**
 * Formats a number as Indian currency (₹).
 * Handles strings like "₹1,234" or numbers.
 */
export const formatCurrency = (value) => {
  if (typeof value === "string") {
    // Already formatted — return as-is
    if (value.startsWith("₹")) return value;
    value = parseFloat(value.replace(/[^0-9.]/g, ""));
  }
  if (isNaN(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Parses a rupee string to a number (e.g. "₹1,234" → 1234).
 */
export const parseRupee = (str) => {
  if (!str) return 0;
  return parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;
};
