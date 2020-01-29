module.exports = {
  checkAdmin: function(req, res, next) {
    if (req.isAuthenticated() && req.user.username) {
      return next();
    }
    req.flash("error_msg", "you are not Authorized");
    res.redirect("/");
  },
  checkWitness: function(req, res, next) {
    if (req.isAuthenticated() && req.user.email) {
      return next();
    }
    req.flash("error_msg", "you are not Authorized");
    res.redirect("/witness/login");
  }
};
