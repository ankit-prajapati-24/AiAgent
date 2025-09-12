const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionStack", required: true },
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // 👈 user added
}); 

module.exports = mongoose.model("Answer", answerSchema);
