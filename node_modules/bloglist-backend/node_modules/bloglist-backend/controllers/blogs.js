const express = require("express");
const jwt = require("jsonwebtoken");
const Blog = require("../models/blog");
const User = require("../models/user");

const router = express.Router();

// Helper function to extract token from request
const getTokenFrom = (req) => {
  const auth = req.get("Authorization");
  if (auth && auth.startsWith("Bearer ")) {
    return auth.replace("Bearer ", "");
  }
  return null;
};

// ✅ Require authentication for creating blogs
router.post("/", async (req, res) => {
  const token = getTokenFrom(req);
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const user = await User.findById(decodedToken.id);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const blog = new Blog({
    ...req.body,
    user: user._id, // Link blog to user
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  res.status(201).json(savedBlog);
});
router.delete("/:id", async (req, res) => {
  const token = getTokenFrom(req);
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }

  if (blog.user.toString() !== decodedToken.id) {
    return res
      .status(403)
      .json({ error: "You can only delete your own blogs" });
  }

  await Blog.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = router;
