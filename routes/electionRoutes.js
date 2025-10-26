const express = require("express");
const router = express.Router();
const {
    createElection,
    getElections,
    getElectionById,
    startElection,
    endElection,
    deleteElection,
    getApprovedCandidatesForElection,
    getAvailableElections,
    updateElectionVotes,
    getElectionResults,
    getUpcomingElections,
    getAllCompletedElectionResults
} = require("../controllers/electionController");

const { protect, adminOnly } = require("../middleware/auth");

// ================================
// ROUTE ORDER IS CRITICAL!
// Specific routes MUST come BEFORE parameterized routes (/:id, /:electionId)
// Express matches routes from top to bottom
// ================================

// Base routes
router.post("/", protect, adminOnly, createElection);   // Create election
router.get("/", getElections);                          // Get all elections

// Specific named routes - MUST be before /:id
router.get('/upcoming-election', protect, getUpcomingElections);
router.get("/completed", protect, getAllCompletedElectionResults);
router.get("/available", getAvailableElections);

// Parameterized routes with additional path segments - MUST be before simple /:id
router.get('/:electionId/results', getElectionResults);
router.get("/:electionId/candidates/approved", getApprovedCandidatesForElection);
router.put("/:electionId/update-votes", updateElectionVotes);

// Parameterized routes with actions
router.put("/:id/start", protect, adminOnly, startElection);
router.put("/:id/end", protect, adminOnly, endElection);
router.delete("/:id", protect, adminOnly, deleteElection);

// Generic parameterized route - MUST be LAST
router.get("/:id", getElectionById);

module.exports = router;