var Metalsmith = require("metalsmith");
var renderer = require('../../plugins/renderer');
var fs = require('fs'),
    path = require('path');

describe("Simple renderer", function() {
  beforeEach(function(done) {
    Metalsmith(__dirname)
    .source(path.join(this.FIXTURES_DIR, "simple"))
    .destination(path.join(this.FIXTURES_DIR, "_site"))
    .use(renderer.markdown)
    .build(function(e) {
      done();
    });
  });

  it("should render simple Markdown", function() {
    expect(this.outfile("simple.html")).toEqual("<p><strong>Wow!</strong> Markdown!</p>");
  });

  it("should render admonitions", function() {
    expect(this.outfile("admonition.html")).toMatch(this.realfile("simple", "intro.html"));
  });
});

