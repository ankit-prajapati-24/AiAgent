const express = require("express");
const route = express.Router();

const {chatController} = require("../controllers/chatController");

route.post("/Chat",chatController);



module.exports = route;
