const Trip = require("../models/Trip");
const { v4: uuidv4 } = require("uuid");

// ─── CREATE TRIP ──────────────────────────────────────────────────────────────
const createTrip = async (req, res, next) => {
  try {
    const {
      origin, destination, country, coverImage, startDate, endDate,
      totalDays, budgetTier, budgetAmount, travelersCount,
      travelerType, interests, itinerary, status,
    } = req.body;

    const trip = await Trip.create({
      userId: req.user.id,
      origin, destination, country, coverImage, startDate, endDate,
      totalDays, budgetTier, budgetAmount, travelersCount,
      travelerType, interests, itinerary,
      status: status || (itinerary ? "upcoming" : "draft"),
    });

    res.status(201).json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL USER TRIPS ───────────────────────────────────────────────────────
const getTrips = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = { userId: req.user.id };

    if (status && status !== "all") filter.status = status;
    if (search) filter.destination = { $regex: search, $options: "i" };

    const trips = await Trip.find(filter)
      .sort({ createdAt: -1 })
      .select("-itinerary"); // exclude heavy itinerary from list view

    // Stats
    const allTrips = await Trip.find({ userId: req.user.id }).select("status country");
    const stats = {
      total: allTrips.length,
      upcoming: allTrips.filter((t) => t.status === "upcoming").length,
      completed: allTrips.filter((t) => t.status === "completed").length,
      draft: allTrips.filter((t) => t.status === "draft").length,
      countries: [...new Set(allTrips.map((t) => t.country).filter(Boolean))].length,
    };

    res.json({ success: true, trips, stats });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE TRIP ──────────────────────────────────────────────────────────
const getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found." });
    }
    res.json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE TRIP ──────────────────────────────────────────────────────────────
const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found." });
    }
    res.json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE TRIP ──────────────────────────────────────────────────────────────
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found." });
    }
    res.json({ success: true, message: "Trip deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// ─── TOGGLE SHARE ─────────────────────────────────────────────────────────────
const toggleShare = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found." });
    }

    trip.isPublic = !trip.isPublic;
    if (!trip.shareToken) trip.shareToken = uuidv4();
    await trip.save();

    res.json({
      success: true,
      isPublic: trip.isPublic,
      shareToken: trip.isPublic ? trip.shareToken : null,
      shareUrl: trip.isPublic ? `${process.env.CLIENT_URL}/share/${trip.shareToken}` : null,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET PUBLIC TRIP (no auth required) ──────────────────────────────────────
const getPublicTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ shareToken: req.params.token, isPublic: true });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Shared trip not found or is no longer public." });
    }
    res.json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

// ─── DUPLICATE TRIP ───────────────────────────────────────────────────────────
const duplicateTrip = async (req, res, next) => {
  try {
    const original = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!original) {
      return res.status(404).json({ success: false, message: "Trip not found." });
    }

    const duplicate = await Trip.create({
      ...original.toObject(),
      _id: undefined,
      shareToken: uuidv4(),
      isPublic: false,
      status: "draft",
      destination: `${original.destination} (Copy)`,
      createdAt: undefined,
      updatedAt: undefined,
    });

    res.status(201).json({ success: true, trip: duplicate });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTrip, getTrips, getTrip, updateTrip, deleteTrip, toggleShare, getPublicTrip, duplicateTrip };
