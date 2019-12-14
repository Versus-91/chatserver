var Mongoose  = require('../database').mongoose;

var BlockObjectSchema = new Mongoose.Schema({
    blockerId: { type: Number, required: true },
    isStarter: { type: Boolean, required: false },
    expireDate: { type: Date, required: false },
    status: { type: Boolean, required: false },

});

var BlockObjectModel = Mongoose.model('BlockObject', BlockObjectSchema);

module.exports = BlockObjectModel;
