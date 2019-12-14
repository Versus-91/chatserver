var Mongoose  = require('mongoose');
var FileType  = require('./FileType');
var FileObjectSchema = new Mongoose.Schema({
    fileType: { type: FileType, required: true },
    caption: { type: String, required: false },
    fileName: { type: String, required: true },
    destinationUrl: { type: String, required: true },

});

var FileObjectModel = Mongoose.model('FileObject', FileObjectSchema);

module.exports = FileObjectModel;
