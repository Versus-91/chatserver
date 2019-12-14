const mongoose = require('../database').mongoose,
    schema = mongoose.Schema;

let tokenModel = new schema({
    userSessionId: {
        type: Number,
        required: true
    },
    hashToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    expireDateTime: {
        type: Date
    }
});

let token = mongoose.model('token', tokenModel);

module.exports = {
    token
};