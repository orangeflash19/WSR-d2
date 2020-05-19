const express = require("express");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const router = express.Router();
const { checkAdmin } = require("../helpers/auth");
const passwordcrypt = require("../config/passwordcrypt");

//load Admin model
require("../models/Admin");
const Admin = mongoose.model("admins");

// load Witness model
require("../models/Witness");
const Witness = mongoose.model("witnesses");

// Admin login route
router.get("/login", (req, res) => {
  res.render("admin/login");
});

// Admin login form POST
router.post("/login", (req, res, next) => {
  passport.authenticate("adminLocal", {
    successRedirect: "/admin/dashboard",
    failureRedirect: "/admin/login",
    failureFlash: true,
  })(req, res, next);
});

// Admin Dashboard route
router.get("/dashboard", checkAdmin, (req, res) => {
  res.render("admin/dashboard", { layout: "admindashboard" });
});

// Admin register admin route
router.get("/register-admin", checkAdmin, (req, res) => {
  res.render("admin/register-admin", { layout: "admindashboard" });
});

// Admin Register Form POST
router.post("/register-admin", (req, res) => {
  let errors = [];
  if (req.body.password != req.body.password2) {
    errors.push({ text: "Password do not Match" });
  }

  if (req.body.password.length < 4) {
    errors.push({ text: "Password must be atleast 4 characters" });
  }
  // console.log(errors);

  if (errors.length > 0) {
    res.render("admin/register-admin", {
      errors: errors,
      username: req.body.username,
      password: req.body.password,
      password2: req.body.password2,
      layout: "admindashboard",
    });
  } else {
    Admin.findOne({ username: req.body.username }).then((admin) => {
      if (admin) {
        req.flash("error_msg", "username already registered");
        res.redirect("/admin/register-admin");
      } else {
        const newAdmin = new Admin({
          username: req.body.username,
          password: req.body.password,
        });
        // console.log(newAdmin);
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newAdmin.password, salt, (err, hash) => {
            if (err) throw err;
            newAdmin.password = hash;
            newAdmin
              .save()
              .then(() => {
                req.flash(
                  "success_msg",
                  "Admin is now registered and can log in"
                );
                res.redirect("/admin/register-admin");
              })
              .catch((err) => {
                console.log(err);
                return;
              });
          });
        });
      }
    });
  }
});

// Admin register witness route
router.get("/register-witness", checkAdmin, (req, res) => {
  res.render("admin/register-witness", { layout: "admindashboard" });
});

// Witness register form POST
router.post("/register-witness", (req, res) => {
  let errors = [];
  if (req.body.password.length < 4) {
    errors.push({ text: "Password must be atleast 4 characters" });
  }

  if (errors.length > 0) {
    res.render("admin/register-witness", {
      errors: errors,
      email: req.body.email,
      password: req.body.password,
      layout: "admindashboard",
    });
  } else {
    Witness.findOne({ email: req.body.email }).then((witness) => {
      if (witness) {
        req.flash("error_msg", "email already registered");
        res.redirect("/admin/register-witness");
      } else {
        const newWitness = new Witness({
          email: req.body.email,
          password: req.body.password,
        });

        // encrypting witness account password
        var enc = passwordcrypt.encrypt(newWitness.password);
        newWitness.password = enc;

        // saving witness details to db - registering witness account
        newWitness
          .save()
          .then(() => {
            req.flash(
              "success_msg",
              "Witness is now registered and can log in"
            );
            res.redirect("/admin/register-witness");
          })
          .catch((err) => {
            console.log(err);
            return;
          });
      }
    });
  }
});

// Admin send Credentials to witness route
router.get("/send-credentials", checkAdmin, (req, res) => {
  res.render("admin/send-credentials", { layout: "admindashboard" });
});

// Admin send credentials form POST
router.post("/send-credentials", (req, res) => {
  let errors = [];
  if (!req.body.email) {
    errors.push({ text: "please provide a email" });
  }

  if (errors.length > 0) {
    res.render("admin/register-witness", {
      errors: errors,
      email: req.body.email,
      layout: "admindashboard",
    });
  } else {
    Witness.findOne({ email: req.body.email }).then((witness) => {
      // check if witness account with the given email exists
      if (!witness) {
        req.flash("error_msg", "Invalid email: not a registered witness email");
        req.redirect("/admin/send-credentials");
      }
      // if witness account exists decrypt its password and store it in dnc
      var dnc = passwordcrypt.decrypt(witness.password);

      // send email to witness
      const output = `<p>This is your password for WSR account => ${dnc}</p>`;

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL, // email id of sender
          pass: process.env.PASSWORD, // email password of sender
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // setup email data with unicode symbols
      let mailOptions = {
        from: '"Nodemailer Contact testing" <rentaros80@gmail.com>', // sender address
        to: req.body.email, // list of receivers
        subject: "Node witness password", // Subject line
        text: "This is your password for WSR account", // plain text body
        html: output, // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        req.flash("success_msg", "Email has been sent");
        res.redirect("/admin/send-credentials");
      });
    });
  }
});

// Admin witness list route
router.get("/witness-list", checkAdmin, (req, res) => {
  Witness.find({})
    .sort({ date: "desc" })
    .lean()
    .then((witnesses) => {
      res.render("admin/witness-list", {
        witnesses: witnesses,
        layout: "admindashboard",
      });
    });
});

// Admin Videopage route
router.get("../videoscreen", checkAdmin, (req, res) => {
  res.render("videoscreen");
});

module.exports = router;
