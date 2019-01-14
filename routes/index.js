var express = require('express');
var router = express.Router();
var User = require('../schemas/UserSchema');

// authentication middleware - check if user is loggend in
function isLoggedIn(req, res, next){
  if(req.session && req.session.userId) {
    next();
  }
  else {
    res.redirect("/login-user");
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET create user page. */
router.get('/create-user', function(req, res, next) {
  res.render('createUser', {});
})

/* POST create user */
router.post('/create-user', function(req, res, next) {
  if (req.body.email &&
    req.body.password &&
    req.body.passwordConf) {
      console.log('create user account request received');
    var userData = {
      email: req.body.email,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }
    //use schema.create to insert data into the db
    User.create(userData, function (err, user) {
      if (err) {
        return next(err)
      } else {
        return res.redirect('/');
      }
    });
  } 
})

/* GET login user page. */
router.get('/login-user', function(req, res, next) {
  res.render('loginUser', {});
})

/* POST create user */
router.post('/login-user', function(req, res, next) {
  if (req.body.email &&
    req.body.password) {
      console.log('login user account request received');
      User.authenticate(req.body.email, req.body.password, function(error, user) {
        if (error || !user) {
          var err = new Error('Wrong email or password.');
          err.status = 401;
          return next(err);
        } else {
          req.session.userId = user._id;
          req.session.userName = user.email;
          return res.redirect('/success');
        }
      }) // end user User.authenticate
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

/* GET success for login */
router.get('/success', isLoggedIn, function(req, res, next) {
  res.render('success', {user: req.session.userName});
})

// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;
