const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: function() { return !this.isGlobal } },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['ElectionStart', 'VoteReminder', 'VoteConfirmation', 'ElectionResult'], required: true },
  isGlobal: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

module.exports = mongoose.model("Notification",notificationSchema);