// authentication middleware - check if user is loggend in
var isLoggedIn = function (req, res, next){
  if(req.session && req.session.userId) {
    next();
  }
  else {
    res.json({
      message: 'user not logged in'
    });
  }
}

module.exports = isLoggedIn;