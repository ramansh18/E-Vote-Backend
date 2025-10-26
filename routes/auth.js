const express = require("express");
const router = express.Router();
const { register, verifyOTP, login, getMe,resendOTP,sendResetPasswordToken, resetPassword  } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Authentication Routes
router.post("/register", register);  // Register user & send OTP
router.post("/verify-otp", verifyOTP);  // Verify OTP & complete registration
router.post("/login", login);  // User login & get JWT token
router.get("/me", protect, getMe);  // Get user details (protected route)
router.post('/resend-otp', resendOTP);
router.post('/request-reset', sendResetPasswordToken);
router.post('/reset-password', resetPassword);
module.exports = router;