const bcrypt = require("bcrypt");
const express = require("express");
const User = require("../models/user");
const router = express.Router();

router.post("/", async (req, res) => {
  const { username, name, password } = req.body;

  if (password.length < 3) {
    return res.status(400).json({ error: "Password too short" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ username, name, passwordHash });

  const savedUser = await user.save();
  res.status(201).json(savedUser);
});

module.exports = router;
