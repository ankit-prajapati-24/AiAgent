const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizeController');

// Route to get all quiz questions
router.get('/questions/all', quizController.getQuestions);

// Route to get the leaderboard
router.get('/getAllscores', quizController.getLeaderboard);

// Route to save a new score
router.post('/saveScores', quizController.saveScore);

router.post('/questions/bulk', quizController.addBulkQuestions);

module.exports = router;
