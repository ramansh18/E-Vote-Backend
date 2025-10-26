// backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { toggleNominationPeriod } = require('../controllers/candidateController');

// Define route to toggle nomination period
router.post('/toggle-nomination', toggleNominationPeriod);

module.exports = router;
