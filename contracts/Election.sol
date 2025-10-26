// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Election {
    address public admin;
    uint constant MINIMUM_REQUIRED_CANDIDATES = 2;

    struct ElectionData {
        bool started;
        bool ended;
        uint approvedCandidates;
    }

    mapping(uint => ElectionData) public elections;

    event ElectionStarted(uint electionId);
    event ElectionEnded(uint electionId);

    // Debug events for tracing
    event DebugMsg(string message, uint electionId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier electionNotStarted(uint electionId) {
        require(!elections[electionId].started, "Election already started");
        _;
    }

    modifier electionOngoing(uint electionId) {
        require(elections[electionId].started && !elections[electionId].ended, "Election is not ongoing");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function startElection(uint electionId, uint approvedCandidateCount) 
        public 
        onlyAdmin 
        electionNotStarted(electionId)
    {
        emit DebugMsg("startElection called", electionId);

        require(approvedCandidateCount >= MINIMUM_REQUIRED_CANDIDATES, "Not enough approved candidates to start election");
        emit DebugMsg("Approved candidate count sufficient", electionId);

        elections[electionId] = ElectionData({
            started: true,
            ended: false,
            approvedCandidates: approvedCandidateCount
        });
        emit DebugMsg("ElectionData updated", electionId);

        emit ElectionStarted(electionId);
        emit DebugMsg("ElectionStarted event emitted", electionId);
    }

    function endElection(uint electionId) 
        public 
        onlyAdmin 
        electionOngoing(electionId) 
    {
        elections[electionId].ended = true;
        emit ElectionEnded(electionId);
    }

   function getElectionStatus(uint electionId) public returns (string memory) {
    ElectionData memory election = elections[electionId];

    // Check if election data exists or not (based on default struct values)
    if (
        election.approvedCandidates == 0 &&
        election.started == false &&
        election.ended == false
    ) {
        emit DebugMsg("No election data found for electionId", electionId);
        return "No Election Found";
    }

    if (!election.started) {
        return "Not Started";
    } else if (!election.ended) {
        return "Ongoing";
    } else {
        return "Ended";
    }
}

}
