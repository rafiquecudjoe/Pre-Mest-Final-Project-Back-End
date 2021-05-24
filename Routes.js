const express = require("express");
const Usermodel = require("./Usermodel");
const checkUser = require("./Middleware");
const Router = express();
const uuid = require("uuid").v4;
const { genPassword, validPassword } = require("./lib/Password");
const passport = require("passport"); //Imports Passport
const jwt = require("jsonwebtoken");

const expirationtimeInMs = 600000;
const secret = "wow123";

//Login Route
Router.post("/login", async function (request, response) {
  const { email, password } = request.body;

  let responseData = await Usermodel.findOne({ email });

  if (responseData) {
    const isValid = validPassword(
      password,
      responseData.salt,
      responseData.hash
    );

    if (isValid) {
      const payload = {
        email: responseData.email,
        expiration: Date.now() + parseInt(expirationtimeInMs),
      };

      const token = jwt.sign(JSON.stringify(payload), secret);
      response
        .cookie("jwt", token, {
          httpOnly: true,
          secure: false, //--> SET TO TRUE ON PRODUCTION
        })
       .status(200)
        .send({ success: true, message: "Successful" });
    } else {
      response
        .status(300)
        .send({ failure: true, message: "Wrong username or password" });
    }
  } else {
    response.status(400).send({ goaway: true, message: "User does not exist" });
  }
});

//Signup Route
Router.post("/signup", async function (request, response) {
  const { fullname, email, username, password } = request.body;

  const saltHash = genPassword(password);

  const salt = saltHash.salt;
  const hash = saltHash.hash;

  let newUser = new Usermodel({
    fullname,
    email,
    username,
    salt,
    hash,
  });

  let responseData = await newUser.save();

  if (responseData) {
    response.status(200).send({ success: true, message: responseData });
  } else {
    response
      .status(400)
      .send({ success: false, message: "User Already Exist" });
  }
});

//Homepage Route

// console.log('inside the homepage callback function')

Router.post("loging", (request, response) => {
  response.status(600).send("Helooo");
});

//Protected Route

Router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).json({
      message: "welcome to the protected route!",
    });
  }
);
module.exports = Router;
