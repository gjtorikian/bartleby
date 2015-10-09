var graffito = require('../main')

graffito([
  {
    source: "spec/fixtures/sample/content/dotcom/articles",
    destination: "_site/",
    directory: "spec/fixtures/sample/layouts",
    partials: "spec/fixtures/sample/layouts/includes"
  }
]);
