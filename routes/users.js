var express = require('express');
var router = express.Router();
var User = require('../schemas/UserSchema');
var isLoggedIn = require('./isLoggedIn.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET create user page. */
router.get('/create', function(req, res, next) {
  res.render('createUser', {});
})

/* POST create user */
router.post('/create', function(req, res, next) {
  if (req.body.userName &&
    req.body.email &&
    req.body.password &&
    req.body.passwordConf) {
      console.log('create user account request received');
    var userData = {
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }
    //use schema.create to insert data into the db
    User.create(userData, function (err, user) {
      if (err) {
        console.log('error:', err);
        res.json({
          message: 'error',
          error: err
        })
      } else {
        console.log('user created', user._id);
        req.session.userId = user._id;
        req.session.userName = user.userName;
        res.json({
          message: 'success',
          userName: userData.userName
        });
      }
    });
  } 
})

/* GET login user page. */
router.get('/login', function(req, res, next) {
  res.render('loginUser', {});
})

/* POST login user */
router.post('/login', function(req, res, next) {
  if (req.body.email &&
    req.body.password) {
      console.log('login user account request received');
      User.authenticate(req.body.email, req.body.password, function(error, user) {
        if (error || !user) {
          res.json({
            message: 'Wrong email or password.'
          })
        } else {
          req.session.userId = user._id;
          req.session.userName = user.userName;
          console.log('user logged in');
          res.json({
            message: 'success',
            userId: user._id,
            userName: user.userName
          })
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
        res.json({
          message: 'succes - user logged out'
        });
      }
    });
  }
});

module.exports = router;
