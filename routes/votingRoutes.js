const express = require("express");
const router = express.Router();
const { castVote, getAllCandidates, getVotesForCandidate ,getElectionResults,addCandidate,getVotingHistory} = require("../controllers/votingController");
const { protect } = require("../middleware/auth");

router.post("/vote", protect, (req, res) => {
  req.io = req.app.get('io');  // 👈 attach io instance to the request
  castVote(req, res);
});
 // Voter casts vote
router.get("/candidates", getAllCandidates);
router.post('/addCandidate', addCandidate);
router.get("/history", protect, getVotingHistory);
router.get("/votes/:candidateAddress", getVotesForCandidate);
router.get("/results", protect, getElectionResults);
module.exports = router;
