var express = require("express");
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var mongoose = require("mongoose");
var user = require("./models/user");
var data = require("./models/data");
var path = require("path");
var jwt = require("jsonwebtoken");

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
mongoose.connect("mongodb://localhost/healthvings-task");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(require("express-session")({
  secret: "MySecret",
  resave: false,
  saveUninitialized: false
}));

app.set("view engine", "ejs");
app.use(passport.initialize());
app.use(passport.session());

// serializeUser will take data from the session which is encoded and decodes the data.
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/dashboard", isLoggedIn, function(req, res) {
      res.render("dashboard");
}); 

app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureRedirect: "/login"
}), function(req, res) {
  const user = {
    user: req.user.username
  }
  const token = jwt.sign({user}, "mysecretkey");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  user.register(new user({
    username: req.body.username
  }), req.body.password, function(err, user) {
    if (err) {
      console.log(err);
    }
    passport.authenticate("local")(req, res, function() {
      res.redirect("/dashboard");
    });
  });
});

app.post("/dashboard", function(req, res){
  var obj = {
    uname: req.user.username,
    fname: req.body.fname,
    lname: req.body.lname,
    place: req.body.place,
    email: req.body.email 
  };
  data.create(obj, function(err, datac){
    if(err){
      console.log(err);
    }else{
      res.redirect("show");
    }
    
  })
});

app.get("/logout", function(req, res) {
  //passport will destroy all the user data in the session
  req.logout();
  res.redirect("/")
});

app.get("/show", isLoggedIn, function(req, res){
  data.find({}, function(err, all){
    if(err) throw err;
    res.render("show", {all:all} );
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    //Herre the next method will tell express to execute the call back function(req, res)
    // only if  Authenticated
    return next();
  }
  res.redirect("/login");
}

function ensureToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.redirect("/home");
  }
}

function assignToken(req, res, next){
  const user = {
    user: req.user.username
  }
  const token = jwt.sign({user}, "mysecretkey");
  next();
}

app.listen(3000, function() {
  console.log("Server Started at 3000");
});
