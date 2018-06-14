var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var dataSchema = new mongoose.Schema({
  uname: {type: String},  
  fname: { type: String},
  lname: { type: String},
  place: {type: String},
  email: {type: String, unique:true}
});

module.exports = mongoose.model("data", dataSchema);