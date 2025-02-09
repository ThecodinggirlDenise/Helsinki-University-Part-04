const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const User = require("../models/user");
require("dotenv").config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  // Find user by username
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Compare password hash
  const passwordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!passwordCorrect) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Generate JWT token
  const userForToken = {
    id: user._id,
    username: user.username,
  };

  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: "1h" });

  res.json({ token, username: user.username, name: user.name });
});

module.exports = router;
