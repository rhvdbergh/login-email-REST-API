var express = require('express');
var router = express.Router();
var User = require('../schemas/UserSchema');

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
      console.log('request received');
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

module.exports = router;
