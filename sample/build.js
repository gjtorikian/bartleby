var graffito = require("../main");

graffito({
  data: "spec/fixtures/sample/data"
}, [
  {
    source: "spec/fixtures/sample/content/dotcom/articles",
    destination: "_site/articles",
    directory: "spec/fixtures/sample/layouts",
    partials: "spec/fixtures/sample/layouts/includes"
  }
]);
