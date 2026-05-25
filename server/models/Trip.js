const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    origin: {
      type: String,
      trim: true,
      default: "",
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String, // Unsplash URL
      default: null,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },
    budgetTier: {
      type: String,
      enum: ["budget", "moderate", "luxury", "custom"],
      required: true,
    },
    budgetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    travelersCount: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    travelerType: {
      type: String,
      enum: ["solo", "couple", "family", "friends"],
      required: true,
    },
    interests: {
      type: [String],
      default: [],
    },
    itinerary: {
      type: mongoose.Schema.Types.Mixed, // Full Gemini JSON output
      default: null,
    },
    status: {
      type: String,
      enum: ["upcoming", "completed", "draft"],
      default: "draft",
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
      default: () => uuidv4(),
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
tripSchema.index({ userId: 1, createdAt: -1 });
tripSchema.index({ shareToken: 1 }, { unique: true, sparse: true });

// ─── Virtual: durationLabel ───────────────────────────────────────────────────
tripSchema.virtual("durationLabel").get(function () {
  return `${this.totalDays} day${this.totalDays > 1 ? "s" : ""}`;
});

module.exports = mongoose.model("Trip", tripSchema);
