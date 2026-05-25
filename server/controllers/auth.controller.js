const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../config/jwt");
const generateToken = require("../utils/generateToken");
const { sendVerifyEmail, sendResetPasswordEmail } = require("../utils/sendEmail");

// ─── Helper: Set Refresh Token Cookie ─────────────────────────────────────────
const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    const verifyToken = generateToken();
    const user = await User.create({ name, email, password, verifyToken });

    // Send verification email (non-blocking — don't fail registration if email fails)
    try {
      await sendVerifyEmail(email, name, verifyToken);
    } catch (emailErr) {
      console.warn("⚠️  Could not send verification email:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verifyToken: token });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification link." });
    }

    user.isVerified = true;
    user.verifyToken = null;
    await user.save();

    res.json({ success: true, message: "Email verified successfully! You can now log in." });
  } catch (error) {
    next(error);
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Include password in query (it's select:false by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Generate tokens
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // Store refresh token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ userId: user._id, token: refreshToken, expiresAt });

    // Set refresh token as httpOnly cookie
    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      accessToken,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// ─── REFRESH ACCESS TOKEN ─────────────────────────────────────────────────────
const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token." });
    }

    // Verify token signature
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token." });
    }

    // Check it exists in DB (rotation check)
    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken) {
      return res.status(401).json({ success: false, message: "Refresh token revoked." });
    }

    // Rotate: delete old, issue new
    await RefreshToken.deleteOne({ token });

    const newAccessToken = signAccessToken(decoded.id);
    const newRefreshToken = signRefreshToken(decoded.id);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ userId: decoded.id, token: newRefreshToken, expiresAt });

    setRefreshCookie(res, newRefreshToken);

    const user = await User.findById(decoded.id);
    res.json({
      success: true,
      accessToken: newAccessToken,
      user: user ? user.toPublicJSON() : null,
    });
  } catch (error) {
    next(error);
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await RefreshToken.deleteOne({ token });
    }
    res.clearCookie("refreshToken", { path: "/" });
    res.json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    next(error);
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: "If this email exists, a reset link has been sent." });
    }

    const resetToken = generateToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      await sendResetPasswordEmail(email, user.name, resetToken);
    } catch (emailErr) {
      console.warn("⚠️  Could not send reset email:", emailErr.message);
    }

    res.json({ success: true, message: "If this email exists, a reset link has been sent." });
  } catch (error) {
    next(error);
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset link." });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    // Revoke all refresh tokens for this user
    await RefreshToken.deleteMany({ userId: user._id });

    res.json({ success: true, message: "Password reset successfully. Please log in with your new password." });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, verifyEmail, login, refreshAccessToken, logout, forgotPassword, resetPassword };
