const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createTrip, getTrips, getTrip, updateTrip, deleteTrip, toggleShare, getPublicTrip, duplicateTrip } = require("../controllers/trip.controller");

const router = express.Router();

// Public route — no auth needed
router.get("/share/:token", getPublicTrip);

// All routes below require auth
router.use(authMiddleware);

router.post("/", createTrip);
router.get("/", getTrips);
router.get("/:id", getTrip);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);
router.post("/:id/share", toggleShare);
router.post("/:id/duplicate", duplicateTrip);

module.exports = router;
