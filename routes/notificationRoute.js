const express = require('express');
const router = express.Router();
const Notification = require('../models/Notifications');
const User = require('../models/User'); // import User model
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's creation time
    const user = await User.findById(userId).select('createdAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userCreatedAt = user.createdAt;

    // Fetch global or user-specific notifications after user's creation date
    const notifications = await Notification.find({
      createdAt: { $gte: userCreatedAt },
      $or: [
        { isGlobal: true },
        { user: userId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
