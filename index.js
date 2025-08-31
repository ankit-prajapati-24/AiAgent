const express = require('express');
const app = express();
const http = require('http');
const dbconnect = require("./config/connectToDb");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const Authrouter = require("./routes/Auth");
const blogRoutes = require("./routes/BlogRoutes");
const chatRoutes = require("./routes/chat");
const quizRoutes = require("./routes/quize");
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file
const PORT = process.env.PORT || 4000;

// connect database
dbconnect();

// middleware
const bodyparser = require("body-parser");

app.use(cookieParser());
app.use(bodyparser.json());
app.use(
  cors({
    origin: "*",
    credentials: true
  })
);


app.use("/api/v1/Auth",Authrouter);
app.use("/api/v1/blog",blogRoutes);
app.use("/api/v1/AiAgent",chatRoutes);
app.use("/api/v1/quiz",quizRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "Your server is running"
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
