const Question = require("../models/questionModel");
const Answer = require("../models/answerModel");
exports.addQuestion = async (req, res) => {
  try {
    const { title, userId } = req.body; // 👈 userId bhi lena hoga
    const question = await Question.create({ title, user: userId });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().populate("user"); // 👈 populate user details
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// upvote question
exports.upvoteQuestion = async (req, res) => {
  try {
    const { id } = req.body;
    const q = await Question.findByIdAndUpdate(id, { $inc: { votes: 1 } }, { new: true });
    res.json(q);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
    
// downvote question
exports.downvoteQuestion = async (req, res) => {
  try {
    const { id } = req.body;
    const q = await Question.findByIdAndUpdate(id, { $inc: { votes: -1 } }, { new: true });
    res.json(q);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addAnswer = async (req, res) => {
  try {
    const { questionId, text, userId } = req.body; // 👈 userId bhi lena hoga
    const answer = await Answer.create({ questionId, text, user: userId });
    res.status(201).json(answer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnswers = async (req, res) => {
  try {
    const answers = await Answer.find()
      .populate("user") // 👈 populate user info
      .populate("questionId"); // 👈 optional: show related question title
    res.json(answers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ⬆️ Upvote an answer
exports.upvoteAnswer = async (req, res) => {
  try {
    const { id } = req.body; // answer id
    const answer = await Answer.findByIdAndUpdate(
      id,
      { $inc: { votes: 1 } },
      { new: true }
    );
    res.json(answer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ⬇️ Downvote an answer
exports.downvoteAnswer = async (req, res) => {
  try {
    const { id } = req.body;
    const answer = await Answer.findByIdAndUpdate(
      id,
      { $inc: { votes: -1 } },
      { new: true }
    );
    res.json(answer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
