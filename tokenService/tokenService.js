const jwt = require('jsonwebtoken'),
  randtoken = require('rand-token'),
  services = require('./service'),
  signOptions = require('../config/config.json').signOptions,
  db = require('../Repo/MongoRepository'),
  tokenModel = require('../Schemas/Token').token;

var tokenRepo = new db.repository(tokenModel);

function signToken(userSessionId, userId, callback) {
  let user = tokenRepo.FindByCondition({
    userSessionId: userSessionId
  }, (err, token) => {
    if (err) throw err;

    if (!token[0]) {
      let claims = {
        userSessionId: userSessionId,
        userId: userId
      };

      let hashToken = jwt.sign(claims, 'This is secret key', signOptions);
      let refreshToken = randtoken.uid(32);

      let token = new tokenModel({
        userSessionId: userSessionId,
        hashToken: hashToken,
        refreshToken: refreshToken,
        expireDateTime: Date.now()
      });

      tokenRepo.Insert(token);

      let obj = {
        hashToken: token.hashToken,
        refreshToken: token.hashToken
      };

      return callback(obj);
    } else {
      let claims = {
        userSessionId: userSessionId,
        userId: userId
      };
      let hashToken = jwt.sign(claims, 'This is secret key', signOptions);
      let refreshToken = randtoken.uid(32);

      tokenRepo.Update({
        userSessionId: userSessionId
      }, {
        hashToken: hashToken,
        refreshToken: refreshToken,
        expireDateTime: Date.now()
      });

      let obj = {
        hashToken: hashToken,
        refreshToken: hashToken
      };

      return callback(obj);
    }
  });
}

function verifyToken(token) {
  var result = jwt.verify(token, 'This is secret key', signOptions);
  return result;
}

function checkRefreshToken(refreshToken, userId, callback) {
  var token = tokenRepo.FindByCondition({
      refreshToken: refreshToken
    },
    (err, token) => {
      if (err) {
        throw err;
      } else {
        if (!token) {
          return 'user doesnt already have token';
        } else {
          let claims = {
            userSessionId: token.userSessionId,
            userId: userId
          };

          let hashToken = jwt.sign(claims, 'This is secret key', signOptions);
          let refreshToken = randtoken.uid(32);

          tokenRepo.Update({
            userSessionId: userSessionId
          }, {
            hashToken: hashToken,
            refreshToken: refreshToken,
            expireDateTime: Date.now()
          });

          obj = {
            hashToken: hashToken,
            refreshToken: hashToken
          };

          return callback(obj);
        }
      }
    });
}

module.exports = {
  signToken,
  verifyToken,
  checkRefreshToken
};