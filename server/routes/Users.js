const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcrypt");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { sign } = require("jsonwebtoken");
const { Op } = require('sequelize');

router.post("/", async (req, res) => {
  const { username, email, password, confirmPass } = req.body;
  const user = await Users.findOne({ where: { username: username } });
  const email1 = await Users.findOne({ where: { email: email } });

  if (user) {
    res.json({ error: "This user already exists" });
  }else if (email1){
    res.json({error: "This email has already been registered"})
  } else if (!email || !email.includes("@csus.edu")) {
    res.json({ error: "Must provide a valid Sac State email" });
  } else if (password !== confirmPass) {
    res.json({ error: "Passwords do not match" });
  } else {
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        try {
          await Users.create({
            username: username,
            email: email,
            password: hash
          });
          res.json("Success");
        } catch (error) {
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
    });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await Users.findOne({ where: { username: username } });

  if (!user) res.json({ error: "User Doesn't Exist" });
  else {
    bcrypt.compare(password, user.password).then(async (match) => {
      if (!match) res.json({ error: "Wrong Username And Password Combination" });

      const accessToken = sign(
        { username: user.username, id: user.id, role: user.role },
        "importantsecret"
      );
      res.json({ token: accessToken, username: username, id: user.id, role: user.role });
    });
  }
});

router.get("/auth", validateToken, (req, res) => {
  res.json(req.user);
});

router.get("/basicinfo/:id", async (req, res) => {
  const id = req.params.id;

  const basicInfo = await Users.findByPk(id, {
    attributes: { exclude: ["password"] },
  });

  res.json(basicInfo);
});

router.put("/changepassword", validateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await Users.findOne({ where: { username: req.user.username } });

  bcrypt.compare(oldPassword, user.password).then(async (match) => {
    if (!match) res.json({ error: "Wrong Password Entered!" });

    bcrypt.hash(newPassword, 10).then((hash) => {
      Users.update(
        { password: hash },
        { where: { username: req.user.username } }
      );
      res.json("SUCCESS");
    });
  });
});

module.exports = router;
