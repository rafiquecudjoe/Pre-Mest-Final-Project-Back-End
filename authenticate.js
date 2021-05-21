var passport = require('passport-local-mongoose')
var LocalStrategy = require('passport-local').Strategy;
var User = require('./User')


passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())