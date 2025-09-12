const express = require("express");
const route = express.Router();

const { Signup, Login, sendMail, history, getHistory, deleteHistoryByIndex, deleteAllHistory } = require("../controllers/AuthController");

route.post("/Signup", Signup);
route.post("/Login", Login);
route.post("/sendMail", sendMail);
route.post("/addHistory", history)
route.post("/getHistory", getHistory)
route.post("/deleteHistoryByIndex", deleteHistoryByIndex)
route.post("/deleteAllHistory", deleteAllHistory)

module.exports = route;
