var path = require("path");

describe("Simple renderer", function() {
  beforeEach(function(done) {
    this.runBuild(path.join(this.FIXTURES_DIR, "simple"), function() {
      done();
    });
  });

  it("should render simple Markdown", function() {
    expect(this.outfile("simple", "index.html")).toMatch(this.realfile("simple", "simple.html"));
  });

  it("should render intros", function() {
    expect(this.outfile("intro", "index.html")).toMatch(this.realfile("simple", "intro.html"));
  });

  it("should render header links", function() {
    expect(this.outfile("headers", "index.html")).toMatch(this.realfile("simple", "headers.html"));
  });

  it("should render emoji links", function() {
    expect(this.outfile("emoji", "index.html")).toMatch(this.realfile("simple", "emoji.html"));
  });
});

describe("Frontmatter renderer", function() {
  beforeEach(function(done) {
    this.runBuild(path.join(this.FIXTURES_DIR, "frontmatter"), function() {
      done();
    });
  });

  it("should render conrefs in frontmatter", function() {
    expect(this.outfile("title", "index.html")).toEqual(this.realfile("frontmatter", "title.html"));
  });

});
