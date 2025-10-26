const express = require("express");
const router = express.Router();
const {
    createElection,
    getElections,
    getElectionById,
    startElection,
    endElection,
    deleteElection,getApprovedCandidatesForElection,
    getAvailableElections,updateElectionVotes,getElectionResults,getUpcomingElections,getAllCompletedElectionResults
} = require("../controllers/electionController");

const { protect, adminOnly } = require("../middleware/auth");

// Election Routes
router.post("/", protect, adminOnly, createElection);   // Create election
router.get("/", getElections);
router.get('/upcoming-election',protect,getUpcomingElections)

router.get("/completed",protect, getAllCompletedElectionResults);

router.get("/available", getAvailableElections);                          // Get all elections
router.get("/:id", getElectionById);                    // Get single election
router.put("/:id/start", protect, adminOnly, startElection);  // Start election
router.put("/:id/end", protect, adminOnly, endElection);      // End election
router.delete("/:id", protect, adminOnly, deleteElection); 
router.get("/:electionId/candidates/approved", getApprovedCandidatesForElection);   
router.put("/:electionId/update-votes", updateElectionVotes);
router.get('/:electionId/results', getElectionResults);
module.exports = router;
