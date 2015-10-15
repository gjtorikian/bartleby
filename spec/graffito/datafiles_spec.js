var fs = require("fs"),
    path = require("path");

describe("Datafiles", function() {
  beforeEach(function(done) {
    this.runBuild("datafiles", function() {
      done();
    });
  });

  it("doesn't blow up if data file is empty", function() {
    expect(this.outfile("empty", "index.html")).toEqual(this.realfile("datafiles", "empty.html"));
  });

  it("processes conditionals in data files", function() {
    expect(this.outfile("conditional", "index.html")).toEqual(this.realfile("datafiles", "conditional.html"));
  });
});
