var path = require("path"),
    fs = require("fs"),

    rimraf = require("rimraf"),
    bartleby = require("../../main"),
    _  = require("lodash");

beforeEach(function() {
  this.FIXTURES_DIR = path.join(__dirname, "..", "fixtures");
  rimraf.sync(path.join(this.FIXTURES_DIR, "_site"));

  this.outfile = function(dirname, filename) {
    var outfile = _.trim(fs.readFileSync(path.join(this.FIXTURES_DIR, "_site", dirname, filename), "utf8"));
    return outfile.replace(/^\s*\n/gm, "");
  }

  this.realfile = function(dirname, filename) {
    var realfile = _.trim(fs.readFileSync(path.join(this.FIXTURES_DIR, dirname, filename), "utf8"));
    return realfile.replace(/^\s*\n/gm, "");
  }

  this.runBuild = function(src, callback) {
    bartleby({ base: "spec/fixtures/", destination: "spec/fixtures/_site/" }, [
      {
        source: src,
        destination: "",
        template: "default.html",
        navigation: "data.categories.category"
      }
    ]).then(function (result) {
      return callback();
    });
  };

  this.build = function(build, buildOptions, callback) {
    bartleby(build, buildOptions).then(function(result) {
      return callback();
    });
  }
});
