const Pool = require("pg").Pool;
const pool = new Pool({
  host: "185.135.229.111",
  port: "5432",
  database: "LoginDb",
  user: "postgres",
  password: "mty110"
});

var searchUsers = function(text, callback) {
  pool.query(
    'SELECT * FROM public."Users"' + ' WHERE "Username" ' + "LIKE " + "$1",
    ["%" + text + "%"],
    (error, users) => {
      if (error) {
        throw error;
      }

      callback(users.rows);
    }
  );
};

var getUserName = function(userId, callback) {
  if (!userId) {
    callback(null);
    return;
  }
  pool.query(
    'SELECT * FROM public."Users"' + ' WHERE "UserId" = $1',
    [userId],
    (error, users) => {
      if (error) {
        throw error;
      }
      callback(users.rows[0].Username);
    }
  );
};

module.exports = {
  searchUsers,
  getUserName
};
