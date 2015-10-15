var path = require("path");

describe("Simple renderer", function() {
  beforeEach(function(done) {
    this.runBuild("simple", function() {
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

  // it should protect against `{% tags %}`
});

describe("Frontmatter renderer", function() {
  beforeEach(function(done) {
    this.runBuild("frontmatter", function() {
      done();
    });
  });

  it("should render conrefs in frontmatter", function() {
    expect(this.outfile("title", "index.html")).toEqual(this.realfile("frontmatter", "title.html"));
  });

  it("should render audiences in frontmatter", function() {
    expect(this.outfile("audience", "index.html")).toEqual(this.realfile("frontmatter", "audience.html"));
    expect(this.outfile("different", "index.html")).toEqual(this.realfile("frontmatter", "different.html"));
  });
});
