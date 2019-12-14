var Mongoose  = require('../database').mongoose;
var UserType =require('./TypeUser')
var ReportType =require('./ReportType')

/**
 *
 */
var UserReportSchema = new Mongoose.Schema({
    createdDate: { type: Date, required: true },
    reportType: { type: ReportType, required: true},
    targetUserType: { type: UserType, required: true},
    targetUserId: { type: Number, required: true},
    targetMessageId: {type: Mongoose.mongo.ObjectID, required: true},
    targetChatId: {type: Mongoose.mongo.ObjectID, required: true},
    answerStatus: {type: Boolean}, //true=answered
    operatorId: { type: Number, required: true},
});

var UserReportModel = Mongoose.model('UserReport', UserReportSchema);

module.exports = UserReportModel;



    