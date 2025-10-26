// routes/test.js
const express = require("express");
const router = express.Router();

router.get("/emit-test", (req, res) => {
  const io = req.app.get("io");
  if (!io) {
    return res.status(500).json({ message: "Socket.IO not initialized" });
  }

  io.emit("newActivity", {
    type: "test_event",
    message: "This is a test activity from backend.",
    timestamp: new Date().toISOString(),
  });

  console.log("📡 Emitted test newActivity event");

  res.json({ success: true, message: "Test activity emitted" });
});

module.exports = router;
