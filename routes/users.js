var express = require('express');
var router = express.Router();
var User = require('../schemas/UserSchema');
var isLoggedIn = require('./isLoggedIn.js');
var validator = require('validator');
var sendMail = require('./routes/sendMail.js');

sendMail();

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
    if (validator.isEmail(req.body.email)) {
      if (req.body.password===req.body.passwordConf) {
        var userData = {
          userName: req.body.userName,
          email: req.body.email,
          password: req.body.password,
          passwordConf: req.body.passwordConf,
        }
        //use schema.create to insert data into the db
        User.create(userData, function (err, user) {
          if (err) {
            console.log('User creation error:', err.code);
            if (err.code === 11000) { // MongoError: duplicate entry
              const errMsg = new Error('This email address is already associated with an account.');
              next(errMsg);
            } else {
              const errMsg = new Error('Error: Unable to create user.');
              next(errMsg);
            }
          } else {
            console.log('user created', user._id);
            req.session.userId = user._id;
            req.session.userName = user.userName;
            res.json({
              message: 'success',
              userName: userData.userName,
              userId: user._id
            });
          }
        });
      } else { // password and passwordConf did not match
        console.log('error: password and password confirmation did not match; user not created')
        const err = new Error('password and password confirmation did not match')
      }
    } else {
      console.log('error: user entered unacceptable email');
      res.json({  
        message: 'error: user entered unacceptable email'
      })
    }
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
          const err = new Error('Wrong email or password.');
          next(err);
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
    const err = new Error('All fields required.');
    next(err);
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

/* GET test for being logged in */
router.get('/test', isLoggedIn, function(req, res, next) {
  res.json({
    message: 'test success: user logged in',
    userName: req.session.userName,
    userId: req.session.userId
  })
});

module.exports = router;
