const User = require("../models/User");
const Trip = require("../models/Trip");
const RefreshToken = require("../models/RefreshToken");
const path = require("path");
const fs = require("fs");

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
const updateMe = async (req, res, next) => {
  try {
    const { name } = req.body;
    const update = {};
    if (name) update.name = name;

    // Handle avatar upload
    if (req.file) {
      const user = await User.findById(req.user.id);
      // Delete old avatar file if it's a local file
      if (user.avatar && user.avatar.startsWith("/uploads/")) {
        const oldPath = path.join(__dirname, "..", user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      update.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    // Revoke all refresh tokens (force re-login on other devices)
    await RefreshToken.deleteMany({ userId: user._id });

    res.json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE ACCOUNT ───────────────────────────────────────────────────────────
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Delete all trips
    await Trip.deleteMany({ userId });

    // Delete all refresh tokens
    await RefreshToken.deleteMany({ userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.clearCookie("refreshToken", { path: "/" });
    res.json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateMe, changePassword, deleteAccount };
