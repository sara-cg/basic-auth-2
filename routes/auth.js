var express = require('express');
var bcrypt = require('bcrypt');
const bcryptSalt     = 10;
var User = require('../models/User');
var router = express.Router();


function withTitle(c, title) {
  c.title = title || 'Titulo no definido';
  return c;
}

/* GET auth route login form */
router.get('/signup', function(req, res, next) {
  res.render('signup', withTitle({}, 'SignupFormulario'));
});

router.post('/signup', function(req, res, next) {
  console.log(req.body);

  if (req.body.username === "" || req.body.password === "") {
    return res.render('signup',
      withTitle({
        errorMessage: "Indicate a username and a password to sign up"
      }));
  }

  User.findOne({
    "username": req.body.username
  }, "username", (err, user) => {
    if (user !== null) {
      console.log("EL usuario existe");
      return res.render('signup',
      withTitle({
        errorMessage: "The username already exists"
      }));
    }
    var username = req.body.username;
    var password = req.body.password;
    var salt = bcrypt.genSaltSync(bcryptSalt);
    var hashPass = bcrypt.hashSync(password, salt);

    var newUser = User({
      username:req.body.username,
      password: hashPass
    });

    newUser.save((err) => {
      if (err) {
        res.render("signup", withTitle({
          errorMessage: "Something went wrong"
        }));
      } else {
        console.log("OK");
        res.redirect("/");
      }
    });
  });
});


/* GET auth route login form */
router.get('/login', function(req, res, next) {
  res.render('login', withTitle({}, 'Login Formulario'));
});

/* GET auth route login form */
router.post('/login', function(req, res, next) {
  console.log(req.body);

  let username = req.body.username;
  let password = req.body.password;

  if (username === "" || password === "") {
    return res.render("login", withTitle({
      errorMessage: "Indicate a username and a password to sign up"
    },'Login Formulario'));
  }

  User.findOne({ "username": username }, (err, user) => {
    if(err){
      return res.render("login", withTitle({
        errorMessage: err
      },'Login Formulario'));
    }else{
      console.log(user);
      // Comprobamos que el hash del password del objeto
      //  user sea igual al hash que recibo en el POST
      if(bcrypt.compareSync(password,user.password)){
        // BIEN! El password es correcto
        console.log("Password correcto");
        req.session.currentUser = user;
        return res.redirect("/");
      }else{
        console.log("Password incorrecto");
        return res.render("login", withTitle({
          errorMessage: "Oye tio, pon bien el password"
        },'Login Formulario'));
      }
    }

  });

});


router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    // cannot access session here
    res.redirect("/");
  });
});


module.exports = router;
