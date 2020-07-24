const express = require("express");
const app = express();
require("dotenv").config({ path: "variables.env" });
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const TwitterStrategy = require("passport-twitter").Strategy;
const anon = require("./anonymous_tweet");

// set up Express for Twitter auth with no saving of profile information
app.locals.env = process.env;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "pug");

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.APP_SECRET,
  })
);

// set up Twitter strategy for checking if user is verified
passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_KEY,
      consumerSecret: process.env.TWITTER_SECRET,
      callbackURL: process.env.CALLBACK,
    },
    function (token, tokenSecret, profile, done) {
      // pass profile for verificiation check, no tokens
      done(null, profile);
    }
  )
);

// define route for user to start using the service
app.get("/auth", passport.authenticate("twitter"));

// define callback and re-route according to verification status
app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/" }),
  function (req, res) {
    // check to see if verified was returned in the request body
    if (req.user._json.verified) {
      // allow the user to tweet if so
      res.render("tweet", {
        title: "Access granted",
        secret: process.env.SECRET,
      });
    } else {
      // deny access if not
      res.render("no_auth", {
        title: "Access denied",
        secret: process.env.SECRET,
      });
    }
  }
);

// define route for sending tweet
app.post("/tweet", anon.tweet);

// define port for Express server
app.listen(process.env.PORT || 5000);
