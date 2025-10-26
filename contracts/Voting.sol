// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVoterRegistration {
    function isRegistered(address _voter) external view returns (bool);
}

interface ICandidateRegistration {
    function isCandidate(address _candidate) external view returns (bool);
}

contract Voting {
    address public admin;
    IVoterRegistration public voterContract;
    ICandidateRegistration public candidateContract;

    // Track if a voter has voted in a specific election
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Track votes received by candidate in specific election
    mapping(uint256 => mapping(address => uint256)) public votesReceived;

    // Candidates list per election
    mapping(uint256 => address[]) public candidates;

    event VoteCast(uint256 indexed electionId, address indexed voter, address indexed candidate);
    event CandidateAdded(uint256 indexed electionId, address indexed candidate);

    constructor(address _voterContract, address _candidateContract) {
        admin = msg.sender;
        voterContract = IVoterRegistration(_voterContract);
        candidateContract = ICandidateRegistration(_candidateContract);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // Add a candidate to a specific election
    function addCandidate(uint256 electionId, address _candidate) external onlyAdmin {
        require(candidateContract.isCandidate(_candidate), "Not a registered candidate");
        // Check candidate not already added to this election
        address[] storage electionCandidates = candidates[electionId];
        for (uint i = 0; i < electionCandidates.length; i++) {
            require(electionCandidates[i] != _candidate, "Candidate already added");
        }
        electionCandidates.push(_candidate);

        emit CandidateAdded(electionId, _candidate);
    }

    // Vote for a candidate in a specific election
    function voteFor(uint256 electionId, address _voter, address _candidate) external {
        require(voterContract.isRegistered(_voter), "Not a registered voter");
        require(candidateContract.isCandidate(_candidate), "Invalid candidate");
        require(!hasVoted[electionId][_voter], "Voter has already voted in this election");

        // Check candidate is part of this election
        address[] storage electionCandidates = candidates[electionId];
        bool candidateExists = false;
        for (uint i = 0; i < electionCandidates.length; i++) {
            if (electionCandidates[i] == _candidate) {
                candidateExists = true;
                break;
            }
        }
        require(candidateExists, "Candidate not part of this election");

        hasVoted[electionId][_voter] = true;
        votesReceived[electionId][_candidate] += 1;

        emit VoteCast(electionId, _voter, _candidate);
    }

    // Get votes for candidate in election
    function getVotes(uint256 electionId, address _candidate) external view returns (uint256) {
        return votesReceived[electionId][_candidate];
    }

    // Get all candidates in election
    function getAllCandidates(uint256 electionId) external view returns (address[] memory) {
        return candidates[electionId];
    }
}
