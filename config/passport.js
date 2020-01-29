const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bycrypt = require("bcryptjs");
const passwordcrypt = require("./passwordcrypt");

// Load Admin model
const Admin = mongoose.model("admins");

// Load Witness model
const Witness = mongoose.model("witnesses");

function SessionConstructor(username, email, userGroup) {
  this.username = username;
  this.email = email;
  this.userGroup = userGroup;
}

module.exports = function(passport) {
  passport.use(
    "adminLocal",
    new LocalStrategy((username, password, done) => {
      // Match Admin
      Admin.findOne({
        username: username
      }).then(admin => {
        if (!admin) {
          return done(null, false, { message: "NO admin found" });
        }

        // Match password
        bycrypt.compare(password, admin.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, admin);
          } else {
            return done(null, false, { message: "Password Incorrect" });
          }
        });
      });
    })
  );

  // Witness login strategy
  passport.use(
    "witnessLocal",
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match Witness
      Witness.findOne({
        email: email
      }).then(witness => {
        if (!witness) {
          return done(null, false, { message: "NO Witness found" });
        }

        // Match password
        var decpassword = passwordcrypt.decrypt(witness.password);
        if (password == decpassword) {
          return done(null, witness);
        } else {
          return done(null, false, { message: "Password Incorrect" });
        }
      });
    })
  );

  passport.serializeUser(function(userObject, done) {
    // userObject could be a Model1 or a Model2... or Model3, Model4, etc.
    let userGroup = "admin";
    let userPrototype = Object.getPrototypeOf(userObject);

    if (userPrototype === Admin.prototype) {
      userGroup = "admin";
    } else if (userPrototype === Witness.prototype) {
      userGroup = "witness";
    }

    let sessionConstructor = new SessionConstructor(
      userObject.username,
      userObject.email,
      userGroup,
      ""
    );
    done(null, sessionConstructor);
  });

  passport.deserializeUser(function(sessionConstructor, done) {
    if (sessionConstructor.userGroup == "admin") {
      Admin.findOne(
        {
          username: sessionConstructor.username
        },
        "-localStrategy.password",
        function(err, user) {
          // When using string syntax, prefixing a path with - will flag that path as excluded.
          done(err, user);
        }
      );
    } else if (sessionConstructor.userGroup == "witness") {
      Witness.findOne(
        {
          email: sessionConstructor.email
        },
        "-localStrategy.password",
        function(err, user) {
          // When using string syntax, prefixing a path with - will flag that path as excluded.
          done(err, user);
        }
      );
    }
  });
};
