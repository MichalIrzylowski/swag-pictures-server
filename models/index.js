const mongoose = require("mongoose");

mongoose.set("debug", true);

mongoose.Promise = Promise;

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/swag-pictures",
  {
    keepAlive: true,
    useNewUrlParser: true
  }
);

module.exports.User = require("./User");
module.exports.Picture = require("./Picture");
module.exports.Comment = require("./Comment");
