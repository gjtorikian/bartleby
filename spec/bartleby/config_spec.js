describe("Config", function() {
  beforeEach(function(done) {
    this.runBuild("config", function() {
      done();
    });
  });

  it("supports config variables", function() {
    expect(this.outfile("variables", "index.html")).toEqual(this.realfile("config", "variables.html"));
  });

});
