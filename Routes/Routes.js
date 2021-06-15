const express = require("express");
const Usermodel = require("../Usermodel");

const Router = express();
const uuid = require("uuid").v4;
const { genPassword, validPassword } = require("../lib/Password");
const passport = require("passport"); //Imports Passport
const jwt = require("jsonwebtoken");
const crypto = require('crypto')
const bcrypt = require('bcrypt')

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
          secure: true, //--> SET TO TRUE ON PRODUCTION
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

  let valid = await Usermodel.findOne({ email });

  if (valid) {
    response.status(300).send({ success: false });
  } else {
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
      (err) => console.log(err);
    }
  }
});

//PAYMENT ROUTE

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

// Router.get('/users',async function (request, response) {

//   const responseData = await Usermodel.find()

//   response.status(200).send({success:true,data:responseData})

// })

Router.get("/users", async function (resquest, response) {
  let responseData = await Usermodel.find();

  response.status(200).send({ success: true, data: responseData });
});

Router.post("/forgotpassword", async function (request, response) {
  const { email } = request.body;
 

  let user = await Usermodel.findOne({ email });

  if (!user) throw new Error("User does not exist")

  let resetToken = crypto.randomBytes(32).toString("hex")

  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
 
 
  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();

  const link = `${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`;
  sendEmail(user.email,"Password Reset Request",{name: user.fullname,link: link,},"./template/requestResetPassword.handlebars");
  return link;


  
  


  // const oldname = { _id: valid._id };

  // const newname = { $set: { username: "rasgalazy6" } };

  // const update = await Usermodel.updateOne(oldname, newname);
  // if (update.nModified == 1) {
  //   console.log("Update Successful");
  // } else {
  //   console.log("Update Unsuccessful");
  // }

  if (valid) {
    response.status(200).send({ success: true });
  } else {
    response.status(300).send({ failure: true });
  }
});

Router.post("/updatepassword", function (resquest, response) {});

Router.post('/async-error-test', async (request, response) => {
  
  await async()

  response.send({well:"We are not going to reach this line"})
  
})
module.exports = Router;
