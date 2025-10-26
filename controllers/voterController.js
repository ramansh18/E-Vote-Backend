// controllers/voterController.js

const { web3, contracts } = require("../web3/index");
const { voterContract } = contracts; // your web3 instance + contract
const deployedAddresses = require("../contractAddresses.json");
require("dotenv").config({ path: "../.env" });
const User = require("../models/User");
const Activity = require("../models/activity")
exports.registerVoter = async (req, res) => {
  try {
    const { name, age, gender } = req.body;

    if (!name || !age || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }
    console.log("user",req.user);
    // 1. Ensure user is authenticated
    const userId = req.user?.id; // Provided by auth middleware
    console.log("user id",userId)
    const user = await User.findById(userId);

    if (!user || !user.walletAddress) {
      return res.status(400).json({ message: "User wallet address not found" });
    }
    const voterAddress = user.walletAddress;
    console.log("voter ka add-->",voterAddress)
    // 2. Basic validations
    if (!name || !age || !gender) {
      return res.status(400).json({ message: "Name, age, and gender are required" });
    }
   
    const isRegistered = await voterContract.methods.isRegistered(voterAddress).call();

    console.log("paar karliya",isRegistered)
    if (isRegistered) {
      return res.status(400).json({ message: "Voter is already registered" });
    }
    // 3. Get relayer private key
    const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
    const relayerWallet = web3.eth.accounts.privateKeyToAccount(relayerPrivateKey);

    // 4. Prepare transaction data
    const txData = voterContract.methods
      .registerVoterFor(voterAddress, name, age, gender)
      .encodeABI();

    // 5. Estimate gas
    const gas = await web3.eth.estimateGas({
      to: deployedAddresses.voterRegistration,
      data: txData,
      from: relayerWallet.address,
    });
    console.log("gas ki price estimated---> ",gas)
    const gasPrice = await web3.eth.getGasPrice();
    console.log("gas price---->",gasPrice)
    // 6. Sign transaction
    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: deployedAddresses.voterRegistration,
        data: txData,
        gas,
        gasPrice,
        from: relayerWallet.address,
      },
      relayerPrivateKey
    );

    // 7. Send signed transaction
    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const activity = new Activity({
     action: `Voter ${name} Registered`,
     user: name,  // Get from user data
     type: "voter",
   });
   
   await activity.save(); // ✅ Save to DB
   
   // Emit to socket
   const io = req.app.get("io");
   io.emit("newActivity", activity);
  
    res.status(201).json({
      message: "Voter registered successfully!",
      txHash: tx.transactionHash,
    });
  } catch (error) {
    console.error("Error registering voter:", error);
    
    res.status(500).json({ message: "Voter registration failed", error: error.message });
  }
};

exports.getAllVoters = async (req, res) => {
  try {
    const voterAddresses = await voterContract.methods.getAllVoters().call();
    const normalizedAddresses = voterAddresses.map(addr => addr.toLowerCase());

    // Fetch all users
    const allUsers = await User.find({ role: "voter", isVerified: true }).select('-password');;

    // Filter users whose walletAddress matches (case-insensitively)
    const voters = allUsers.filter(user =>
      normalizedAddresses.includes(user.walletAddress.toLowerCase())
    );
    res.status(200).json({ votersData: voters });
  } catch (error) {
    console.error("Error fetching voters:", error);
    res.status(500).json({ message: "Unable to fetch voters", error: error.message });
  }
};