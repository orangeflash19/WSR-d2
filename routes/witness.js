const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const router = express.Router();
const { checkWitness } = require("../helpers/auth");

// load Witness model
require("../models/Witness");
const Witness = mongoose.model("witnesses");

//Witness login route
router.get("/login", (req, res) => {
  res.render("witness/login");
});

// Witness login POST
router.post("/login", (req, res, next) => {
  passport.authenticate("witnessLocal", {
    password: req.body.password,
    successRedirect: "/videoscreen",
    failureRedirect: "/witness/login",
    failureFlash: true
  })(req, res, next);
});

//Witness videocall page route
// router.get("localhost:3000/videoscreen", checkWitness, (req, res) => {
//   res.render("videoscreen");
// });

module.exports = router;
