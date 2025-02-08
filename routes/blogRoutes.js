import express from "express";
import Blog from "../models/Blog.js";  // Blog model
import authenticateJWT from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Blog Post
router.post("/", authenticateJWT, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required!" });
  }

  try {
    const newBlog = new Blog({
      title,
      content,
      userId: req.user.userId,  // User who created the post
    });

    await newBlog.save();
    res.status(201).json({ message: "Blog post created!", blog: newBlog });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get All Blog Posts
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get Blog Post by ID
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found!" });
    }
    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update Blog Post (Protected)
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found!" });
    }

    // Check if the logged-in user is the creator of the blog post
    if (blog.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only update your own posts!" });
    }

    // Update blog post
    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;
    await blog.save();
    res.status(200).json({ message: "Blog post updated!", blog });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete Blog Post (Protected)
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found!" });
    }

    // Check if the logged-in user is the creator of the blog post
    if (blog.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only delete your own posts!" });
    }

    await blog.remove();
    res.status(200).json({ message: "Blog post deleted!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
