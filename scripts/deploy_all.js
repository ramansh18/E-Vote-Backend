// backend/scripts/deploy_all.js

const Web3 = require("web3");
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: "./backend/.env" });

async function main() {
  // Setup Web3 with provider + account from env
  const web3 = new Web3(process.env.POLYGON_RPC_URL);
  const account = web3.eth.accounts.privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  // Helper to load artifact JSON
  const loadArtifact = (contractName) => {
    const artifactPath = path.resolve(__dirname, `../artifacts/contracts/${contractName}.sol/${contractName}.json`);
    return JSON.parse(fs.readFileSync(artifactPath));
  };

  // Deploy function
  const deployContract = async (contractName, ...constructorArgs) => {
    const artifact = loadArtifact(contractName);
    const contract = new web3.eth.Contract(artifact.abi);

    const deployed = await contract
      .deploy({ data: artifact.bytecode, arguments: constructorArgs })
      .send({ from: account.address, gas: 5000000 });

    console.log(`${contractName} deployed at:`, deployed.options.address);
    return deployed.options.address;
  };

  // Deploy independent contracts first
  const candidateRegistrationAddress = await deployContract("CandidateRegistration");
  const voterRegistrationAddress = await deployContract("VoterRegistration");
  const electionAddress = await deployContract("Election");

  // Deploy Voting contract with constructor arguments
  const votingAddress = await deployContract("Voting", voterRegistrationAddress, candidateRegistrationAddress);

  // Save all addresses to JSON file in root
  const contractAddresses = {
    candidateRegistration: candidateRegistrationAddress,
    voterRegistration: voterRegistrationAddress,
    election: electionAddress,
    voting: votingAddress,
  };

  const addressesPath = path.resolve(__dirname, "../contractAddresses.json");
  fs.writeFileSync(addressesPath, JSON.stringify(contractAddresses, null, 2));
  console.log("✅ Contract addresses saved to contractAddresses.json");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
