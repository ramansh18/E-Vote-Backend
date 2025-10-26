// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VoterRegistration {
    struct Voter {
        string name;
        uint age;
        string gender;
        address voterAddress;
        bool isRegistered;
        bool hasVoted;
    }

    address public admin;
    uint public minimumAge = 18;
    mapping(address => Voter) public voters;
    address[] public voterAddresses;

    event VoterRegistered(address voterAddress, string name);
    event Voted(address voterAddress);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier notRegistered() {
        require(!voters[msg.sender].isRegistered, "You are already registered");
        _;
    }

    modifier isEligible(uint _age) {
        require(_age >= minimumAge, "You must be at least 18 years old to vote");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    



    function registerVoterFor(address _voter, string memory _name, uint _age, string memory _gender)
    external
    onlyAdmin
    isEligible(_age)
{
    require(!voters[_voter].isRegistered, "Voter already registered");

    voters[_voter] = Voter({
        name: _name,
        age: _age,
        gender: _gender,
        voterAddress: _voter,
        isRegistered: true,
        hasVoted: false
    });

    voterAddresses.push(_voter);
    emit VoterRegistered(_voter, _name);
}


    function markVoted(address _voter) external onlyAdmin {
        require(voters[_voter].isRegistered, "Voter not registered");
        require(!voters[_voter].hasVoted, "Already voted");
        voters[_voter].hasVoted = true;
        emit Voted(_voter);
    }

    function getVoter(address _voter) external view returns (Voter memory) {
        return voters[_voter];
    }

    function getAllVoters() external view returns (address[] memory) {
        return voterAddresses;
    }

    // ✅ Added this function for Voting contract compatibility
    function isRegistered(address _voter) external view returns (bool) {
        return voters[_voter].isRegistered;
    }
}
