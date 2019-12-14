var Mongoose  = require('../database').mongoose;
var UserType  =require('./TypeUser')

var UserBannedSchema = new Mongoose.Schema({
    createdDate: { type: Date, required: true, default:Date.now },
    userId: { type: Number, required: false},
    ownerId: {type: Number, required : false},
    operatorId: {type: BigInt, required : false},
    userType: {type: UserType, required : false, min:1, max:3},
    expireDate: { type: Date,required:false},
    status: {type: Boolean,required: false}
});

var UserBannedModel = Mongoose.model('UserBanned', UserBannedSchema);

module.exports = UserBannedModel;