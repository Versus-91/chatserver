var Mongoose  = require('../database').mongoose;

var MessageRecieveObjectSchema = new Mongoose.Schema({
    recieverId: { type: Number, required: true },
    createdDate: { type: Date, required: true, default:Date.now },

});

var MessageRecieveObjectModel = Mongoose.model('MessageRecieveObject', MessageRecieveObjectSchema);

module.exports = MessageRecieveObjectModel;
