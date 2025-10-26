// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CandidateRegistration {
    struct Candidate {
        uint id;
        string name;
        address walletAddress;
        uint electionId;
    }

    Candidate[] public candidates;
    mapping(address => bool) public hasRegisteredAsCandidate;
    uint public candidateCount;
    address public admin;
    bool public nominationOpen;

    event CandidateRegistered(uint id, string name, address walletAddress, uint electionId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier duringNominationPeriod() {
        require(nominationOpen, "Nominations are closed");
        _;
    }

    modifier notAlreadyRegistered(address _candidate) {
        require(!hasRegisteredAsCandidate[_candidate], "Already registered as a candidate");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function toggleNomination(bool _status) external onlyAdmin {
        nominationOpen = _status;
    }

    function registerCandidateFor(address _candidate, string memory _name, uint _electionId)
        external
        onlyAdmin
        duringNominationPeriod
        notAlreadyRegistered(_candidate)
    {
        candidateCount++;
        candidates.push(Candidate(candidateCount, _name, _candidate, _electionId));
        hasRegisteredAsCandidate[_candidate] = true;

        emit CandidateRegistered(candidateCount, _name, _candidate, _electionId);
    }

    function getCandidatesByElectionId(uint _electionId) public view returns (Candidate[] memory) {
        uint count = 0;
        for (uint i = 0; i < candidateCount; i++) {
            if (candidates[i].electionId == _electionId) {
                count++;
            }
        }

        Candidate[] memory electionCandidates = new Candidate[](count);
        uint index = 0;
        for (uint i = 0; i < candidateCount; i++) {
            if (candidates[i].electionId == _electionId) {
                electionCandidates[index] = candidates[i];
                index++;
            }
        }

        return electionCandidates;
    }

    function isCandidate(address _candidate) external view returns (bool) {
        return hasRegisteredAsCandidate[_candidate];
    }
}
