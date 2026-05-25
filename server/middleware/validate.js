const { validationResult } = require("express-validator");

/**
 * Middleware: Checks express-validator results.
 * Returns 422 with validation errors if any exist.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(422).json({
      success: false,
      message: messages[0], // first error for UX friendliness
      errors: messages,
    });
  }
  next();
};

module.exports = validate;
