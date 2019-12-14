var Mongoose  = require('../database').mongoose;

var MessageSeenObjectSchema = new Mongoose.Schema({
    seenId: { type: Number, required: true },
    createdDate: { type: Date, required: true, default:Date.now },

});

var MessageSeenObjectModel = Mongoose.model('MessageSeenObject', MessageSeenObjectSchema);

module.exports = MessageSeenObjectModel;
