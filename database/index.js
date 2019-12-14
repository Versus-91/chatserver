var config = require('../config');
var mongoose = require('mongoose');

// Connect to the database
// construct the database URI and encode username and password.

var dbURI = "mongodb://" +
	encodeURIComponent(config.db.username) + ":" +
	encodeURIComponent(config.db.password) + "@" +
	config.db.host + ":" +
	config.db.port + "/" +
	config.db.name;

var connect = function () {
	mongoose.connect(dbURI,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true
		},
		function (err) {
			if(err)
				console.log('not connected t mongo');
		});
		console.log('Connect to mongo');
}


module.exports = {
	mongoose,
	connect
}