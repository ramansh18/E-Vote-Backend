const Web3 = require("web3");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
// Replace with your actual Polygon Amoy RPC URL
const POLYGON_AMOY_RPC_URL = process.env.POLYGON_RPC_URL;

// Replace with your deployed contract address on Polygon Amoy
const CONTRACT_ADDRESS = "0x79d0C2C08cA0E87A8287b61Ae1560fA96d4B1987";

// Adjust path to your compiled contract ABI JSON file
const ABI_PATH = path.resolve(__dirname, "./artifacts/contracts/VoterRegistration.sol/VoterRegistration.json");

async function main() {
  // Connect to Polygon Amoy network
  const web3 = new Web3(POLYGON_AMOY_RPC_URL);

  // Read ABI JSON
  const artifact = JSON.parse(fs.readFileSync(ABI_PATH, "utf8"));
  const abi = artifact.abi;

  // Create contract instance
  const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

  // Call getAllVoters function
  try {
    const voters = await contract.methods.getAllVoters().call();
    console.log("Voters:", voters);
  } catch (err) {
    console.error("Error calling getAllVoters:", err);
  }
}

main();
