const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const authMiddleware = require("../middleware/authMiddleware");
const { generateItinerary, aiChat, regenerateItinerary, estimateBudget } = require("../controllers/ai.controller");


const router = express.Router();

// All AI routes require auth
router.use(authMiddleware);

// POST /api/ai/generate
router.post(
  "/generate",
  [
    body("destination").notEmpty().withMessage("Destination is required"),
    body("totalDays").isInt({ min: 1, max: 30 }).withMessage("Duration must be 1-30 days"),
    body("budgetTier").isIn(["budget", "moderate", "luxury", "custom"]).withMessage("Invalid budget tier"),
    body("budgetAmount").isNumeric().withMessage("Budget amount must be a number"),
    body("travelerType").isIn(["solo", "couple", "family", "friends"]).withMessage("Invalid traveler type"),
    body("travelersCount").isInt({ min: 1 }).withMessage("Travelers count must be at least 1"),
    body("interests").isArray().withMessage("Interests must be an array"),
  ],
  validate,
  generateItinerary
);

// POST /api/ai/chat
router.post(
  "/chat",
  [body("message").notEmpty().withMessage("Message is required")],
  validate,
  aiChat
);

// POST /api/ai/regenerate/:id
router.post("/regenerate/:id", authMiddleware, regenerateItinerary);

// POST /api/ai/estimate-budget
router.post("/estimate-budget", authMiddleware, estimateBudget);

module.exports = router;
