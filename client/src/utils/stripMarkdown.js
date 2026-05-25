/**
 * Strips common markdown formatting from a string.
 * Useful for displaying AI-generated text cleanly.
 */
export const stripMarkdown = (text) => {
  if (!text) return "";
  return text
    .replace(/#{1,6}\s/g, "") // headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1") // italic
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1") // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/^[-*+]\s/gm, "• ") // bullets
    .replace(/^\d+\.\s/gm, "") // numbered lists
    .replace(/\n{3,}/g, "\n\n") // excessive newlines
    .trim();
};

/**
 * Converts a string to title case.
 */
export const toTitleCase = (str) => {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

/**
 * Truncates text to a max length with ellipsis.
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};
