// authentication middleware - check if user is loggend in
var isLoggedIn = function (req, res, next){
  if(req.session && req.session.userId) {
    next();
  }
  else {
    res.redirect("/users/login");
  }
}

module.exports = isLoggedIn;