var mysql = require('mysql');

var exports = module.exports = {};

const conn = mysql.createConnection({
	host: process.env.DBHOST,
	user: process.env.DBUSER,
	password: process.env.DBPASS,
	database: process.env.DBDB,
	port: 3306
});


exports.checkExisting = function(userid, callback) {
	conn.query("SELECT * FROM `discordTokens` WHERE userid = ?", [userid], function(err, result) {
		if(err) callback(err, null);
		else callback(null, result);	
	});
}

// Insert Discord Token for user
exports.insertToken = function(username, discriminator, mfa_enabled, userid, avatar, token, expires_in, refresh_token, callback) {

	console.log(username);
	console.log(discriminator);
	console.log(mfa_enabled);
	console.log(userid);
	console.log(avatar);
	console.log(expires_in);
	console.log(refresh_token);

	var dateNow = new Date().toISOString().slice(0,19).replace('T', ' ');
	conn.query("INSERT INTO `discordTokens` (username, discriminator, mfa_enabled, userid, avatar, access_token, expires_in, refresh_token, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [username, discriminator, mfa_enabled, userid, avatar, token, expires_in, refresh_token, dateNow, dateNow], function(err, result) {
		if(err) console.log(err.toString()); //this.errorLog("INSERT", "DISCORDTOKENS", err.toString());
		else callback(null, result);
	});
}


// Update Discord Token for user
exports.updateToken = function(userid, username, mfa_enabled, avatar, token, expires_in, refresh_token, callback) {
	var dateNow = new Date().toISOString().slice(0,19).replace('T', ' ');
	conn.query("UPDATE`discordTokens` SET username = ?, mfa_enabled = ?, avatar = ?, access_token = ?, expires_in = ?, refresh_token = ?, updated = ? WHERE userid = ?", [username, mfa_enabled, avatar, token, expires_in, refresh_token, dateNow, userid], function(err, result) {
		if(err) console.log(err.toString()); //this.errorLog("INSERT", "DISCORDTOKENS", err.toString());
		else callback(null, result);
	});
}

// Refresh token ???


//
// Error logs
//
exports.errorLog = function(type, description, error, callback) {
	var dateNow = new Date().toISOString().slice(0,19).replace('T', ' ');
	conn.query("INSERT INTO `discordErrorLogs` (type, description, error, created) VALUES (?,?,?,?)", [type, description, error, dateNow], function(err, result) {
		if(err) callback(err, null);
		else callback(null, result);
	});
}
