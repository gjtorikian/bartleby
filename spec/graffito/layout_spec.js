describe("Layout", function() {
  beforeEach(function(done) {
    this.runBuild("layout", function() {
      done();
    });
  });

  it("supports the slugify filter", function() {
    expect(this.outfile("slugified", "index.html")).toEqual(this.realfile("layout", "slugified.html"));
  });

});
