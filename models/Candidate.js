const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
    walletAddress: { type: String, default: null }, 
    party: { type: String, required: true },
    motto:{type:String, required:true},
    txHash: { type: String }, // Store Blockchain Transaction Hash
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    symbolUrl: {
  type: String,
  required: true, // or false if optional
}
}, { timestamps: true });

module.exports = mongoose.model("Candidate", candidateSchema);
