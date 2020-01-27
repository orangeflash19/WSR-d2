const roles = require("../config/roles");
module.exports = {
  checkAdmin: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "you are not Authorized");
    res.redirect("/");
  },
  checkWitness: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "you are not Authorized");
    res.redirect("/witness/login");
  }
};
