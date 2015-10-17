var bartleby = require("../main");

bartleby({
  base: "spec/fixtures/sample/",
  destination: "_site"
}, [
  {
    source: "content/dotcom",
    destination: "articles",
    template: "default.html"
  }
]);
