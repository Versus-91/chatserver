var Mongoose  = require('../database').mongoose;
var UserType  =require('./TypeUser')
var OperatorUnit  =require('./OperatorUnit')


var UserConnectionSchema = new Mongoose.Schema({
    userId: { type: Number, required: true},
    connectionId: { type: String, require: false},
    chatIds: { type: [String], required: true},
    unit: {type: OperatorUnit, required : false},
    userType: {type: UserType, required : false, min: 1, max: 3},
    firstConnectionDate: { type: Date,required: false},
    lastSeen: { type: Date, required: false},
});

var UserConnectiondModel = Mongoose.model('UserConnection', UserConnectionSchema);

module.exports = UserConnectiondModel;