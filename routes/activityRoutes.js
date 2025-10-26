const express = require("express");
const router = express.Router();
const Activity = require("../models/activity");

router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).limit(50);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

module.exports = router;
