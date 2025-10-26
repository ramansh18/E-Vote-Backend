const express = require("express");
const router = express.Router();
const { protect,adminOnly } = require("../middleware/auth");
const {registerVoter, getAllVoters } = require("../controllers/voterController");

router.post("/register",protect, registerVoter);
router.get("/all", protect,  getAllVoters);

module.exports = router;
