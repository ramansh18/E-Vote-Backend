const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    candidates: [
        {
            candidateId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Candidate', // Referencing Candidate model
            },
            walletAddress: String,
            name: String,
            party: String,
            votes: { type: Number, default: 0 },
        }
    ],
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    category: {
    type: String,
    enum: ["general", "local", "student", "corporate", "community"],
    required: true,
  },
    status: {
        type: String,
        enum: ["upcoming", "ongoing", "completed"],
        default: "upcoming",
    },
    electionNumber: {
        type: Number,
        required: true,
        unique: true,
    },
});

module.exports = mongoose.model("Election", electionSchema);
