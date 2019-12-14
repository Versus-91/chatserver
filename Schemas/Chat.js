var Mongoose = require("../database").mongoose;
var TypeUser = require("./TypeUser");
var OperatorUnit = require("./OperatorUnit");
var Cost = require("./Cost");
var BlockObject = require("./BlockObject");
var TypeMessageObject = require("./TypeMessageObject");
var ChatSchema = new Mongoose.Schema({
  createdDate: { type: Date, required: false },
  lastSeen: { type: Date, required: false },
  typeMessage: { type: TypeMessageObject, required: false },
  senderType: { type: TypeUser, required: false },
  recieverType: { type: TypeUser, required: false },
  unit: { type: OperatorUnit, required: false },
  starterId: { type: Number, required: true },
  starterName: { type: String, required: true },
  recieverId: { type: Number, required: false },
  recieverName: { type: String, required: false },
  blockObjects: { type: Array, required: false },
  ScoreAverage: { type: Number, required: false, min: 0, max: 5 },
  cost: { type: Cost, default: Cost.False }
});

var ChatModel = Mongoose.model("Chat", ChatSchema);

module.exports = ChatModel;
