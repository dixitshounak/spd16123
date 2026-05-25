const crypto = require("crypto");

/**
 * Generates a secure random hex token.
 * @param {number} bytes - Number of random bytes (default 32)
 * @returns {string} hex token
 */
const generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString("hex");
};

module.exports = generateToken;
