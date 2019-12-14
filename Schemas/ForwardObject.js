var Mongoose = require("mongoose");
const Message = require("./Message");

var ForwardObjectSchema = new Mongoose.Schema({
  isReplied: { type: Boolean, required: true },
  message: { type: Message, required: false },
  userId: { type: Number, required: false }
});

var ForwardObjectModel = Mongoose.model("ForwardObject", ForwardObjectSchema);

module.exports = ForwardObjectModel;
