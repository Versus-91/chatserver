var Mongoose  = require('../database').mongoose;
var MessageRecieveObject  = require('./MessageRecieveObject');
var MessageSeenObject  = require('./MessageSeenObject');
var ForwardObject  = require('./ForwardObject').schema;
var MessageStatus  = require('./MessageStatus');
var FileObject  = require('./FileObject').schema;
var MessageSchema = new Mongoose.Schema({
    createdDate: { type: Date, required: true, default: Date.now },
    chatId: { type: String, required: true },
    senderId: {type: Number, required: false},
    senderName: {type: String, required: false},
    recieveObject: {type: Array,required: false},
    seenObject: {type: Array, required: false},
    forward: {type: ForwardObject, required: false},
    messageStatus: {type: MessageStatus, required: true, default: MessageStatus.send},
    text: {type: String, required: false},
    location: {type: String, required: false},
    fileObject: {type: FileObject, required: false},
    isNotification: {type: Boolean, required: false, default: false},
    userReportId: {type: Mongoose.mongo.ObjectID, required: false},
});

var MessageModel = Mongoose.model('Message', MessageSchema);

module.exports = MessageModel;
