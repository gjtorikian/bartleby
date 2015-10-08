# graffito

A next generation documentation site.

``` bash
npm install
npm run build
```

## Data concepts

* `config`
* `data`
* `page`

## Usage

``` javascript
var graffito = require('graffito')

graffito([{
    source: "spec/fixtures/sample/content/dotcom/articles",
    destination: "_site/articles",
    directory: "spec/fixtures/sample/layouts",
    partials: "spec/fixtures/sample/layouts/includes"
  },
  {
    source: "spec/fixtures/content/post",
    destination: "_site/post",
    directory: "spec/fixtures/sample/layouts",
    partials: "spec/fixtures/sample/layouts/includes"
  }
]);

```

## Options

| Option | Description | Default |
| :----- | :---------- | :------ |
| `destination` | | `` |
| `directory` | | `` |
| `partials` | | `` |
| `source` | | `` |
