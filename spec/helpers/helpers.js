let path = require("path"),
    fs = require("fs"),
    _  = require("lodash");

beforeEach(function() {
  this.FIXTURES_DIR = path.join(__dirname, "..", "fixtures");
  this.outfile = function(filename) {
    var outfile = _.trim(fs.readFileSync(path.join(this.FIXTURES_DIR, "_site", filename), "utf8"))
    return outfile.replace(/^\s*\n/gm, "");
  }
  this.realfile = function(dirname, filename) {
    var realfile = _.trim(fs.readFileSync(path.join(this.FIXTURES_DIR, dirname, filename), "utf8"));
    return realfile.replace(/^\s*\n/gm, "");
  }
});
