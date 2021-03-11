var express = require('express');
var router = express.Router();
const User = require('./models').User;
const passport = require('passport');
const LocalStrategy = require('passport-local')
const session = require('express-session')

var authRouter = function(passport) {
  /* GET home page. */
  // router.get('/signup', function(req, res){
  //   // res.render('signup');
  // });

  // router.get('/login', function(req, res) {
  //   console.log("LOGIN GET");
  //   // res.render(login')
  // });
  router.post('/registration', function(req, res) {
    //check uniqueness
    User.find({
        email: req.body.email
      })
      .then((uniqueuser) => {
        if (uniqueuser.length !== 0) {
          console.log('email exists', uniqueuser);
          res.send("username taken")
        } else {
          let user = {};
          user.firstName = req.body.firstName
          user.lastName = req.body.lastName
          user.email = req.body.email
          user.password = req.body.password
          let newUser = new User(user)
          newUser.save()
            .then((saved) => {
              console.log("User saved in DB", saved)
              res.json({
                success: true
              })
            })
            .catch((err) => {
              console.log("Error occured in saving", err)
            })
        }
      })
  });

  //user null if not logged in
  router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (!err && user) {
        req.login(user, (err) => {
          if (err) {
            console.log("err")
            res.status(500)
              .json({
                success: false,
                err: err
              });
          } else {
            res.status(200)
              .json({
                success: true
              });
          }
        })
      } else {
        res.status(500)
          .json({
            success: false
          });
      }
    })(req, res, next);
  });


  router.get('/getUser', (req, res, next) => {
    res.json({
      user: req.user
    })
  })

  router.get('/logout', function(req, res) {
    console.log('hit logout route');
    req.logout();
  });



  return router;
}

module.exports = {
  authRouter: authRouter,
}
