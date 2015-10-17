var bartleby = require("../../main");

describe("Maliciousness", function() {
  it("should complain if build is not an object", function(done) {
    bartleby(1234, [{}]).then(function() { }, function(reason) {
      expect(reason.message).toMatch("options are not an object");
      done();
    });
  });

  it("should complain if build is empty", function(done) {
    bartleby({}, [{}]).then(function() { }, function(reason) {
      expect(reason.message).toMatch("options are empty");
      done();
    });
  });

  it("should complain if build.base is empty", function(done) {
    bartleby({foo: 123}, [{}]).then(function() { }, function(reason) {
      expect(reason.message).toMatch("missing the `base` key");
      done();
    });
  });

  it("should complain if buildOptions is not an array", function(done) {
    bartleby({base: 123}).then(function() { }, function(reason) {
      expect(reason.message).toMatch("build options are not an array");
      done();
    });
  });

  it("should complain if buildOptions is empty", function(done) {
    bartleby({base: 123}, []).then(function() { }, function(reason) {
      expect(reason.message).toMatch("build options are empty");
      done();
    });
  });
});
