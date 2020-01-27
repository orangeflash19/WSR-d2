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
    successRedirect: "/witness/videocall",
    failureRedirect: "/witness/login",
    failureFlash: true
  })(req, res, next);
});

//Witness videocall page route
router.get("/videocall", checkWitness, (req, res) => {
  res.render("witness/videocall");
});

module.exports = router;
