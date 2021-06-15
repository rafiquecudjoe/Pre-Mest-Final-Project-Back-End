const express = require("express");  //server software
const cors = require("cors");   //imports cross-origin
const Passport = require('passport')   // imports passport 
const Router = require("./Routes/Routes");  //imports Router
const connectDB = require("./Db");   //  imports Database connection
const passport = require("passport");   //authetification
const session = require('express-session')   //session middleware
const uuid = require('uuid').v4
const connectEnsureLogin = require('connect-ensure-login') //authorization
const Usermodel = require('./models/Usermodel'); // User Model 
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser')  //imports cookie-parser
require('express-async-errors')
require('dotenv').config();
// require('./auth/passport')








const server = express();

// session middleware
// server.use(session({
//   genid: (request) => {
//     console.log('Inside the session middleware')
//     console.log(request.sessionID)
//     return uuid()  // use UUIDs for Session IDs
//   },
//   store:MongoStore.create({
//     mongoUrl: "mongodb+srv://admin:adm'n@cluster0.cvhh9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
   
//   }) ,  // MongoDB Connection for Sessions
//   secret: 'express delivery',
//   resave: false,
//   resave: false,
//   saveUninitialized: true,
//   cookie: { maxAge: 60 * 60 * 1000 }  //1hour
// }))

const port = 7000;


// configures more  middlewares
server.use(cors());
server.use(express.json());
server.use(cookieParser())   //CookieParser middleware
server.use(express.urlencoded({ extended: true })) //Middleware
server.use(passport.initialize())   //Passport middleware
// server.use(passport.initialize())
// server.use(passport.session())

connectDB();


server.use("/api/v1", Router);
server.use((error, request, response, next) => {
  
  response.status(500).send({ error: error.message })
  next()
  
})

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running at ${port}`);
  
});
