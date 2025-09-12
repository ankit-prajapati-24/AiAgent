const express = require("express");
const {
  addUser, getUsers,
  addQuestion, getQuestions, upvoteQuestion, downvoteQuestion,
  addAnswer, getAnswers, upvoteAnswer, downvoteAnswer
} = require("../controllers/stackFlowController");

const router = express.Router();
// Questions
router.post("/questions/addQuestions", addQuestion);
router.get("/questions/getAllQuestion", getQuestions);
router.post("/questions/upvote", upvoteQuestion);
router.post("/questions/downvote", downvoteQuestion);

// Answers
router.post("/answers/addAnswer", addAnswer);
router.get("/answers/getAllAnswer", getAnswers);
router.post("/answers/upvote", upvoteAnswer);
router.post("/answers/downvote", downvoteAnswer);

module.exports = router;
