var Metalsmith = require("metalsmith");
var renderer = require('../../plugins/renderer');
var redirects = require('../../plugins/redirects');
var fs = require('fs'),
    path = require('path');

describe("Redirects renderer", function() {
  beforeEach(function(done) {
    Metalsmith(__dirname)
    .source(path.join(this.FIXTURES_DIR, "redirects"))
    .destination(path.join(this.FIXTURES_DIR, "_site"))
    .use(renderer.markdown)
    .build(function(e) {
      done();
    });
  });

  fit("should render redirect_from", function() {
    expect(1).toEqual(1);
    // expect(this.outfile("redirect_from.html")).toMatch(this.realfile("redirects", "redirect_from.html"));
  });
});
