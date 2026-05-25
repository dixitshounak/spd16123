import { format, differenceInDays, parseISO, isValid } from "date-fns";

/**
 * Formats a date to a readable string.
 * @param {string|Date} date
 * @param {string} fmt - date-fns format string
 */
export const formatDate = (date, fmt = "MMM dd, yyyy") => {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "";
    return format(d, fmt);
  } catch {
    return "";
  }
};

/**
 * Returns number of days between two dates.
 */
export const getDuration = (startDate, endDate) => {
  try {
    const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
    return differenceInDays(end, start) + 1;
  } catch {
    return 0;
  }
};

/**
 * Returns a date range string like "May 23 – Jun 2, 2025"
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "";
  const start = formatDate(startDate, "MMM dd");
  const end = formatDate(endDate, "MMM dd, yyyy");
  return `${start} – ${end}`;
};

/**
 * Gets the country flag emoji from a country code or name.
 * Falls back to 🌍 if not found.
 */
export const getCountryFlag = (country) => {
  if (!country) return "🌍";
  const flags = {
    india: "🇮🇳", "united states": "🇺🇸", usa: "🇺🇸", france: "🇫🇷",
    japan: "🇯🇵", thailand: "🇹🇭", italy: "🇮🇹", spain: "🇪🇸",
    "united kingdom": "🇬🇧", uk: "🇬🇧", australia: "🇦🇺", germany: "🇩🇪",
    indonesia: "🇮🇩", bali: "🇮🇩", singapore: "🇸🇬", dubai: "🇦🇪",
    "uae": "🇦🇪", maldives: "🇲🇻", nepal: "🇳🇵", "sri lanka": "🇱🇰",
    greece: "🇬🇷", turkey: "🇹🇷", portugal: "🇵🇹", canada: "🇨🇦",
    mexico: "🇲🇽", brazil: "🇧🇷", switzerland: "🇨🇭", netherlands: "🇳🇱",
  };
  return flags[country.toLowerCase()] || "🌍";
};
