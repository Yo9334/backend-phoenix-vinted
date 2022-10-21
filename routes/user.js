const express = require("express");
const router = express.Router();

const uid2 = require("uid2"); // Package qui sert à créer des string aléatoires
const SHA256 = require("crypto-js/sha256"); // Sert à encripter une string
const encBase64 = require("crypto-js/enc-base64"); // Sert à transformer l'encryptage en string

const User = require("../models/User");

//SIGNUP
router.post("/signup", async (req, res) => {
  console.log("==>", "route /user/signup");
  const { username, email, password, newsletter } = req.body;

  try {
    const userToFind = await User.findOne({ email: email });
    if (userToFind) {
      return res.status(409).json({ message: "This email is already exist !" });
    }

    const salt = uid2(16);
    const token = uid2(64);
    const hash = SHA256(salt + password).toString(encBase64);

    if (username && password) {
      const newUser = new User({
        email: email,
        account: {
          username: username,
        },
        newsletter: newsletter,
        token: token,
        hash: hash,
        salt: salt,
      });

      await newUser.save();

      res.json({
        _id: newUser._id,
        token: newUser.token,
        account: newUser.account,
      });
    } else {
      return res.status(400).json({ message: "Some parameters are missing." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  console.log("==>", "route /user/login");
  const { email, password } = req.body;

  try {
    const userToFind = await User.findOne({ email: email });
    if (!userToFind) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (email && password) {
      const newHash = SHA256(userToFind.salt + password).toString(encBase64);
      if (newHash === userToFind.hash) {
        res.json({
          _id: userToFind._id,
          token: userToFind.token,
          account: userToFind.account,
        });
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      return res.status(400).json({ message: "Some parameters are missing." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
