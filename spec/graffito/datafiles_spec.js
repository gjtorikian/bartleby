var fs = require("fs"),
    path = require("path");

describe("Datafiles", function() {

  // works
  // doesn't blow up if data file is empty

  // beforeEach(function(done) {
  //   this.runBuild(path.join(this.FIXTURES_DIR, "redirects"), function() {
  //     done();
  //   });
  // });
  //
  // it("should implement a redirect from page", function() {
  //   let outfile = fs.readFileSync(path.join(this.FIXTURES_DIR, "_site", "articles", "how-do-i-add-links-to-my-wiki", "index.html"))
  //   expect(outfile).toMatch(`<meta http-equiv=refresh content="0; url=${this.FIXTURES_DIR}/_site/redirect_from/">`);
  // });
  //
  // it("should implement a redirect to a page", function() {
  //   let outfile = fs.readFileSync(path.join(this.FIXTURES_DIR, "_site", "redirect_to", "index.html"))
  //   expect(outfile).toMatch(`<meta http-equiv=refresh content="0; url=https://github.com/capistrano/capistrano/blob/master/README.md">`);
  // });
});
