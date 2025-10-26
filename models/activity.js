const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  user: {
    type: String, // You can also reference a User model if needed
    required: true,
  },
  type: {
    type: String,
    enum: ['candidate', 'voter', 'election', 'approval'], // Add more as needed
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Activity", activitySchema);
