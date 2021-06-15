const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UsermodelSchema = new Schema({
  fullname: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: String,
  password: String,
  hash: String,
  salt: String,
});

const Usermodel = mongoose.model("Usermodel", UsermodelSchema);

module.exports = Usermodel;
