const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const {
  register, verifyEmail, login, refreshAccessToken, logout, forgotPassword, resetPassword,
} = require("../controllers/auth.controller");

const router = express.Router();

// POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  validate,
  register
);

// GET /api/auth/verify/:token
router.get("/verify/:token", verifyEmail);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

// POST /api/auth/refresh
router.post("/refresh", refreshAccessToken);

// POST /api/auth/logout
router.post("/logout", logout);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required").normalizeEmail()],
  validate,
  forgotPassword
);

// POST /api/auth/reset-password/:token
router.post(
  "/reset-password/:token",
  [body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")],
  validate,
  resetPassword
);

module.exports = router;
