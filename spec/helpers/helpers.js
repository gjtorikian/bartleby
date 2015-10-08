let path = require('path'),
    fs = require('fs'),
    _  = require('lodash');

beforeEach(function() {
  this.FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');
  this.outfile = function(filename) {
    return _.trim(fs.readFileSync(path.join(this.FIXTURES_DIR, "_site", filename), 'utf8'));
  }
  this.realfile = function(dirname, filename) {
    return _.trim(fs.readFileSync(path.join(this.FIXTURES_DIR, dirname, filename), 'utf8'));
  }
});
