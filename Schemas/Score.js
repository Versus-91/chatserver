var Mongoose  = require('../database').mongoose;

var ScoreSchema = new Mongoose.Schema({
    chatId: { type: String, required: false },
    createdDate: { type: Date, required: false, default:Date.now },
    operatorId: {type: Number, required: true},
    userId: { type: Number, required: false },
    score: { type: Number, required: false },    
});

var ScoreModel = Mongoose.model('Score', ScoreSchema);

module.exports = ScoreModel;
