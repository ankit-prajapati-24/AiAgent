const mongoose = require('mongoose');

// Schema for a single quiz question
const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [String],
        required: true
    },
    answer: {
        type: String,
        required: true
    }
});

// Schema for a leaderboard entry
const scoreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Question = mongoose.model('Question', questionSchema);
const Score = mongoose.model('Score', scoreSchema);

module.exports = { Question, Score };
