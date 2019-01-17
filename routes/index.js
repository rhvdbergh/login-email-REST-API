var express = require('express');
var router = express.Router();
var isLoggedIn = require('./isLoggedIn.js');

// authentication middleware - check if user is loggend in
function isLoggedIn(req, res, next){
  if(req.session && req.session.userId) {
    next();
  }
  else {
    res.redirect("/users/login");
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
