const { web3, contracts } = require("../web3/index");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const { candidateRegistrationContract } = contracts;
const { generateWallet } = require("../utils/wallet");
const deployedAddresses = require("../contractAddresses.json");
const User = require("../models/User");
const Activity = require("../models/activity")
require("dotenv").config({ path: "../.env" });

exports.getNominationStatus = async (req, res) => {
  try {
    const nominationStatus = await candidateRegistrationContract.methods.isNominationOpen().call();
    return res.status(200).json({
      message: 'Nomination status fetched successfully!',
      nominationStatus,
    });
  } catch (error) {
    console.error('Error fetching nomination status:', error);
    return res.status(500).json({ message: 'Failed to fetch nomination status', error });
  }
};

exports.toggleNominationPeriod = async (req, res) => {
  try {
    const { status } = req.body;
    const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
    const relayerWallet = web3.eth.accounts.privateKeyToAccount(relayerPrivateKey);

    const txData = candidateRegistrationContract.methods.toggleNomination(status, relayerWallet.address).encodeABI();
    const gas = await web3.eth.estimateGas({
      to: deployedAddresses.candidateRegistration,
      data: txData,
      from: relayerWallet.address
    });
    const gasPrice = await web3.eth.getGasPrice();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: deployedAddresses.candidateRegistration,
        data: txData,
        gas,
        gasPrice,
        from: relayerWallet.address
      },
      relayerPrivateKey
    );

    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return res.status(200).json({
      message: 'Nomination period updated successfully!',
      txHash: tx.transactionHash
    });
  } catch (error) {
    console.error('Error toggling nomination period:', error);
    return res.status(500).json({ message: 'Failed to toggle nomination period', error });
  }
};

// COMMENTED OUT: Now handled through submit -> approve -> register logic
/*
exports.registerCandidate = async (req, res) => {
  try {
    const { userId, electionId, party } = req.body;
    const { address: candidateWalletAddress } = generateWallet();
    const existingCandidate = await Candidate.findOne({ userId, electionId });

    if (existingCandidate) {
      return res.status(400).json({
        message: "Candidate is already registered for this election",
      });
    }

    const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
    const relayerWallet = web3.eth.accounts.privateKeyToAccount(relayerPrivateKey);

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const electionNumber = election.electionNumber;
    const txData = candidateRegistrationContract.methods.registerCandidateFor(candidateWalletAddress, "Candidate1", electionNumber).encodeABI();

    const gas = await web3.eth.estimateGas({
      to: deployedAddresses.candidateRegistration,
      data: txData,
      from: relayerWallet.address,
    });
    const gasPrice = await web3.eth.getGasPrice();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: deployedAddresses.candidateRegistration,
        data: txData,
        gas,
        gasPrice,
        from: relayerWallet.address,
      },
      relayerPrivateKey
    );

    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    const candidate = new Candidate({
      userId,
      electionId,
      walletAddress: candidateWalletAddress,
      party,
      txHash: tx.transactionHash,
      status: "approved",
    });

    await candidate.save();

    res.status(201).json({
      message: "Candidate registered successfully",
      candidate,
    });
  } catch (error) {
    console.error("Error registering candidate:", error);
    res.status(500).json({ message: "Failed to register candidate", error });
  }
};
*/

exports.submitCandidateRequest = async (req, res) => {
  const {  electionId, party,motto,symbolUrl} = req.body;
  console.log(electionId, party,motto,symbolUrl)
  const userId = req.user.id;
  console.log(userId)
  try {
    const existingRequest = await Candidate.findOne({ userId, electionId, status: "pending" });
    if (existingRequest) {
      return res.status(400).json({ message: "Candidate has already submitted a request." });
    }

    const newCandidateRequest = new Candidate({
      userId,
      electionId,
      party,
      walletAddress: null,
      status: "pending",
      motto,
      symbolUrl
    });

    await newCandidateRequest.save();
    const candidate = await User.findById(userId);
    const candidateName = candidate.name;
    console.log(candidateName)
    const activity = new Activity({
  action: "New candidate request received",
  user: candidateName,  // Get from user data
  type: "candidate",
});

await activity.save(); // ✅ Save to DB

// Emit to socket
const io = req.app.get("io");
io.emit("newActivity", activity);
    res.status(200).json({ message: "Candidate request submitted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit candidate request"

     });
  }
};

exports.rejectCandidateRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await Candidate.findById(requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found or already processed." });
    }

    await Candidate.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Candidate request rejected and removed." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject candidate request" });
  }
};

exports.approveCandidateRequest = async (req, res) => {
  const { requestId } = req.params;
  try {
    const request = await Candidate.findById(requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found or already processed." });
    }

    const user = await User.findById(request.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found for this candidate request." });
    }

    const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
    const relayerWallet = web3.eth.accounts.privateKeyToAccount(relayerPrivateKey);
    const { address: generatedWalletAddress } = generateWallet();

    const election = await Election.findById(request.electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const electionNumber = election.electionNumber;
    const candidateName = user.name;
    
    const txData = candidateRegistrationContract.methods
      .registerCandidateFor(generatedWalletAddress, candidateName, electionNumber)
      .encodeABI();

    const gas = await web3.eth.estimateGas({
      to: deployedAddresses.candidateRegistration,
      data: txData,
      from: relayerWallet.address,
    });
    const gasPrice = await web3.eth.getGasPrice();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: deployedAddresses.candidateRegistration,
        data: txData,
        gas,
        gasPrice,
        from: relayerWallet.address,
      },
      relayerPrivateKey
    );

    const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    request.walletAddress = generatedWalletAddress;
    request.status = "approved";
    request.txHash = tx.transactionHash;

    // Push the new candidate to the election's candidates array
    election.candidates.push({
      candidateId: request._id,  // The candidate's ID
      walletAddress: generatedWalletAddress,
      name: candidateName,
      party: request.party,  // Assuming party info is in the request
      votes: 0,  // Initial vote count is 0
    });
    
    await election.save(); // Save the updated election

    await request.save(); // Save the updated candidate request
    
    const activity = new Activity({
  action: `Candidate ${candidateName} request approved.`,
  user: "Admin",  // Get from user data
  type: "approval",
});

await activity.save(); // ✅ Save to DB

// Emit to socket
const io = req.app.get("io");
io.emit("newActivity", activity);
    res.status(200).json({
      message: "Candidate approved and registered on blockchain.",
      txHash: tx.transactionHash,
      candidate: request,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve and register candidate", error: err });
  }
};



// controller: getAllCandidateRequests

exports.getAllCandidateRequests = async (req, res) => {
  try {
    // Fetch all candidate requests with their status
    const requests = await Candidate.find().populate("userId electionId");

    res.status(200).json({
      message: "All candidate requests fetched successfully!",
      requests,
    });
  } catch (error) {
    console.error("Error fetching candidate requests:", error);
    res.status(500).json({ message: "Failed to fetch candidate requests", error });
  }
};

// controller: getMyCandidateRequest

exports.getMyCandidateRequest = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming `req.user` is populated by auth middleware
    // Find candidate request by the user
    console.log(userId)
    const requests = await Candidate.find({
      userId,
      status: { $in: ["pending", "approved"] },
    }).populate({
      path: "electionId",
      select: "title", // fetch only electionTitle from Election model
    }).select("_id party electionId status createdAt symbolUrl"); // Select required fields from Candidate
    if (requests.length === 0) {
      return res.status(404).json({ message: "No pending or approved requests found." });
    }

    // Format the output as requested
    const formattedRequests = requests.map((req) => ({
      _id: req._id.toString(),
      party: req.party,
      electionId: req.electionId._id?.toString() || "", // fallback in case of missing election
      electionTitle: req.electionId?.title || "N/A",
      status: req.status,
      submittedAt: req.createdAt,
      symbolUrl: req.symbolUrl
    }));
    res.status(200).json({
      message: "Your candidate request fetched successfully!",
      formattedRequests,
    });
  } catch (error) {
    console.error("Error fetching candidate request:", error);
    res.status(500).json({ message: "Failed to fetch candidate request", error });
  }
};


// controller: deleteCandidateRequest

exports.deleteCandidateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id; // Assuming `req.user` is populated by auth middleware

    // Find the candidate request by ID
    const request = await Candidate.findById(requestId);

    if (!request || request.userId.toString() !== userId || request.status !== "pending") {
      return res.status(400).json({ message: "You can only delete your own pending requests." });
    }

    // Delete the candidate request
    await Candidate.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Candidate request deleted successfully." });
  } catch (error) {
    console.error("Error deleting candidate request:", error);
    res.status(500).json({ message: "Failed to delete candidate request", error });
  }
};


// controller: getApprovedCandidates

exports.getApprovedCandidates = async (req, res) => {
  try {
    // Find all approved candidates
    const candidates = await Candidate.find({ status: "approved" }).populate("userId electionId");
    console.log("candal ka ---",candidates)
    res.status(200).json({
      message: "Approved candidates fetched successfully!",
      candidates,
    });
  } catch (error) {
    console.error("Error fetching approved candidates:", error);
    res.status(500).json({ message: "Failed to fetch approved candidates", error });
  }
};



