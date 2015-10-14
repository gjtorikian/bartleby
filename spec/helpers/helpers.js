var path = require("path"),
    fs = require("fs"),

    graffito = require("../../main"),
    _  = require("lodash");

beforeEach(function() {
  this.FIXTURES_DIR = path.join(__dirname, "..", "fixtures");

  this.outfile = function(dirname, filename) {
    var outfile = _.trim(fs.readFileSync(path.join(this.FIXTURES_DIR, "_site", dirname, filename), "utf8"));
    return outfile.replace(/^\s*\n/gm, "");
  }

  this.realfile = function(dirname, filename) {
    var realfile = _.trim(fs.readFileSync(path.join(this.FIXTURES_DIR, dirname, filename), "utf8"));
    return realfile.replace(/^\s*\n/gm, "");
  }

  this.runBuild = function(src, callback) {
    graffito({ base: "spec/fixtures/sample/" }, [
      {
        source: src,
        destination: path.join(this.FIXTURES_DIR, "_site"),
        directory: path.join(this.FIXTURES_DIR, "layouts")
      }
    ]).then(function (result) {
      return callback();
    });
  };
});
