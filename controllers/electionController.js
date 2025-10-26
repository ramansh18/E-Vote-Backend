const Election = require("../models/Election");
const { web3,contracts } = require("../web3/index.js");
const {electionContract} = contracts;
const { votingContract,candidateRegistrationContract } = contracts;
const deployedAddresses = require("../contractAddresses.json");
require("dotenv").config({ path: "../.env" });
const Candidate = require("../models/Candidate.js")
const User = require("../models/User");
const Activity = require('../models/activity.js')
const axios = require('axios');
const Notification = require('../models/Notifications')
exports.createElection = async (req, res) => {
    try {
        const { title, description, candidates, startTime, endTime,category } = req.body;
        const latestElection = await Election.findOne().sort({ electionNumber: -1 });
        const newElectionNumber = latestElection ? latestElection.electionNumber + 1 : 1;

        const newElection = new Election({
            title,
            description,
            candidates,
            startTime,
            endTime,
            category,
            electionNumber: newElectionNumber,
            status: "upcoming"
        });

        await newElection.save();
        res.status(201).json({ message: "Election created successfully!", election: newElection });
    } catch (error) {
        console.error("Election creation failed:", error);
        res.status(500).json({ message: "Error creating election", error });
    }
};

// ✅ Get All Elections (Off-chain)
exports.getElections = async (req, res) => {
  try {
    const elections = await Election.find({
  status: { $in: ["ongoing", "upcoming"] },
});
  console.log(elections.length)

    // You may also want to get user's voting history here if needed for hasVoted.
    // Assuming you have req.user.id from auth middleware:
    // const user = await User.findById(req.user.id);
    // const userVotingHistory = user ? user.votingHistory : [];

    // For now, assume empty userVotingHistory or get from your logic:
    const userVotingHistory = []; // TODO: Replace with real user's votingHistory if needed

    const transformedElections = elections.map((election) => {
      // sum votes of all candidates
      const totalVotes = election.candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

      // check if user voted (match election._id with votingHistory.electionId)
      const hasVoted = userVotingHistory.some(
        (vote) => vote.electionId.toString() === election._id.toString()
      );

      return {
        id: election._id,
        title: election.title,
        description: election.description,
        startDate: election.startTime ? election.startTime.toISOString().split("T")[0] : null,
        endDate: election.endTime ? election.endTime.toISOString().split("T")[0] : null,
        status: election.status==="ongoing" ? "active": election.status,
        totalVotes,
        hasVoted,
        category: election.category || "General",
        candidates: election.candidates.length,
      };
    });

    res.status(200).json(transformedElections);
  } catch (error) {
    res.status(500).json({ message: "Error fetching elections", error });
  }
};


exports.getUpcomingElections = async (req, res) => {
    try {
        const elections = await Election.find({
        status: { $in: [ "upcoming"] },
      });
        res.status(200).json(elections);
    } catch (error) {
        res.status(500).json({ message: "Error fetching elections", error });
    }
};
exports.getAvailableElections = async (req, res) => {
    try {
      const elections = await Election.find({
        status: { $in: ["ongoing", "upcoming"] },
      });
  
      res.status(200).json(elections);
    } catch (error) {
      console.error("Error fetching elections:", error.message);
      res.status(500).json({ message: "Failed to load elections" });
    }
  };
// ✅ Get Single Election (Off-chain)
exports.getElectionById = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ message: "Election not found" });
        }
        res.status(200).json(election);
    } catch (error) {
        res.status(500).json({ message: "Error fetching election", error });
    }
};

// ✅ Start Election (On-chain + update DB)
exports.startElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    const electionId = req.params.id;

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const electionNumber = election.electionNumber;
    const approvedCandidates = await Candidate.find({
      electionId: election._id,
      status: "approved"
    });
    console.log("length",approvedCandidates.length)
    if (approvedCandidates.length < 2) {
      return res.status(400).json({ message: "Minimum 2 approved candidates required." });
    }

    const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
    const relayerWallet = web3.eth.accounts.privateKeyToAccount(relayerPrivateKey);

    // ✅ Check if election already started
    const status = await electionContract.methods.getElectionStatus(electionNumber).call();
    if (status === "Ongoing" || status === "Ended") {
  return res.status(400).json({
    success: false,
    message: `Election is already ${status.toLowerCase()}, cannot start again.`,
  });
}
    console.log(status)
    // ✅ Add only new candidates to Voting contract
    const alreadyAdded = await votingContract.methods.getAllCandidates(electionNumber).call();
    const newCandidates = approvedCandidates.filter(
      c => !alreadyAdded.includes(c.walletAddress)
    );

    for (let candidate of newCandidates) {
      const txDataAddCandidate = votingContract.methods.addCandidate(electionNumber,candidate.walletAddress).encodeABI();
      const gas = await web3.eth.estimateGas({
        to: deployedAddresses.voting,
        data: txDataAddCandidate,
        from: relayerWallet.address
      });
      const gasPrice = await web3.eth.getGasPrice();
      const signedTx = await web3.eth.accounts.signTransaction({
        to: deployedAddresses.voting,
        data: txDataAddCandidate,
        gas,
        gasPrice,
        from: relayerWallet.address
      }, relayerPrivateKey);
      await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    }

    // ✅ Start Election using electionNumber & approvedCount
    const approvedCount = approvedCandidates.length;
    const txDataStartElection = electionContract.methods.startElection(electionNumber, approvedCount).encodeABI();
    const gasStart = await web3.eth.estimateGas({
      to: deployedAddresses.election,
      data: txDataStartElection,
      from: relayerWallet.address
    });
    const gasPriceStart = await web3.eth.getGasPrice();
    const signedTxStart = await web3.eth.accounts.signTransaction({
      to: deployedAddresses.election,
      data: txDataStartElection,
      gas: gasStart,
      gasPrice: gasPriceStart,
      from: relayerWallet.address
    }, relayerPrivateKey);
    const tx = await web3.eth.sendSignedTransaction(signedTxStart.rawTransaction);

    election.status = "ongoing";
    await election.save();

    const activity = new Activity({
      action: `Election ${election.title} Started`,
      user: "Admin",
      type: "election",
    });
    await activity.save();

    const io = req.app.get("io");
    io.emit("newActivity", activity);

    const notification = new Notification({
  type: "ElectionStart", // must match enum exactly
  title: "Election Started", // add this to satisfy schema
  message: `Election "${election.title}" has started!`,
  // election: electionId, // optional unless used elsewhere
  isGlobal: true,
  createdAt: new Date(),
});

    await notification.save();

    io.emit("notification", {
      type: notification.type,
      message: notification.message,
      electionId: electionId,
      createdAt: notification.createdAt,
    });

    res.status(200).json({
      message: "Election started successfully!",
      election,
      txHash: tx.transactionHash
    });

  } catch (error) {
    console.error("Error in startElection:", error);
    res.status(500).json({ message: "Error starting election", error });
  }
};





// ✅ End Election (On-chain + update DB)
exports.endElection = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ message: "Election not found" });
        }

        const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
        const relayerWallet = web3.eth.accounts.privateKeyToAccount(relayerPrivateKey);

        const txData = electionContract.methods.endElection(election.electionNumber).encodeABI();

        // Estimate gas
        const gas = await web3.eth.estimateGas({
            to: deployedAddresses.election, // Use the deployed contract address
            data: txData,
            from: relayerWallet.address
        });

        // Get the gas price
        const gasPrice = await web3.eth.getGasPrice();

        // Sign the transaction
        const signedTx = await web3.eth.accounts.signTransaction(
            {
                to: deployedAddresses.election,
                data: txData,
                gas,
                gasPrice,
                from: relayerWallet.address
            },
            relayerPrivateKey
        );

        // Send the signed transaction
        const tx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        // Update the election status to "completed"
        election.status = "completed";
        await election.save();
        const notif = await Notification.create({
          type: 'ElectionResult', // Correct casing
          title: 'Election Ended', // Required field
          message: `The election "${election.title}" has ended. Check out the results now!`,
          read: false,
          isGlobal: true, // Correct field name
          createdAt: new Date(),
});
  const io = req.app.get("io");
  // Emit to all connected clients
  io.emit('notification', {
    id: notif._id,
    type: notif.type,
    message: notif.message,
    createdAt: notif.createdAt,
  });
        res.status(200).json({
            message: "Election ended successfully!",
            election,
            txHash: tx.transactionHash // Return the transaction hash
        });
    } catch (error) {
        console.error("Error in endElection:", error);
        res.status(500).json({ message: "Error ending election", error });
    }
};


// ✅ Delete Election (Off-chain)
exports.deleteElection = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ message: "Election not found" });
        }

        if (election.status === "ongoing") {
            return res.status(400).json({ message: "Cannot delete an ongoing election." });
        }

        // Directly delete the election
        await Election.findByIdAndDelete(req.params.id);
        console.log(`Election with ID: ${req.params.id} deleted successfully.`);
        res.status(200).json({ message: "Election deleted successfully!" });
    } catch (error) {
        console.error('Error deleting election:', error);
        res.status(500).json({ message: "Error deleting election", error });
    }
};

exports.getApprovedCandidatesForElection = async (req, res) => {
    try {
      const { electionId } = req.params;
  
      // Fetch all approved candidates for the given election from MongoDB
      const approvedCandidates = await Candidate.find({
        electionId: electionId,
        status: "approved"
      })
        .populate('userId', 'name email')
        .exec();
  
      if (approvedCandidates.length === 0) {
        return res.status(404).json({ message: "No approved candidates found for this election." });
      }
      const election = await Election.findById(electionId);
      // Get all candidates from the blockchain
      const blockchainCandidates = await votingContract.methods.getAllCandidates(election.electionNumber).call();
      const blockchainAddresses = blockchainCandidates.map(addr => addr.toLowerCase());
  
      // Filter candidates whose walletAddress matches any on the blockchain (case-insensitive)
      const finalCandidates = approvedCandidates.filter(candidate =>
        blockchainAddresses.includes(candidate.walletAddress.toLowerCase())
      );
  
      if (finalCandidates.length === 0) {
        return res.status(404).json({ message: "No candidates found on the blockchain for this election." });
      }
  
      // Prepare final response data
      const finalCandidateData = finalCandidates.map(candidate => ({
        _id: candidate._id,
        walletAddress: candidate.walletAddress,
        party: candidate.party,
        motto: candidate.motto,
        user: candidate.userId,
        symbolUrl : candidate.symbolUrl // Populated user details
      }));
     //console.log("final data",finalCandidateData)
      res.status(200).json({ candidates: finalCandidateData });
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Failed to fetch candidates", error: error.message });
    }
  };
  
  
  exports.updateElectionVotes = async (req, res) => {
    try {
      const { electionId } = req.params;
      const election = await Election.findById(electionId);
  
      if (!election) {
        return res.status(404).json({ message: 'Election not found' });
      }
  
      // Fetch updated vote counts from the blockchain
      const updatedCandidates = await Promise.all(
        election.candidates.map(async (candidate) => {
          const voteCount = await votingContract.methods.getVotes(candidate.walletAddress).call();
          return {
            ...candidate.toObject(),
            votes: parseInt(voteCount),
          };
        })
      );
  
      // Update the election document with the new vote counts
      election.candidates = updatedCandidates;
      await election.save();
  
      res.status(200).json({
        message: 'Votes updated successfully from blockchain',
        candidates: updatedCandidates,
      });
    } catch (error) {
      console.error('Error updating votes:', error);
      res.status(500).json({ message: 'Failed to update votes from blockchain' });
    }
  };
  

 
exports.getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Fetch symbolUrls for each candidate using candidateId
    const enrichedCandidates = await Promise.all(
      election.candidates.map(async (c) => {
        const candidateData = await Candidate.findById(c.candidateId).select('symbolUrl');
        return {
          candidateId: c.candidateId,
          walletAddress: c.walletAddress,
          name: c.name,
          party: c.party,
          votes: c.votes,
          symbolUrl: candidateData?.symbolUrl || null, // fallback to null
        };
      })
    );

    res.status(200).json({
      message: 'Election results fetched successfully',
      election: {
        _id: election._id,
        title: election.title,
        status: election.status,
        totalVotes: enrichedCandidates.reduce((sum, c) => sum + (c.votes || 0), 0),
      },
      candidates: enrichedCandidates,
    });
  } catch (error) {
    console.error('Error fetching election results:', error);
    res.status(500).json({ message: 'Failed to fetch election results' });
  }
};




exports.getAllCompletedElectionResults = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const userId = req.user.id;
    const response = await axios.get('http://localhost:5000/api/voter/all',{
  headers: {
    Authorization: `Bearer ${token}`, // forward token
  },});
    console.log(response.data.votersData.length)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const completedElections = await Election.find({ status: "completed" });

    if (completedElections.length === 0) {
      return res.status(404).json({ message: "No completed elections found." });
    }

    // Get total eligible voters count (assuming all voters are eligible for all elections)
    const totalEligibleVoters =response.data.votersData.length

    const results = completedElections.map((election) => {
      // Sum votes from candidates
      const totalVotes = election.candidates.reduce((sum, c) => sum + c.votes, 0);

      // Determine winner candidate (max votes)
      const winnerCandidate = election.candidates.reduce(
        (max, c) => (c.votes > max.votes ? c : max),
        { votes: -1 }
      );

      // Calculate participation rate
      const participationRate =
        totalEligibleVoters > 0 ? ((totalVotes / totalEligibleVoters) * 100).toFixed(1) : "0.0";

      // Check if user has voted in this election (assuming votingHistory contains election IDs as strings)
      const hasVoted = user.votingHistory.includes(election._id.toString());

      return {
        id: election._id,
        title: election.title,
        description: election.description,
        startTime: election.startTime,
        endTime: election.endTime,
        status: election.status,
        totalVotes,
        totalEligibleVoters,
        participationRate: parseFloat(participationRate),
        hasVoted,
        category: "Student Union", // Hardcoded as per your instruction
        winner: {
          name: winnerCandidate.name,
          votes: winnerCandidate.votes,
          percentage: totalVotes > 0 ? parseFloat(((winnerCandidate.votes / totalVotes) * 100).toFixed(1)) : 0,
        },
        candidates: election.candidates.map((candidate) => ({
          name: candidate.name,
          votes: candidate.votes,
          percentage: totalVotes > 0 ? parseFloat(((candidate.votes / totalVotes) * 100).toFixed(1)) : 0,
        })),
      };
    });

    res.status(200).json({ completedElections: results });
  } catch (error) {
    console.error("Error fetching completed election results:", error);
    res.status(500).json({ message: "Server error. Could not retrieve results." });
  }
};

