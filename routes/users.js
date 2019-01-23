var express = require('express');
var router = express.Router();
var crypto = require('crypto');

// MIDDLEWARE (DEPENDENCIES)
var async = require('async');
var validator = require('validator');

// CUSTOM MIDDLEWARE
var isLoggedIn = require('./isLoggedIn.js');
var mail = require('./sendMail.js');

// SCHEMAS
var User = require('../schemas/UserSchema');

// Variables to set for code reuse
const APP_NAME = 'Washington Camptrader'
const DOMAIN_URL = 'http://localhost:3000'

//**********************************/
//    REST API - JSON RESPONSE     // 
/***********************************/

/* POST create user */
router.post('/create', function(req, res, next) {
  if (req.body.userName &&
    req.body.email &&
    req.body.password &&
    req.body.passwordConf) {
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
            console.log(`User ${req.body.email} creation error:`, err.code);
            if (err.code === 11000) { // MongoError: duplicate entry
              const errMsg = new Error('This email address is already associated with an account.');
              errMsg.status = 403; // forbidden
              return next(errMsg);
            } else {
              const errMsg = new Error(`Error: Unable to create user ${req.body.email}.`);
              // default, 500 status code: internal server error
              return next(errMsg);
            }
          } else {
            console.log('user created', user._id);
            // set login session information for user
            // to log in automatically
            req.session.userId = user._id;
            req.session.userName = user.userName;
            res.json({
              message: 'success',
              userName: userData.userName,
              userId: user._id
            });
            // send mail to welcome user to app
            mail.sendMail(user.email, `Welcome to ${APP_NAME}`, `Welcome to ${APP_NAME}, ${user.userName}!<br><br>Your account has been successfully created.`);
          }
        });
      } else { // password and passwordConf did not match
        console.log('error: password and password confirmation did not match; user not created');
        const err = new Error('password and password confirmation did not match');
        err.status = 403; // forbidden
        return next(err);
      }
    } else { // received email that did not pass validator.isEmail()
      const err = new Error('user entered invalid email');
      err.status = 403; // forbidden      
      return next (err);
    }
  } 
});

/* POST login user */
router.post('/login', function(req, res, next) {
  if (req.body.email &&
    req.body.password) {
      // authenticate user to create session
      User.authenticate(req.body.email, req.body.password, function(error, user) {
        if (error || !user) {
          const err = new Error('Wrong email or password.');
          err.status = 403; // forbidden
          return next(err);
        } else {
          // set login session information to log in user
          req.session.userId = user._id;
          req.session.userName = user.userName;
          // user logged in
          res.json({
            message: 'success',
            userId: user._id,
            userName: user.userName
          });
        }
      }); // end user User.authenticate
  } else { // did not receive email and/or password
    const err = new Error('All fields required.');
    err.status = 403; // forbidden
    return next(err);
  }
});

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
      } // end if ... else
    });
  } // end if (req.session)
});

/* GET authentication test for being logged in */
router.get('/auth', isLoggedIn, function(req, res, next) {
  res.json({
    message: 'success',
    userName: req.session.userName,
    userId: req.session.userId
  })
});

/* POST user password reset request */
router.post('/reset', function(req, res, next) {

  async.waterfall([
    function(done) {
      // create random token
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    }, // update user's account with token
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          const errMsg = new Error('User account not found.');
          errMsg.status = 403; // forbidden
          return next(errMsg);
        } else {
        // create token and set to user's account
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 90000; // password token will expire in 15 minutes
        // save token to user account
        user.save(function(err) {
          done(err, token, user);
        })
        } // end else
      });
    }, 
    function(token, user, done) { // send token to user email
      const subject = `${APP_NAME} Password Reset Request`;
      const msg = `You are receiving this message because you (or someone else) requested a reset of your ${APP_NAME} account password.<br><br>` +
        'To reset your password, please click on the following link, or paste this link into your browser. This link will expire in 15 minutes.<br><br>' +
         DOMAIN_URL + '/reset/' + token + '<br><br>' +
        'If you did not request a password reset, please ignore this email. Your password will remain unchanged.<br>'
      mail.sendMail(user.email, subject, msg);
      res.json({
        message: 'Password reset email sent.',
        userName: 'anonymous'
      });
    }
  ], function(err) {
    if (err) {
      const errMsg = new Error(err);
      // default 500 internal server error code
      return next(errMsg);
    }
  });
});

/* POST reset user password with token */
router.post('/reset/token/:token', function(req, res, next) {
  if (req.body.password === req.body.passwordConf) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        const errMsg = new Error('Invalid or expired password reset token.');
        errMsg.status = 403; // forbidden
        next(errMsg);
      } else {
      
        // change user password
        user.password = req.body.password;
        // revoke token
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // save to user account
        user.save();

        // inform user of password change and invite to log in
        mail.sendMail(user.email, 'Your password was changed', `This email confirms that your ${APP_NAME} account password has successfully been changed. You may now log in with your new password.`);
        
        res.json({
          message: 'success',
          userName: 'anonymous'
        }); 
      } // end if ... else
    }); // end User.findOne()
  } else { // password and passwordConf did not match
    const err = new Error('passwords do not match');
    err.status = 403; // forbidden
    return next(err);
  }
});

/*********************/
//    UTILITIES      // 
/*********************/

/* GET create user page. */
router.get('/create', function(req, res, next) {
  res.render('createUser', {});
});

/* GET login user page. */
router.get('/login', function(req, res, next) {
  res.render('loginUser', {});
});

/* GET success for login */
router.get('/success', isLoggedIn, function(req, res, next) {
  res.render('success', {user: req.session.userName});
});

module.exports = router;
