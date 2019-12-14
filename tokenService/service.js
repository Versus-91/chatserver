var fs = require("fs"),
  private = fs.readFileSync(__dirname + "\\private.key"),
  public = fs.readFileSync(__dirname + "\\public.key");

function getPrivate() {
  return private.toString();
}

function getPublic() {
  return public.toString();
}

module.exports = {
  getPrivate,
  getPublic
};
