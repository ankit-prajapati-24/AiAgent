const Blog = require("../models/blog");

// ✅ Create Blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content ,author} = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const newBlog = await Blog.create({ title, content ,author});

    res.status(201).json({ message: "Blog created successfully", blog: newBlog });
  } catch (err) {
    res.status(500).json({ message: "Error creating blog", error: err.message });
  }
};

// ✅ Get All Blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json({ blogs });
  } catch (err) {
    res.status(500).json({ message: "Error fetching blogs", error: err.message });
  }
};

// ✅ Get Blog By ID
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.body;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ blog });
  } catch (err) {
    res.status(500).json({ message: "Error fetching blog", error: err.message });
  }
};

// ✅ Update Blog By ID
exports.updateBlogById = async (req, res) => {
  try {
    const { id, title, content ,author} = req.body;
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, content ,author},
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog updated successfully", blog: updatedBlog });
  } catch (err) {
    res.status(500).json({ message: "Error updating blog", error: err.message });
  }
};

// ✅ Delete Blog By ID
exports.deleteBlogById = async (req, res) => {
  try {
    const { id } = req.body;
    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting blog", error: err.message });
  }
};
