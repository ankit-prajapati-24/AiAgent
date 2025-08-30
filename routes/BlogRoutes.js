const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");

// All requests as POST
router.post("/create", blogController.createBlog);
router.get("/all", blogController.getAllBlogs);
router.post("/getById", blogController.getBlogById);
router.post("/updateById", blogController.updateBlogById);
router.post("/deleteById", blogController.deleteBlogById);

module.exports = router;
