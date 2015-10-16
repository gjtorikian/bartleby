var graffito = require("../main");

graffito({
  base: "spec/fixtures/sample/",
  destination: "_site"
}, [
  {
    source: "content/dotcom",
    destination: "articles",
    template: "default.html"
  }
]);
