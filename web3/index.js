const Web3 = require("web3");
const deployedAddresses = require("../contractAddresses.json");
const path = require("path");
require('dotenv').config({ path: '../.env' });

const rpcUrl = process.env.POLYGON_RPC_URL;
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

// Load ABIs from Hardhat artifacts folder
const VoterABI = require(path.resolve(__dirname, '../artifacts/contracts/VoterRegistration.sol/VoterRegistration.json')).abi;
const CandidateABI = require(path.resolve(__dirname, '../artifacts/contracts/CandidateRegistration.sol/CandidateRegistration.json')).abi;
const ElectionABI = require(path.resolve(__dirname, '../artifacts/contracts/Election.sol/Election.json')).abi;
const VotingABI = require(path.resolve(__dirname, '../artifacts/contracts/Voting.sol/Voting.json')).abi;

const contracts = {
  voterContract: new web3.eth.Contract(VoterABI, deployedAddresses.voterRegistration),
  candidateRegistrationContract: new web3.eth.Contract(CandidateABI, deployedAddresses.candidateRegistration),
  electionContract: new web3.eth.Contract(ElectionABI, deployedAddresses.election),
  votingContract: new web3.eth.Contract(VotingABI, deployedAddresses.voting),
};

module.exports = { web3, contracts };
