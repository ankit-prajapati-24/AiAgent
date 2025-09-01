const { Question, Score } = require('../models/question');

// Controller to get all quiz questions
exports.getQuestions = async (req, res) => {
    try {
        const questions = await Question.find();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching questions", error });
    }
};

// Controller to save a new score to the leaderboard
exports.saveScore = async (req, res) => {
    try {
        const { name, score } = req.body;   
        const newScore = new Score({ name, score });
        await newScore.save();
        res.status(201).json({ message: "Score saved successfully" });  
    } catch (error) {
        res.status(500).json({ message: "Error saving score", error });
    }
};

// Controller to get the top 10 leaderboard scores
exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Score.find()
            .sort({ score: -1, createdAt: 1 })
            
        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: "Error fetching leaderboard", error });
    }
};

exports.addBulkQuestions = async (req, res) => {
    try {
        const questionsToAdd = req.body;
        if (!Array.isArray(questionsToAdd)) {
            return res.status(400).json({ message: "Request body must be an array of questions." });
        }
        await Question.insertMany(questionsToAdd);
        res.status(201).json({ message: "Questions added successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error adding bulk questions", error });
    }
};
