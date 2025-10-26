const express = require("express");
const {
  submitCandidateRequest,
  rejectCandidateRequest,
  approveCandidateRequest,
  getAllCandidateRequests,
  getMyCandidateRequest,
  deleteCandidateRequest,
  getApprovedCandidates,
} = require("../controllers/candidateController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Admin-only routes
router.post("/submit-request", protect, submitCandidateRequest);  // Submit candidate request
router.delete("/delete-request/:requestId", protect, deleteCandidateRequest); // Delete request before approval
router.get("/all-requests", protect, adminOnly, getAllCandidateRequests); // Get all candidate requests
router.put("/approve-candidate/:requestId", protect, adminOnly, approveCandidateRequest); // Admin approves request
router.put("/reject-candidate/:requestId", protect, adminOnly, rejectCandidateRequest); // Admin rejects request
router.get("/approved", getApprovedCandidates); // Public route to view approved candidates

// User route
router.get("/my-request", protect, getMyCandidateRequest); // Get user's own candidate request status

module.exports = router;
