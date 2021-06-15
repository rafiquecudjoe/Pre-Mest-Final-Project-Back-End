const express = require("express");
const Usermodel = require("../models/Usermodel");
const Token = require("../models/Tokenmodel");
const Router = express();
const uuid = require("uuid").v4;
const { genPassword, validPassword } = require("../lib/Password");
const passport = require("passport"); //Imports Passport
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const expirationtimeInMs = process.env.TOKENEXPIRATION;
const secret = process.env.SECRET;
JWT_SECRET = process.env.JWT_SECRET;
bcryptSalt = process.env.BCRYPT_SALT;
clientURL = process.env.CLIENT_URL;

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

Router.post("/requestResetPassword", async function (resquest, response, next) {
  const { email } = request.body;

  const user = await Usermodel.findOne({ email });

  if (!user) {
    throw new Error("User Already Exist");
  } else {
    let token = await Token.findOne({ userid: user.id });
    if (token) await token.deleteOne();

    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

    await new Token({
      userId: user.id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const link = `${clientURL}?token=${resetToken}&id=${user._id}`;
    const emailSent = await sendEmail(
      user.email,
      "Password Reset Request",
      { name: user.fullname, link: link },
      "./template/requestResetPassword.handlebars"
    );
    if (emailSent) {
      response.status(200).send({ success: true });
    } else {
      response
        .status(200)
        .send({ success: true, message: "Email Failed to send" });
    }
  }
  next();
});

Router.post('/passwordreset',async (request, response, next) => {
  const queryObject = url.parse(request.url, true).query;
  const { token, userId } = queryObject
  const { password } = request.body
  
  const passwordResetToken = await Token.findOne({ userId })
  if (!passwordResetToken) throw new Error('Invalid or Expired Password Reset Token')
  
  const isValid = await bcrypt.compare(token, passwordResetToken)
  if (!isValid) throw new Error('Invalid or Expired Password Reset Token')
  const hash = await bcrypt.hash(password, Number(bcryptSalt))
  
  await Usermodel.updateOne({_id:userId
  }, { $set: { password: hash } }, { new: true })
  
  const user = await Usermodel.findById({ _id: userId })
  const emailSent = await sendEmail(
    user.email,
    "Password Reset Successfully",
    { name: user.fullname,},
    "./template/resetPassword.handlebars"
  );
  if (emailSent) {
    response.status(200).send({ success: true,data: "Password Reset Seccuessful" });
  } else {
    response
      .status(300)
      .send({ failure: true, message: "Email Failed to send" });
  }

next();
  
  
})

Router.get("/users", async function (resquest, response) {
  let responseData = await Usermodel.find();

  response.status(200).send({ success: true, data: responseData });
});

module.exports = Router;
