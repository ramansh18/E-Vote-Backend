const express = require('express');
const { updateProfile, changePassword } = require('../controllers/profileUpdate'); // Import controller
const {protect} = require('../middleware/auth'); // Middleware to verify JWT token

const router = express.Router();

// Update Profile Route
router.put('/update-profile', protect, updateProfile);

// Change Password Route
router.put('/change-password', protect, changePassword);

module.exports = router;
